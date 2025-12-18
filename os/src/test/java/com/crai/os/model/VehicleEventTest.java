package com.crai.os.model;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class VehicleEventTest {

    @Test
    void constructorSetsPlateAndTimestamp() {
        VehicleEvent event = new VehicleEvent("1234ABC", 12345678L);

        assertThat(event.getPlate()).isEqualTo("1234ABC");
        assertThat(event.getTimestamp()).isEqualTo(12345678L);
    }

    @Test
    void setPlateUpdatesValue() {
        VehicleEvent event = new VehicleEvent("1234ABC", 0L);

        event.setPlate("5678DEF");

        assertThat(event.getPlate()).isEqualTo("5678DEF");
    }

    @Test
    void setTimestampUpdatesValue() {
        VehicleEvent event = new VehicleEvent("1234ABC", 0L);

        event.setTimestamp(99999999L);

        assertThat(event.getTimestamp()).isEqualTo(99999999L);
    }

    @Test
    void getPlateReturnsCorrectValue() {
        VehicleEvent event = new VehicleEvent("TESTPLATE", 100L);
        assertThat(event.getPlate()).isEqualTo("TESTPLATE");
    }

    @Test
    void getTimestampReturnsCorrectValue() {
        VehicleEvent event = new VehicleEvent("AAA", 555L);
        assertThat(event.getTimestamp()).isEqualTo(555L);
    }
}
