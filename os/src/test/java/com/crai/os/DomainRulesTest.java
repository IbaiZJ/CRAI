package com.crai.os;

import com.crai.os.model.AlertType;
import com.crai.os.model.Vehicle;
import com.crai.os.service.CameraPoolService;
import com.crai.os.service.PoliceService;
import com.crai.os.repository.ITVRepository;
import com.crai.os.model.ITVRecord;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.time.Instant;
import java.util.List;

@SpringBootTest
@TestPropertySource(properties = "node-red.webhook-url=")
@SuppressWarnings("java:S2925") // Thread.sleep is necessary in async integration tests
public class DomainRulesTest {

    @Autowired
    private CameraPoolService cameraPoolService;

    @Autowired
    private PoliceService policeService;

    @Autowired
    private ITVRepository itvRepository;

    private boolean waitForProcessed(String plate, long timeoutMs) throws InterruptedException {
        long deadline = Instant.now().toEpochMilli() + timeoutMs;
        while (Instant.now().toEpochMilli() < deadline) {
            List<?> processed = policeService.getProcessedAlerts();
            // take a snapshot to avoid ConcurrentModificationException when the
            // background threads are adding alerts concurrently
            List<?> snapshot = java.util.List.copyOf(processed);
            boolean found = snapshot.stream().anyMatch(o -> {
                try {
                    java.lang.reflect.Method m = o.getClass().getMethod("getPlate");
                    return plate.equals(m.invoke(o));
                } catch (Exception e) {
                    return false;
                }
            });
            if (found) return true;
            Thread.sleep(100);
        }
        return false;
    }

    @Test
    public void testDomainAlerts() throws Exception {
        // Vehicle without envTag -> BADGE alert
        Vehicle noTag = new Vehicle("1234BCD", 1, false, null, false);
        cameraPoolService.enqueueVehicle(noTag);

        // ITV caducada: insert registro caducado para asegurar el aviso
        itvRepository.save(new ITVRecord("9999XYZ", System.currentTimeMillis() - 1000));
        Vehicle itvBad = new Vehicle("9999XYZ", 5, false, "C", false);
        cameraPoolService.enqueueVehicle(itvBad);

        // Vehicle stolen -> POLICE alert
        Vehicle stolen = new Vehicle("8888ABC", 9, true, "ECO", true);
        cameraPoolService.enqueueVehicle(stolen);

        // Wait for the alerts to be processed
        Assertions.assertTrue(waitForProcessed("1234BCD", 5000), "BADGE alert not processed in time");
        Assertions.assertTrue(waitForProcessed("9999XYZ", 5000), "ITV alert not processed in time");
        Assertions.assertTrue(waitForProcessed("8888ABC", 5000), "POLICE alert not processed in time");
    }
}
