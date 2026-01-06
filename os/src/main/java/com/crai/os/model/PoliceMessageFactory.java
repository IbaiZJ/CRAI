package com.crai.os.model;

public class PoliceMessageFactory {

    private PoliceMessageFactory() {
        // Private constructor to hide implicit public one
    }

    public static PoliceMessage build(AlertType type, String plate, String detail) {
        return build(type, plate, detail, null);
    }

    public static PoliceMessage build(AlertType type, String plate, String detail, String recipientEmail) {

        String msg = switch (type) {
            case BADGE -> "Vehicle " + plate + " has an invalid environmental badge. " + detail;
            case POLICE -> "Vehicle " + plate + " is marked as stolen or wanted.";
            case ITV -> buildItvMessage(plate, detail);
        };

        return new PoliceMessage(type, plate, msg, recipientEmail);
    }

    private static String buildItvMessage(String plate, String detail) {
        return switch (detail) {
            case "EXPIRED" -> "ITV expired for vehicle " + plate;
            case "EXPIRING_SOON" -> "ITV expiring soon for vehicle " + plate;
            case "UNKNOWN" -> "ITV could not be verified for vehicle " + plate;
            default -> "Unknown ITV status for vehicle " + plate;
        };
    }
}

