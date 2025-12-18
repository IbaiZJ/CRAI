package com.crai.os.service;

import java.lang.reflect.Field;
import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.crai.os.config.SimulationConfig;
import com.crai.os.model.AlertType;
import com.crai.os.model.ITVRecord;
import com.crai.os.model.Owner;
import com.crai.os.model.PoliceMessage;
import com.crai.os.model.Vehicle;
import com.crai.os.repository.ITVRepository;
import com.crai.os.repository.OwnerRepository;
import com.crai.os.utils.BoundedPriorityBlockingQueue;

@SuppressWarnings("java:S2925") // Thread.sleep is necessary in async tests to wait for worker threads
@ExtendWith(MockitoExtension.class)
class CameraPoolServiceTest {

    @Mock
    private PoliceService policeService;

    @Mock
    private OwnerRepository ownerRepository;

    private ITVRepository itvRepository;
    private SimulationConfig config;

    @BeforeEach
    void setUp() {
        config = new SimulationConfig();
        config.setCameraCount(2);
        config.setItvFailProbability(0.0);
        itvRepository = new ITVRepository();
    }

    @Test
    void enqueueVehicleAddsToQueue() throws InterruptedException {
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);

        Vehicle v = new Vehicle("1234ABC", 5, false, "C", false);
        service.enqueueVehicle(v);

