package com.crai.os.model;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class VehicleTest {

    @Test
    void compareToOrdersByPriorityDesc() {
        Vehicle high = new Vehicle("AAA", 9, false);
        Vehicle low = new Vehicle("BBB", 1, false);

        assertThat(high.compareTo(low)).isLessThan(0); // high before low
        assertThat(low.compareTo(high)).isGreaterThan(0);
    }

    @Test
    void defaultConstructorCreatesEmptyVehicle() {
        Vehicle v = new Vehicle();
        assertThat(v.getPlate()).isNull();
        assertThat(v.getPriority()).isEqualTo(0);
        assertThat(v.isAlertVehicle()).isFalse();
        assertThat(v.getEnvTag()).isNull();
        assertThat(v.isStolen()).isFalse();
        assertThat(v.hasItvFail()).isFalse();
    }

    @Test
    void threeArgConstructorSetsBasicFields() {
        Vehicle v = new Vehicle("1234ABC", 5, true);

        assertThat(v.getPlate()).isEqualTo("1234ABC");
        assertThat(v.getPriority()).isEqualTo(5);
        assertThat(v.isAlertVehicle()).isTrue();
        assertThat(v.getEnvTag()).isNull();
        assertThat(v.isStolen()).isFalse();
    }

    @Test
    void fiveArgConstructorSetsAllFields() {
        Vehicle v = new Vehicle("5678DEF", 8, false, "ECO", true);

        assertThat(v.getPlate()).isEqualTo("5678DEF");
        assertThat(v.getPriority()).isEqualTo(8);
        assertThat(v.isAlertVehicle()).isFalse();
        assertThat(v.getEnvTag()).isEqualTo("ECO");
        assertThat(v.isStolen()).isTrue();
    }

    @Test
    void setItvFailUpdatesValue() {
        Vehicle v = new Vehicle("1234ABC", 5, false);
        assertThat(v.hasItvFail()).isFalse();

        v.setItvFail(true);
        assertThat(v.hasItvFail()).isTrue();

        v.setItvFail(false);
        assertThat(v.hasItvFail()).isFalse();
    }

    @Test
    void toStringContainsRelevantInfo() {
        Vehicle v = new Vehicle("9999XYZ", 3, true, "C", false);

        String str = v.toString();

        assertThat(str).contains("9999XYZ");
        assertThat(str).contains("3");
        assertThat(str).contains("C");
        assertThat(str).contains("false"); // stolen
        assertThat(str).contains("true");  // alert
    }

    @Test
    void compareToReturnsZeroForSamePriority() {
        Vehicle v1 = new Vehicle("AAA", 5, false);
        Vehicle v2 = new Vehicle("BBB", 5, true);

        assertThat(v1.compareTo(v2)).isEqualTo(0);
    }

    @Test
    void getEnvTagReturnsCorrectValue() {
        Vehicle v = new Vehicle("1234ABC", 1, false, "0", false);
        assertThat(v.getEnvTag()).isEqualTo("0");
    }

    @Test
    void isStolenReturnsCorrectValue() {
        Vehicle stolen = new Vehicle("1234ABC", 1, false, "C", true);
        Vehicle notStolen = new Vehicle("5678DEF", 1, false, "C", false);

        assertThat(stolen.isStolen()).isTrue();
        assertThat(notStolen.isStolen()).isFalse();
    }

    @Test
    void isAlertVehicleReturnsCorrectValue() {
        Vehicle alert = new Vehicle("1234ABC", 1, true);
        Vehicle notAlert = new Vehicle("5678DEF", 1, false);

        assertThat(alert.isAlertVehicle()).isTrue();
        assertThat(notAlert.isAlertVehicle()).isFalse();
    }
}
