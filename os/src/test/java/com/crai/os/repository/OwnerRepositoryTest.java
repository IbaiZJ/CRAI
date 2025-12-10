package com.crai.os.repository;

import com.crai.os.model.Owner;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OwnerRepositoryTest {

    @Test
    void returnsKnownOwner() {
        OwnerRepository repo = new OwnerRepository();
        Owner owner = repo.findByPlate("1234BCD");

        assertThat(owner).isNotNull();
        assertThat(owner.getEmail()).contains("@");
    }

    @Test
    void canSaveAndRetrieveNewOwner() {
        OwnerRepository repo = new OwnerRepository();
        Owner newOwner = new Owner("ZZZZ999", "test@example.com", "Test User");

        repo.save(newOwner);

        Owner found = repo.findByPlate("ZZZZ999");
        assertThat(found).isNotNull();
        assertThat(found.getEmail()).isEqualTo("test@example.com");
    }
}
