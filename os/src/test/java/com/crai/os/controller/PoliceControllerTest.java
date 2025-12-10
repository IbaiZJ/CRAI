package com.crai.os.controller;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.crai.os.service.PoliceService;

@ExtendWith(MockitoExtension.class)
class PoliceControllerTest {

    @Mock
    private PoliceService policeService;

    private PoliceController controller;

    @BeforeEach
    void setUp() {
        controller = new PoliceController(policeService);
    }

    @Test
    void getAlertsDelegatesToService() {
        List<String> alerts = List.of("a1", "a2");
        when(policeService.getProcessedAlerts()).thenReturn(alerts);

        Object result = controller.getAlerts();

        assertSame(alerts, result);
        verify(policeService).getProcessedAlerts();
    }
}
