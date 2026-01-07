package com.crai.os.repository;

import com.crai.os.model.Owner;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;

class OwnerRepositoryTest {

    private OwnerRepository repo;

    @BeforeEach
    void setUp() {
        repo = new OwnerRepository();
    }

    @Test
    void returnsKnownOwner() {
        Owner owner = repo.findByPlate("1234BCD");

        assertThat(owner).isNotNull();
        assertThat(owner.getEmail()).isEqualTo("ibai.zorrilla@alumni.mondragon.edu");
        assertThat(owner.getName()).isEqualTo("Ibai Zorrilla");
        assertThat(owner.getPlate()).isEqualTo("1234BCD");
    }

    @Test
    void canSaveAndRetrieveNewOwner() {
        Owner newOwner = new Owner("ZZZZ999", "test@example.com", "Test User");

        repo.save(newOwner);

        Owner found = repo.findByPlate("ZZZZ999");
        assertThat(found).isNotNull();
        assertThat(found.getEmail()).isEqualTo("test@example.com");
        assertThat(found.getName()).isEqualTo("Test User");
        assertThat(found.getPlate()).isEqualTo("ZZZZ999");
    }

    @Test
    void findsOwnerInRange0To2499() {
        // Test range 0000-2499 → Ibai Zorrilla
        Owner owner = repo.findByPlate("0500XYZ");
        assertThat(owner).isNotNull();
        assertThat(owner.getName()).isEqualTo("Ibai Zorrilla");
        assertThat(owner.getEmail()).isEqualTo("ibai.zorrilla@alumni.mondragon.edu");
        assertThat(owner.getPlate()).isEqualTo("0500XYZ");
    }

    @Test
    void findsOwnerInRange2500To4999() {
        // Test range 2500-4999 → Aitor Murguzur
        Owner owner = repo.findByPlate("3000ABC");
        assertThat(owner).isNotNull();
        assertThat(owner.getName()).isEqualTo("Aitor Murguzur");
        assertThat(owner.getEmail()).isEqualTo("aitor.mirguzurl@alumni.mondragon.edu");
        assertThat(owner.getPlate()).isEqualTo("3000ABC");
    }

    @Test
    void findsOwnerInRange5000To7499() {
        // Test range 5000-7499 → Alex Zabaleta
        Owner owner = repo.findByPlate("6000DEF");
        assertThat(owner).isNotNull();
        assertThat(owner.getName()).isEqualTo("Alex Zabaleta");
        assertThat(owner.getEmail()).isEqualTo("alex.zabaleta@alumni.mondragon.edu");
        assertThat(owner.getPlate()).isEqualTo("6000DEF");
    }

    @Test
    void findsOwnerInRange7500To9999() {
        // Test range 7500-9999 → Aitor Ortiz
        Owner owner = repo.findByPlate("9000GHI");
        assertThat(owner).isNotNull();
        assertThat(owner.getName()).isEqualTo("Aitor Ortiz");
        assertThat(owner.getEmail()).isEqualTo("aitor.ortiz@alumni.mondragon.edu");
        assertThat(owner.getPlate()).isEqualTo("9000GHI");
    }

    @Test
    void returnsNullForShortPlate() {
        Owner owner = repo.findByPlate("123");
        assertThat(owner).isNull();
    }

    @Test
    void returnsNullForNonNumericPlate() {
        Owner owner = repo.findByPlate("ABCDXYZ");
        assertThat(owner).isNull();
    }

    @Test
    void returnsNullForPlateWithNegativeNumber() {
        // parsePlateNumber will extract first 4 chars and fail to parse negative
        Owner owner = repo.findByPlate("ABC-XYZ");
        assertThat(owner).isNull();
    }

    @Test
    void findsAllPreloadedOwners() {
        // Test all preloaded plates for Ibai Zorrilla
        assertThat(repo.findByPlate("1234BCD").getName()).isEqualTo("Ibai Zorrilla");
        assertThat(repo.findByPlate("2345BCF").getName()).isEqualTo("Ibai Zorrilla");
        assertThat(repo.findByPlate("3456BFG").getName()).isEqualTo("Ibai Zorrilla");

        // Test all preloaded plates for Aitor Murguzur
        assertThat(repo.findByPlate("1111BCF").getName()).isEqualTo("Aitor Murguzur");
        assertThat(repo.findByPlate("2222CGH").getName()).isEqualTo("Aitor Murguzur");
        assertThat(repo.findByPlate("3333DFJ").getName()).isEqualTo("Aitor Murguzur");

        // Test all preloaded plates for Alex Zabaleta
        assertThat(repo.findByPlate("1357BCH").getName()).isEqualTo("Alex Zabaleta");
        assertThat(repo.findByPlate("2468DFK").getName()).isEqualTo("Alex Zabaleta");
        assertThat(repo.findByPlate("3579GHL").getName()).isEqualTo("Alex Zabaleta");

        // Test all preloaded plates for Aitor Ortiz
        assertThat(repo.findByPlate("1023BCF").getName()).isEqualTo("Aitor Ortiz");
        assertThat(repo.findByPlate("2134CGK").getName()).isEqualTo("Aitor Ortiz");
        assertThat(repo.findByPlate("3245DFL").getName()).isEqualTo("Aitor Ortiz");
    }

    @Test
    void savedOwnerOverridesRangeBasedOwner() {
        // First check range-based owner
        Owner rangeOwner = repo.findByPlate("5555ABC");
        assertThat(rangeOwner.getName()).isEqualTo("Alex Zabaleta");

        // Save a new owner with the same plate
        Owner newOwner = new Owner("5555ABC", "new@example.com", "New Owner");
        repo.save(newOwner);

        // Now it should return the saved owner
        Owner savedOwner = repo.findByPlate("5555ABC");
        assertThat(savedOwner.getName()).isEqualTo("New Owner");
        assertThat(savedOwner.getEmail()).isEqualTo("new@example.com");
    }

    @Test
    void findsOwnerAtRangeBoundaries() {
        // Test boundary values
        assertThat(repo.findByPlate("0000XYZ").getName()).isEqualTo("Ibai Zorrilla");
        assertThat(repo.findByPlate("2499XYZ").getName()).isEqualTo("Ibai Zorrilla");
        assertThat(repo.findByPlate("2500XYZ").getName()).isEqualTo("Aitor Murguzur");
        assertThat(repo.findByPlate("4999XYZ").getName()).isEqualTo("Aitor Murguzur");
        assertThat(repo.findByPlate("5000XYZ").getName()).isEqualTo("Alex Zabaleta");
        assertThat(repo.findByPlate("7499XYZ").getName()).isEqualTo("Alex Zabaleta");
        assertThat(repo.findByPlate("7500XYZ").getName()).isEqualTo("Aitor Ortiz");
        assertThat(repo.findByPlate("9999XYZ").getName()).isEqualTo("Aitor Ortiz");
    }

    @Test
    void returnsNullWhenBucketOutOfRange() throws Exception {
        Field field = OwnerRepository.class.getDeclaredField("rangeOwners");
        field.setAccessible(true);
        Owner[] original = (Owner[]) field.get(repo);
        try {
            field.set(repo, new Owner[] { original[0] });

            Owner owner = repo.findByPlate("3000ABC");
            assertThat(owner).isNull();
        } finally {
            field.set(repo, original);
        }
    }
}
