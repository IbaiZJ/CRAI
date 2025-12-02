package com.crai;

import org.json.JSONObject;

public class PoliceAlert {

    private final String plate;
    private final long timestamp;
    private final String message;

    public PoliceAlert(String plate) {
        this.plate = plate;
        this.timestamp = System.currentTimeMillis();
        this.message = "Stolen vehicle detected: " + plate;
    }

    public String getPlate() {
        return plate;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public JSONObject toJson() {
        JSONObject json = new JSONObject();
        json.put("plate", plate);
        json.put("timestamp", timestamp);
        json.put("message", message);
        return json;
    }

    @Override
    public String toString() {
        return toJson().toString();
    }
}
