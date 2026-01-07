package com.crai.os.model;

import java.lang.reflect.Constructor;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class PoliceMessageFactoryTest {

    @Test
    void privateConstructorForCoverage() throws Exception {
        Constructor<PoliceMessageFactory> constructor = PoliceMessageFactory.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        PoliceMessageFactory instance = constructor.newInstance();
        assertThat(instance).isNotNull();
    }

    @Test
    void buildsBadgeMessage() {
        PoliceMessage msg = PoliceMessageFactory.build(AlertType.BADGE, "1234BCD", "B");
        assertThat(msg.getType()).isEqualTo(AlertType.BADGE);
        assertThat(msg.getPlate()).isEqualTo("1234BCD");
        assertThat(msg.getDescription()).contains("invalid environmental badge");
        assertThat(msg.getDescription()).contains("B");
        assertThat(msg.getRecipientEmail()).isNull();
    }

    @Test
    void buildsPoliceMessage() {
        PoliceMessage msg = PoliceMessageFactory.build(AlertType.POLICE, "9999ZZZ", "robado");
        assertThat(msg.getType()).isEqualTo(AlertType.POLICE);
        assertThat(msg.getPlate()).isEqualTo("9999ZZZ");
        assertThat(msg.getDescription()).contains("stolen or wanted");
        assertThat(msg.getRecipientEmail()).isNull();
    }

    @Test
    void buildsItvMessages() {
        PoliceMessage expired = PoliceMessageFactory.build(AlertType.ITV, "1111AAA", "EXPIRED", "mail@test.com");
        PoliceMessage soon = PoliceMessageFactory.build(AlertType.ITV, "2222BBB", "EXPIRING_SOON");
        PoliceMessage unknown = PoliceMessageFactory.build(AlertType.ITV, "3333CCC", "UNKNOWN");

        assertThat(expired.getType()).isEqualTo(AlertType.ITV);
        assertThat(expired.getPlate()).isEqualTo("1111AAA");
        assertThat(expired.getDescription()).contains("ITV expired");
        assertThat(expired.getDescription()).contains("1111AAA");
        assertThat(expired.getRecipientEmail()).isEqualTo("mail@test.com");

        assertThat(soon.getType()).isEqualTo(AlertType.ITV);
        assertThat(soon.getPlate()).isEqualTo("2222BBB");
        assertThat(soon.getDescription()).contains("ITV expiring soon");
        assertThat(soon.getDescription()).contains("2222BBB");
        assertThat(soon.getRecipientEmail()).isNull();

        assertThat(unknown.getType()).isEqualTo(AlertType.ITV);
        assertThat(unknown.getPlate()).isEqualTo("3333CCC");
        assertThat(unknown.getDescription()).contains("ITV could not be verified");
        assertThat(unknown.getDescription()).contains("3333CCC");
        assertThat(unknown.getRecipientEmail()).isNull();
    }

    @Test
    void buildsItvMessageWithDefaultCase() {
        // Test the default case in buildItvMessage switch
        PoliceMessage msg = PoliceMessageFactory.build(AlertType.ITV, "4444DDD", "INVALID_STATUS");
        assertThat(msg.getType()).isEqualTo(AlertType.ITV);
        assertThat(msg.getPlate()).isEqualTo("4444DDD");
        assertThat(msg.getDescription()).contains("Unknown ITV status for vehicle 4444DDD");
        assertThat(msg.getRecipientEmail()).isNull();
    }

    @Test
    void buildWithThreeArgsPassesNullEmail() {
        PoliceMessage msg = PoliceMessageFactory.build(AlertType.POLICE, "5555EEE", "detail");
        assertThat(msg.getRecipientEmail()).isNull();
    }

    @Test
    void buildWithFourArgsIncludesEmail() {
        PoliceMessage msg = PoliceMessageFactory.build(AlertType.BADGE, "6666FFF", "tag", "test@example.com");
        assertThat(msg.getRecipientEmail()).isEqualTo("test@example.com");
        assertThat(msg.getPlate()).isEqualTo("6666FFF");
    }
}
