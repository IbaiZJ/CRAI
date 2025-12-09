package com.crai.os.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PoliceMessageFactoryTest {

    @Test
    void buildsBadgeMessage() {
        PoliceMessage msg = PoliceMessageFactory.build(AlertType.BADGE, "1234BCD", "B");
        assertThat(msg.getType()).isEqualTo(AlertType.BADGE);
        assertThat(msg.getDescription()).contains("etiqueta NO valida");
    }

    @Test
    void buildsPoliceMessage() {
        PoliceMessage msg = PoliceMessageFactory.build(AlertType.POLICE, "9999ZZZ", "robado");
        assertThat(msg.getType()).isEqualTo(AlertType.POLICE);
        assertThat(msg.getDescription()).contains("ROBADO");
    }

    @Test
    void buildsItvMessages() {
        PoliceMessage expired = PoliceMessageFactory.build(AlertType.ITV, "1111AAA", "EXPIRED", "mail@test.com");
        PoliceMessage soon = PoliceMessageFactory.build(AlertType.ITV, "2222BBB", "EXPIRING_SOON");
        PoliceMessage unknown = PoliceMessageFactory.build(AlertType.ITV, "3333CCC", "UNKNOWN");

        assertThat(expired.getDescription()).contains("CADUCADA");
        assertThat(soon.getDescription()).contains("proxima a caducar");
        assertThat(unknown.getDescription()).contains("No se pudo verificar");
        assertThat(expired.getRecipientEmail()).isEqualTo("mail@test.com");
    }
}