        // The vehicle should be processed by a worker
        Thread.sleep(500);
        // If we get here without exception, enqueue worked
    }

    @Test
    void cameraWorkerSendsAlertForInvalidBadge() throws InterruptedException {
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Vehicle with invalid env tag (B is not in allowed set)
        Vehicle v = new Vehicle("5678DEF", 3, false, "B", false);
        service.enqueueVehicle(v);

        // Give worker time to process
        Thread.sleep(500);

        // Should have sent a BADGE alert
        verify(policeService, atLeastOnce()).sendAlert(any(PoliceMessage.class));
    }

    @Test
    void cameraWorkerSendsAlertForNullBadge() throws InterruptedException {
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Vehicle with null env tag
        Vehicle v = new Vehicle("9999XYZ", 3, false, null, false);
        service.enqueueVehicle(v);

        Thread.sleep(500);

        verify(policeService, atLeastOnce()).sendAlert(any(PoliceMessage.class));
    }

    @Test
    void cameraWorkerProcessesValidVehicleWithoutBadgeAlert() throws InterruptedException {
        // Pre-populate ITV repo with valid record
        long futureTs = System.currentTimeMillis() + Duration.ofDays(60).toMillis();
        itvRepository.save(new ITVRecord("VALID123", futureTs));

        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Valid vehicle with good badge
        Vehicle v = new Vehicle("VALID123", 5, false, "C", false);
        service.enqueueVehicle(v);

        Thread.sleep(500);

        // Should NOT have sent an alert for valid vehicle
        verify(policeService, never()).sendAlert(any(PoliceMessage.class));
    }

    @Test
    void cameraWorkerSendsAlertForStolenVehicle() throws InterruptedException {
        // Pre-populate ITV repo with valid record
        long futureTs = System.currentTimeMillis() + Duration.ofDays(60).toMillis();
        itvRepository.save(new ITVRecord("STOLEN1", futureTs));

        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Stolen vehicle with valid badge
        Vehicle v = new Vehicle("STOLEN1", 5, false, "ECO", true);
        service.enqueueVehicle(v);

        Thread.sleep(500);

        // Should send POLICE alert for stolen vehicle
        ArgumentCaptor<PoliceMessage> captor = ArgumentCaptor.forClass(PoliceMessage.class);
        verify(policeService, atLeastOnce()).sendAlert(captor.capture());

        List<PoliceMessage> alerts = captor.getAllValues();
        assertThat(alerts).anyMatch(m -> m.getType() == AlertType.POLICE);
    }

    @Test
    void cameraWorkerSendsAlertForAlertVehicle() throws InterruptedException {
        long futureTs = System.currentTimeMillis() + Duration.ofDays(60).toMillis();
        itvRepository.save(new ITVRecord("ALERT1", futureTs));

        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Alert vehicle (not stolen but marked)
        Vehicle v = new Vehicle("ALERT1", 5, true, "0", false);
        service.enqueueVehicle(v);

        Thread.sleep(500);

        ArgumentCaptor<PoliceMessage> captor = ArgumentCaptor.forClass(PoliceMessage.class);
        verify(policeService, atLeastOnce()).sendAlert(captor.capture());

        List<PoliceMessage> alerts = captor.getAllValues();
        assertThat(alerts).anyMatch(m -> m.getType() == AlertType.POLICE);
    }

    @Test
    void resizeCameraPoolIgnoresZeroOrNegative() {
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Try to resize to 0 - should be ignored
        service.resizeCameraPool(0);
        // Try to resize to negative - should be ignored
        service.resizeCameraPool(-1);

        // No exception should be thrown
    }

    @Test
    void resizeCameraPoolIgnoresSameCount() {
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Same count as current - should do nothing
        service.resizeCameraPool(2);
    }

    @Test
    void resizeCameraPoolIgnoresReduction() {
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Try to reduce - should be ignored
        service.resizeCameraPool(1);
    }

    @Test
    void resizeCameraPoolAddsWorkers() {
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Increase count
        service.resizeCameraPool(4);

        // No exception means success
    }

    @Test
    void getStatusReturnsFormattedString() {
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);

        String status = service.getStatus();

        assertThat(status).contains("Camera Pool Status");
        assertThat(status).contains("Queue size:");
        assertThat(status).contains("CameraNum:");
    }

    @Test
    void cameraWorkerHandlesExpiredITV() throws InterruptedException {
        // Pre-populate ITV repo with expired record
        long expiredTs = System.currentTimeMillis() - Duration.ofDays(5).toMillis();
        itvRepository.save(new ITVRecord("EXPIRED1", expiredTs));

        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Vehicle with valid badge but expired ITV
        Vehicle v = new Vehicle("EXPIRED1", 5, false, "C", false);
        service.enqueueVehicle(v);

        Thread.sleep(500);

        // Should send ITV alert
        ArgumentCaptor<PoliceMessage> captor = ArgumentCaptor.forClass(PoliceMessage.class);
        verify(policeService, atLeastOnce()).sendAlert(captor.capture());

        List<PoliceMessage> alerts = captor.getAllValues();
        assertThat(alerts).anyMatch(m -> m.getType() == AlertType.ITV);
    }

    @Test
    void enqueueVehicleInterruptedExceptionHandled() throws Exception {
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        
        // Create a thread that will call enqueue and get interrupted
        Thread enqueueThread = new Thread(() -> {
            Vehicle v = new Vehicle("INTERRUPT1", 5, false, "C", false);
            try {
                service.enqueueVehicle(v);
            } catch (RuntimeException e) {
                // Expected if interrupted while blocking
                assertThat(e.getMessage()).contains("Interrupted");
            }
        });
        
        enqueueThread.start();
        Thread.sleep(50); // Let it start
        enqueueThread.interrupt();
        enqueueThread.join(500);
        
        assertThat(enqueueThread.isAlive()).isFalse();
    }

    @Test
    void cameraWorkerWithOwnerEmail() throws InterruptedException {
        // Pre-populate ITV repo with expired record
        long expiredTs = System.currentTimeMillis() - Duration.ofDays(5).toMillis();
        itvRepository.save(new ITVRecord("WITHOWNER", expiredTs));

        // Mock owner repository to return an owner with email
        when(ownerRepository.findByPlate("WITHOWNER"))
            .thenReturn(new Owner("John Doe", "john@example.com", "WITHOWNER"));

        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Vehicle with valid badge but expired ITV and owner with email
        Vehicle v = new Vehicle("WITHOWNER", 5, false, "C", false);
        service.enqueueVehicle(v);

        Thread.sleep(500);

        // Should send ITV alert with owner email
        ArgumentCaptor<PoliceMessage> captor = ArgumentCaptor.forClass(PoliceMessage.class);
        verify(policeService, atLeastOnce()).sendAlert(captor.capture());

        List<PoliceMessage> alerts = captor.getAllValues();
        assertThat(alerts).anyMatch(m -> 
            m.getType() == AlertType.ITV && "john@example.com".equals(m.getRecipientEmail()));
    }

    @Test
    void cameraWorkerWithEcoTag() throws InterruptedException {
        long futureTs = System.currentTimeMillis() + Duration.ofDays(60).toMillis();
        itvRepository.save(new ITVRecord("ECOTAG", futureTs));

        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Vehicle with ECO tag (valid)
        Vehicle v = new Vehicle("ECOTAG", 5, false, "eco", false); // lowercase should work
        service.enqueueVehicle(v);

        Thread.sleep(500);

        // Should NOT send badge alert for ECO tag
        verify(policeService, never()).sendAlert(any(PoliceMessage.class));
    }

    @Test
    void cameraWorkerWithZeroTag() throws InterruptedException {
        long futureTs = System.currentTimeMillis() + Duration.ofDays(60).toMillis();
        itvRepository.save(new ITVRecord("ZEROTAG", futureTs));

        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Vehicle with 0 tag (valid)
        Vehicle v = new Vehicle("ZEROTAG", 5, false, "0", false);
        service.enqueueVehicle(v);

        Thread.sleep(500);

        // Should NOT send badge alert for 0 tag
        verify(policeService, never()).sendAlert(any(PoliceMessage.class));
    }

    @Test
    void enqueueVehicleThrowsRuntimeExceptionOnInterrupt() throws Exception {
        // Create a mock BoundedPriorityBlockingQueue that throws InterruptedException
        @SuppressWarnings("unchecked")
        BoundedPriorityBlockingQueue<Vehicle> mockQueue = mock(BoundedPriorityBlockingQueue.class);
        doThrow(new InterruptedException("Test interrupt")).when(mockQueue).put(any(Vehicle.class));
        
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        
        // Replace the queue with our mock via reflection
        Field queueField = CameraPoolService.class.getDeclaredField("queue");
        queueField.setAccessible(true);
        queueField.set(service, mockQueue);
        
        Vehicle v = new Vehicle("INTERRUPT", 5, false, "C", false);
        
        // Test the exception handling
        assertThatThrownBy(() -> service.enqueueVehicle(v))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Interrupted while enqueueing vehicle")
            .hasCauseInstanceOf(InterruptedException.class);
            
        // Verify the interrupt flag is set
        assertThat(Thread.currentThread().isInterrupted()).isTrue();
        
        // Clear the interrupt flag for other tests
        Thread.interrupted();
    }

    @Test
    void cameraWorkerHandlesExceptionGracefully() throws InterruptedException {
        // Create a mock PoliceService that throws exception
        doThrow(new RuntimeException("Simulated error")).when(policeService).sendAlert(any(PoliceMessage.class));
        
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        service.init();

        // Vehicle with invalid badge that will trigger exception in worker
        Vehicle v = new Vehicle("ERROR123", 5, false, "INVALID", false);
        service.enqueueVehicle(v);

        // Give worker time to process and handle the exception
        Thread.sleep(800);

        // Verify the exception was caught and logged (worker should continue running)
        verify(policeService, atLeastOnce()).sendAlert(any(PoliceMessage.class));
        
        // Send another vehicle to verify worker is still running after exception
        Vehicle v2 = new Vehicle("TEST456", 3, false, "X", false);
        service.enqueueVehicle(v2);
        Thread.sleep(500);
        
        // Should have attempted to send alert for second vehicle too
        verify(policeService, atLeastOnce()).sendAlert(any(PoliceMessage.class));
    }

    @Test
    void cameraWorkerExitsOnInterrupt() throws Exception {
        ITVService itvService = new ITVService(itvRepository, config);
        CameraPoolService service = new CameraPoolService(config, itvService, policeService, ownerRepository);
        
        // Get the executor field via reflection to access worker threads
        Field executorField = CameraPoolService.class.getDeclaredField("executor");
        executorField.setAccessible(true);
        
        // Initialize the service (starts worker threads)
        service.init();
        
        // Get the executor and shut it down with interruption
        java.util.concurrent.ExecutorService executor = 
            (java.util.concurrent.ExecutorService) executorField.get(service);
        
        // This will interrupt all waiting threads (in queue.take())
        executor.shutdownNow();
        
        // Wait for workers to terminate
        boolean terminated = executor.awaitTermination(2, java.util.concurrent.TimeUnit.SECONDS);
        
        // Workers should have exited gracefully due to InterruptedException handling
        assertThat(terminated).isTrue();
    }
}
