package com.crai.os.model;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class PoliceMessageTest {

    @Test
    void constructorWithThreeArgsCreatesMessageWithEmptyText() {
        PoliceMessage msg = new PoliceMessage(AlertType.POLICE, "1234ABC", "Test description");

        assertThat(msg.getType()).isEqualTo(AlertType.POLICE);
        assertThat(msg.getPlate()).isEqualTo("1234ABC");
        assertThat(msg.getDescription()).isEqualTo("Test description");
        assertThat(msg.getMessageText()).isEmpty();
        assertThat(msg.getRecipientEmail()).isNull();
    }

    @Test
    void constructorWithFourArgsCreatesMessageWithText() {
        PoliceMessage msg = new PoliceMessage(AlertType.BADGE, "5678DEF", "Badge issue", "Message body");

        assertThat(msg.getType()).isEqualTo(AlertType.BADGE);
        assertThat(msg.getPlate()).isEqualTo("5678DEF");
        assertThat(msg.getDescription()).isEqualTo("Badge issue");
        assertThat(msg.getMessageText()).isEqualTo("Message body");
        assertThat(msg.getRecipientEmail()).isNull();
    }

    @Test
    void constructorWithFiveArgsCreatesFullMessage() {
        PoliceMessage msg = new PoliceMessage(AlertType.ITV, "9999XYZ", "ITV expired", "Full message", "test@email.com");

        assertThat(msg.getType()).isEqualTo(AlertType.ITV);
        assertThat(msg.getPlate()).isEqualTo("9999XYZ");
        assertThat(msg.getDescription()).isEqualTo("ITV expired");
        assertThat(msg.getMessageText()).isEqualTo("Full message");
        assertThat(msg.getRecipientEmail()).isEqualTo("test@email.com");
    }

    @Test
    void setMessageTextUpdatesValue() {
        PoliceMessage msg = new PoliceMessage(AlertType.POLICE, "1234ABC", "Test");

        msg.setMessageText("Updated message");

        assertThat(msg.getMessageText()).isEqualTo("Updated message");
    }

    @Test
    void setRecipientEmailUpdatesValue() {
        PoliceMessage msg = new PoliceMessage(AlertType.BADGE, "5678DEF", "Test");

        msg.setRecipientEmail("updated@email.com");

        assertThat(msg.getRecipientEmail()).isEqualTo("updated@email.com");
    }

    @Test
    void getTypeReturnsCorrectAlertType() {
        PoliceMessage policeMsg = new PoliceMessage(AlertType.POLICE, "AAA", "desc");
        PoliceMessage badgeMsg = new PoliceMessage(AlertType.BADGE, "BBB", "desc");
        PoliceMessage itvMsg = new PoliceMessage(AlertType.ITV, "CCC", "desc");

        assertThat(policeMsg.getType()).isEqualTo(AlertType.POLICE);
        assertThat(badgeMsg.getType()).isEqualTo(AlertType.BADGE);
        assertThat(itvMsg.getType()).isEqualTo(AlertType.ITV);
    }

    @Test
    void getPlateReturnsCorrectPlate() {
        PoliceMessage msg = new PoliceMessage(AlertType.POLICE, "TEST123", "desc");

        assertThat(msg.getPlate()).isEqualTo("TEST123");
    }

    @Test
    void getDescriptionReturnsCorrectDescription() {
        PoliceMessage msg = new PoliceMessage(AlertType.POLICE, "AAA", "My description");

        assertThat(msg.getDescription()).isEqualTo("My description");
    }
}
