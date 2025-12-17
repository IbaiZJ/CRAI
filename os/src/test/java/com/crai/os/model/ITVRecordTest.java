package com.crai.os.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ITVRecordTest {

    @Test
    void detectsExpiredWhenPastNow() {
        long pastTimestamp = System.currentTimeMillis() - 1000;
        ITVRecord itvRecord = new ITVRecord("1234BCD", pastTimestamp);
        assertThat(itvRecord.isExpired()).isTrue();
    }

    @Test
    void detectsValidWhenFuture() {
        long futureTimestamp = System.currentTimeMillis() + 1000;
        ITVRecord itvRecord = new ITVRecord("2345CDE", futureTimestamp);
        assertThat(itvRecord.isExpired()).isFalse();
    }
}
