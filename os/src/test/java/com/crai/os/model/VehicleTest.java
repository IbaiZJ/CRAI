package com.crai.os.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleTest {

    @Test
    void compareToOrdersByPriorityDesc() {
        Vehicle high = new Vehicle("AAA", 9, false);
        Vehicle low = new Vehicle("BBB", 1, false);

        assertThat(high.compareTo(low)).isLessThan(0); // high before low
        assertThat(low.compareTo(high)).isGreaterThan(0);
    }
}
