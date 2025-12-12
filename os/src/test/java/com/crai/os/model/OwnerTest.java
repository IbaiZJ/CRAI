package com.crai.os.model;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class OwnerTest {

    @Test
    void constructorSetsAllFields() {
        Owner owner = new Owner("1234ABC", "test@email.com", "John Doe");

        assertThat(owner.getPlate()).isEqualTo("1234ABC");
        assertThat(owner.getEmail()).isEqualTo("test@email.com");
        assertThat(owner.getName()).isEqualTo("John Doe");
    }

    @Test
    void getPlateReturnsCorrectValue() {
        Owner owner = new Owner("5678DEF", "other@email.com", "Jane Smith");
        assertThat(owner.getPlate()).isEqualTo("5678DEF");
    }

    @Test
    void getEmailReturnsCorrectValue() {
        Owner owner = new Owner("AAA", "myemail@test.com", "Test");
        assertThat(owner.getEmail()).isEqualTo("myemail@test.com");
    }

    @Test
    void getNameReturnsCorrectValue() {
        Owner owner = new Owner("BBB", "email@test.com", "My Name");
        assertThat(owner.getName()).isEqualTo("My Name");
    }

    @Test
    void handlesNullValues() {
        Owner owner = new Owner(null, null, null);

        assertThat(owner.getPlate()).isNull();
        assertThat(owner.getEmail()).isNull();
        assertThat(owner.getName()).isNull();
    }
}
