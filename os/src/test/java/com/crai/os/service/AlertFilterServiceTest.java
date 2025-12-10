package com.crai.os.service;

import com.crai.os.model.AlertType;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AlertFilterServiceTest {

    @Test
    void onlyAllowsPoliceAlerts() {
        AlertFilterService service = new AlertFilterService();

        assertThat(service.shouldSend(AlertType.POLICE)).isTrue();
        assertThat(service.shouldSend(AlertType.ITV)).isFalse();
        assertThat(service.shouldSend(AlertType.BADGE)).isFalse();
    }
}
