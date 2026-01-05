package com.crai.os.service;

import com.crai.os.config.SimulationConfig;
import com.crai.os.model.PoliceMessage;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.concurrent.*;

/**
 * PoliceService processes alerts produced by camera workers.
 *
 * Improvements made:
 * - Uses a bounded `LinkedBlockingQueue` to provide backpressure to camera workers
 *   (multi-stage pipeline flow control).
 * - Stores processed alerts in a concurrent queue and exposes immutable snapshots to callers.
 */
@Service
public class PoliceService {

    private static final Logger log = LoggerFactory.getLogger(PoliceService.class);

    private final BlockingQueue<PoliceMessage> queue;
    private final ConcurrentLinkedQueue<PoliceMessage> processed = new ConcurrentLinkedQueue<>();

    private final ExecutorService workerPool;
    private final ExecutorService webhookExecutor = Executors.newCachedThreadPool(r -> {
        Thread t = new Thread(r);
        t.setName("police-webhook-");
        t.setDaemon(true);
        return t;
    });
    private final RestTemplate restTemplate = new RestTemplate();
    private final String nodeRedWebhookUrl;

    public PoliceService(SimulationConfig config) {
        int capacity = Math.max(1, config.getPoliceQueueCapacity());
        this.queue = new LinkedBlockingQueue<>(capacity);
        this.nodeRedWebhookUrl = config.getNodeRedWebhookUrl();

        ThreadFactory policeFactory = r -> {
            Thread t = new Thread(r);
            t.setName("police-worker-1");
            t.setDaemon(true);
            return t;
        };
        this.workerPool = Executors.newSingleThreadExecutor(policeFactory);
    }

    @PostConstruct
    public void init() {
        log.info("🚓 PoliceService initialized. Starting alert worker... (queueCapacity={})", ((LinkedBlockingQueue<?>) queue).remainingCapacity() + queue.size());
        workerPool.submit(this::worker);
    }

    /**
     * Queue an alert. This method uses blocking `put` semantics to avoid dropping alerts and
     * to provide backpressure upstream (camera workers will block when the police queue is full).
     */
    public void sendAlert(PoliceMessage message) {
        log.info("📡 Queuing alert → {} for {} (from thread={})", message.getType(), message.getPlate(), Thread.currentThread().getName());
        try {
            queue.put(message);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Interrupted while queueing police alert for {}", message.getPlate(), e);
        }
    }

    private void worker() {
        while (true) {
            try {
                PoliceMessage msg = queue.take();

                log.info("🚨 POLICE ALERT [{}] - Plate: {} - {} (handled by thread={})", msg.getType(), msg.getPlate(), msg.getDescription(), Thread.currentThread().getName());

                processed.add(msg);

                // Forward to Node-RED webhook asynchronously if configured
                if (nodeRedWebhookUrl != null && !nodeRedWebhookUrl.isBlank()) {
                    webhookExecutor.submit(() -> {
                        try {
                            HttpHeaders headers = new HttpHeaders();
                            headers.setContentType(MediaType.APPLICATION_JSON);
                            HttpEntity<PoliceMessage> req = new HttpEntity<>(msg, headers);
                            restTemplate.postForEntity(nodeRedWebhookUrl, req, Void.class);
                            log.debug("Posted alert to Node-RED for plate={}", msg.getPlate());
                        } catch (RestClientException rce) {
                            log.warn("Failed to POST alert to Node-RED {} for plate {}", nodeRedWebhookUrl, msg.getPlate(), rce);
                        }
                    });
                }

            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.warn("Police worker interrupted, shutting down worker thread");
                break;
            } catch (Exception e) {
                log.error("Unexpected error in police worker", e);
            }
        }
    }

    /**
     * Return a snapshot of processed alerts to avoid exposing internal mutable collections.
     */
    public List<PoliceMessage> getProcessedAlerts() {
        return List.copyOf(processed);
    }

    public void clearAlerts() {
        queue.clear();
        processed.clear();
    }
}
