package com.crai.os.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.crai.os.model.Vehicle;
import com.crai.os.service.CameraPoolService;

@ExtendWith(MockitoExtension.class)
class VehicleControllerTest {

    @Mock
    private CameraPoolService cameraPoolService;

    private VehicleController controller;

    @BeforeEach
    void setUp() {
        controller = new VehicleController(cameraPoolService);
    }

    @Test
    void sendVehicleEnqueuesAndReturnsMessage() {
        Vehicle vehicle = new Vehicle("1234ABC", 1, false, "C", false);

        String response = controller.sendVehicle(vehicle);

        assertEquals("Vehicle added to camera queue.", response);
        verify(cameraPoolService).enqueueVehicle(vehicle);
    }
}
