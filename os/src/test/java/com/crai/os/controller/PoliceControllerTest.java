package com.crai.os.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import com.crai.os.model.AlertType;
import com.crai.os.model.PoliceMessage;
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
        List<PoliceMessage> alerts = List.of(
                new PoliceMessage(AlertType.POLICE, "1234ABC", "desc"),
                new PoliceMessage(AlertType.BADGE, "5678DEF", "other"));
        when(policeService.getProcessedAlerts()).thenReturn(alerts);

        Object result = controller.getAlerts();

        assertSame(alerts, result);
        verify(policeService).getProcessedAlerts();
    }

    @Test
    void clearAlertsDelegatesToService() {
        Object result = controller.clearAlerts();

        verify(policeService).clearAlerts();
        assertThat(result).isInstanceOf(java.util.Map.class);
    }
}
