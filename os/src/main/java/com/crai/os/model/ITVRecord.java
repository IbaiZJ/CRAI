package com.crai.os.model;

public class ITVRecord {

    private String plate;
    private long expirationTimestamp; // fecha de caducidad (ms unix)

    public ITVRecord(String plate, long expirationTimestamp) {
        this.plate = plate;
        this.expirationTimestamp = expirationTimestamp;
    }

    public String getPlate() { return plate; }

    public long getExpirationTimestamp() { return expirationTimestamp; }

    public boolean isExpired() {
        return System.currentTimeMillis() > expirationTimestamp;
    }
}
