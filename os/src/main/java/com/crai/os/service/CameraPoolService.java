package com.crai.os.service;

import com.crai.os.model.AlertType;
import com.crai.os.model.ITVStatus;
import com.crai.os.model.PoliceMessageFactory;
import com.crai.os.model.Vehicle;
import com.crai.os.model.Owner;
import jakarta.annotation.PostConstruct;
import com.crai.os.config.SimulationConfig;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Set;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import com.crai.os.utils.BoundedPriorityBlockingQueue;
import com.crai.os.repository.OwnerRepository;

@Service
public class CameraPoolService {

    private static final Logger log = LoggerFactory.getLogger(CameraPoolService.class);

    private final ExecutorService executor;
    private final BoundedPriorityBlockingQueue<Vehicle> queue;

    private final ITVService itvService;
    private final PoliceService policeService;
    private final SimulationConfig config;
    private final OwnerRepository ownerRepository;

    private volatile int cameraCount;
    private final ThreadFactory cameraFactory;
    private final AtomicInteger counter;

    public CameraPoolService(SimulationConfig config,
            ITVService itvService,
            PoliceService policeService,
            OwnerRepository ownerRepository) {

        this.config = config;
        this.cameraCount = config.getCameraCount();
        this.itvService = itvService;
        this.policeService = policeService;
        this.ownerRepository = ownerRepository;

        this.counter = new AtomicInteger(0);
        this.cameraFactory = r -> {
            Thread t = new Thread(r);
            t.setName("camera-worker-" + counter.incrementAndGet());
            t.setDaemon(true);
            return t;
        };

        this.executor = Executors.newFixedThreadPool(cameraCount, cameraFactory);
        this.queue = new BoundedPriorityBlockingQueue<>(config.getCameraQueueCapacity());
    }

    @PostConstruct
    public void init() {
        log.info("CameraPoolService initialized with {} workers", cameraCount);
        for (int i = 0; i < cameraCount; i++) {
            executor.submit(this::cameraWorker);
        }
    }

    public void enqueueVehicle(Vehicle v) {
        try {
            queue.put(v);
            log.info("Vehicle queued: {} (submitted by thread={})",
                    v.getPlate(), Thread.currentThread().getName());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while enqueueing vehicle", e);
        }
    }

    public synchronized void resizeCameraPool(int newCount) {

        if (newCount == this.cameraCount) {
            log.info("Camera count unchanged: {}", newCount);
            return;
        }

        if (newCount <= 0) {
            log.warn("Ignoring camera resize request: value must be > 0 (requested={})", newCount);
            return;
        }

        if (newCount < this.cameraCount) {
            log.warn("Attempt to reduce camera workers ignored (current={} requested={})", this.cameraCount, newCount);
            return;
        }

        int toAdd = newCount - this.cameraCount;
        log.info("Adding {} new camera workers ({} -> {})", toAdd, this.cameraCount, newCount);

        for (int i = 0; i < toAdd; i++) {
            executor.submit(this::cameraWorker);
        }

        this.cameraCount = newCount;
    }

    private void cameraWorker() {
        while (true) {
            try {
                Vehicle v = queue.take();
                log.info("Camera captured {} (processing thread={})",
                        v.getPlate(), Thread.currentThread().getName());

                // 1. Environmental badge validation
                String tag = v.getEnvTag();
                Set<String> allowed = Set.of("C", "ECO", "0");

                if (tag == null || !allowed.contains(tag.toUpperCase())) {

                    log.info("Vehicle denied entry due to environmental tag: {} - {}",
                            tag, v.getPlate());

                    policeService.sendAlert(
                            PoliceMessageFactory.build(
                                    AlertType.BADGE,
                                    v.getPlate(),
                                    tag));

                    continue;
                }

                // 2. ITV validation
                String plate = v.getPlate();
                ITVStatus status = itvService.check(plate);

                if (status != ITVStatus.VALID) {
                    Owner owner = ownerRepository.findByPlate(plate);
                    String email = owner != null ? owner.getEmail() : null;
                    policeService.sendAlert(
                            PoliceMessageFactory.build(
                                    AlertType.ITV,
                                    plate,
                                    status.name(),
                                    email));
                }

                // 3. Stolen or marked vehicle
                if (v.isStolen() || v.isAlertVehicle()) {
                    policeService.sendAlert(
                            PoliceMessageFactory.build(
                                    AlertType.POLICE,
                                    v.getPlate(),
                                    "Vehiculo robado o marcado"));
                }

            } catch (Exception e) {
                log.error("Error processing vehicle in camera worker", e);
            }
        }
    }

    public String getStatus() {
        return """
                Camera Pool Status
                - Queue size: %d
                - CameraNum: %d
                """.formatted(
                queue.size(),
                cameraCount);
    }
}
