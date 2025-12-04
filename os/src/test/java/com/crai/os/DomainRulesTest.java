package com.crai.os;

import com.crai.os.model.AlertType;
import com.crai.os.model.Vehicle;
import com.crai.os.service.CameraPoolService;
import com.crai.os.service.PoliceService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.List;

@SpringBootTest
public class DomainRulesTest {

    @Autowired
    private CameraPoolService cameraPoolService;

    @Autowired
    private PoliceService policeService;

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
        Vehicle noTag = new Vehicle("TEST_NO_TAG", 1, false, null, false);
        cameraPoolService.enqueueVehicle(noTag);

        // Vehicle with ITV repository entry '9999XYZ' is in repo and marked dangerous in sample data
        Vehicle itvBad = new Vehicle("9999XYZ", 5, false, "C", false);
        cameraPoolService.enqueueVehicle(itvBad);

        // Vehicle stolen -> POLICE alert
        Vehicle stolen = new Vehicle("STOLEN_TEST", 9, true, "ECO", true);
        cameraPoolService.enqueueVehicle(stolen);

        // Wait for the alerts to be processed
        Assertions.assertTrue(waitForProcessed("TEST_NO_TAG", 5000), "BADGE alert not processed in time");
        Assertions.assertTrue(waitForProcessed("9999XYZ", 5000), "ITV alert not processed in time");
        Assertions.assertTrue(waitForProcessed("STOLEN_TEST", 5000), "POLICE alert not processed in time");
    }
}
