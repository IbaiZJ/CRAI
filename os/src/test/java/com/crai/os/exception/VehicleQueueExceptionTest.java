package com.crai.os.exception;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VehicleQueueExceptionTest {

    @Test
    void shouldExposeMessage() {
        String message = "Queue interrupted";
        VehicleQueueException ex = new VehicleQueueException(message);
        assertThat(ex).hasMessage(message).hasNoCause();
    }

    @Test
    void shouldExposeMessageAndCause() {
        String message = "Queue interrupted with cause";
        Throwable cause = new IllegalStateException("root cause");
        VehicleQueueException ex = new VehicleQueueException(message, cause);

        assertThat(ex).hasMessage(message).hasCause(cause);
    }
}
