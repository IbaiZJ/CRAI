package com.crai.os.utils;

import com.crai.os.model.Vehicle;
import com.crai.os.model.VehicleEvent;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleMapperTest {

    @Test
    void mapsPlateIntoEvent() {
        Vehicle v = new Vehicle("1234BCD", 5, false);
        VehicleMapper mapper = new VehicleMapper();

        VehicleEvent evt = mapper.toEvent(v);

        assertThat(evt.getPlate()).isEqualTo("1234BCD");
        assertThat(evt.getTimestamp()).isPositive();
    }
}
