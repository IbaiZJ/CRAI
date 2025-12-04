package com.crai.os.model;

public class VehicleEvent {
    private String plate;
    private long timestamp;


    public VehicleEvent(String plate, long timestamp) {
        this.plate = plate;
        this.timestamp = timestamp;
    }

    public String getPlate() {
        return plate;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setPlate(String plate) {
        this.plate = plate;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
    
}
