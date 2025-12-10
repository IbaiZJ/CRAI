package com.crai.os.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.crai.os.service.CameraPoolService;

@ExtendWith(MockitoExtension.class)
class CameraControllerTest {

    @Mock
    private CameraPoolService cameraPoolService;

    private CameraController controller;

    @BeforeEach
    void setUp() {
        controller = new CameraController(cameraPoolService);
    }

    @Test
    void statusDelegatesToService() {
        when(cameraPoolService.getStatus()).thenReturn("status text");

        String response = controller.status();

        assertEquals("status text", response);
        verify(cameraPoolService).getStatus();
    }
}
