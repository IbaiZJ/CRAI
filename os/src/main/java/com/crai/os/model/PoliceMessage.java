package com.crai.os.model;

public class PoliceMessage {

    private AlertType type;
    private String plate;
    private String description;
    private String recipientEmail;


    public PoliceMessage(AlertType type, String plate, String description) {
        this.type = type;
        this.plate = plate;
        this.description = description;
    }

    public PoliceMessage(AlertType type, String plate, String description, String recipientEmail) {
        this(type, plate, description);
        this.recipientEmail = recipientEmail;
    }

    public AlertType getType() {
        return type;
    }

    public String getPlate() {
        return plate;
    }

    public String getDescription() {
        return description;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }
}
