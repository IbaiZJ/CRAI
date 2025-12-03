package com.crai.os.utils;

import org.springframework.stereotype.Component;

import com.crai.os.model.Vehicle;
import com.crai.os.model.VehicleEvent;

@Component
public class VehicleMapper {

    public VehicleEvent toEvent(Vehicle v) {
        return new VehicleEvent(v.getPlate(), System.currentTimeMillis());
    }
}
