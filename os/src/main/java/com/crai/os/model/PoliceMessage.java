package com.crai.os.model;

public class PoliceMessage {

    private AlertType type;
    private String plate;
    private String description;
    private String messageText;
    private String recipientEmail;


    public PoliceMessage(AlertType type, String plate, String description, String messageText) {
        this.type = type;
        this.plate = plate;
        this.description = description;
        this.messageText = messageText;
    }

    // Constructor antiguo para no romper nada
    public PoliceMessage(AlertType type, String plate, String description) {
        this(type, plate, description, "");
    }

    public PoliceMessage(AlertType type, String plate, String description, String messageText, String recipientEmail) {
        this(type, plate, description, messageText);
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

    public String getMessageText() {     
        return messageText;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }
}
