package com.crai.os.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ITVRecordTest {

    @Test
    void detectsExpiredWhenPastNow() {
        long past = System.currentTimeMillis() - 1000;
        ITVRecord record = new ITVRecord("1234BCD", past);
        assertThat(record.isExpired()).isTrue();
    }

    @Test
    void detectsValidWhenFuture() {
        long future = System.currentTimeMillis() + 1000;
        ITVRecord record = new ITVRecord("2345CDE", future);
        assertThat(record.isExpired()).isFalse();
    }
}
