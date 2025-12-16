package com.crai.os.model;

public class Vehicle implements Comparable<Vehicle> {

    private String plate;
    private int priority;
    private boolean alertVehicle;
    private String envTag; // environmental badge/tag (e.g., C, ECO, 0)
    private boolean stolen;
    private boolean itvFail;

    public Vehicle() {
    }

    public Vehicle(String plate, int priority, boolean alertVehicle) {
        this(plate, priority, alertVehicle, null, false);
    }

    public Vehicle(String plate, int priority, boolean alertVehicle, String envTag, boolean stolen) {
        this.plate = plate;
        this.priority = priority;
        this.alertVehicle = alertVehicle;
        this.envTag = envTag;
        this.stolen = stolen;
    }

    public String getPlate() {
        return plate;
    }

    public int getPriority() {
        return priority;
    }

    public boolean isAlertVehicle() {
        return alertVehicle;
    }

    public String getEnvTag() {
        return envTag;
    }

    public boolean isStolen() {
        return stolen;
    }

    @Override
    public int compareTo(Vehicle o) {
        return Integer.compare(o.priority, this.priority);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof Vehicle other)) {
            return false;
        }
        return this.priority == other.priority;
    }

    @Override
    public int hashCode() {
        return Integer.hashCode(priority);
    }

    @Override
    public String toString() {
        return """
                🚗 Vehicle:
                    • Plate: %s
                    • Priority: %d
                    • Env Tag: %s
                    • Stolen: %s
                    • Alert: %s
                """.formatted(
                plate,
                priority,
                envTag,
                stolen,
                alertVehicle);
    }

    public boolean hasItvFail() {
        return itvFail;
    }

    public void setItvFail(boolean itvFail) {
        this.itvFail = itvFail;
    }

}
