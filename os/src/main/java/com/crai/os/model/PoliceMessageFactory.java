package com.crai.os.model;

public class PoliceMessageFactory {

    public static PoliceMessage build(AlertType type, String plate, String detail) {
        return build(type, plate, detail, null);
    }

    public static PoliceMessage build(AlertType type, String plate, String detail, String recipientEmail) {

        String msg = switch (type) {
            case BADGE -> "Vehiculo " + plate + " con etiqueta NO valida. " + detail;
            case POLICE -> "Vehiculo " + plate + " marcado como ROBADO o buscado.";
            case ITV -> buildItvMessage(plate, detail);
        };

        return new PoliceMessage(type, plate, msg, "", recipientEmail);
    }

    private static String buildItvMessage(String plate, String detail) {
        return switch (detail) {
            case "EXPIRED" -> "ITV CADUCADA del vehiculo " + plate;
            case "EXPIRING_SOON" -> "ITV proxima a caducar para " + plate;
            case "UNKNOWN" -> "No se pudo verificar la ITV de " + plate;
            default -> "ITV desconocida para " + plate;
        };
    }
}

