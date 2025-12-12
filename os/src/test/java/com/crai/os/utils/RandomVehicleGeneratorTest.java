package com.crai.os.utils;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

import com.crai.os.model.Vehicle;

class RandomVehicleGeneratorTest {

    private static final Pattern PLATE = Pattern.compile("^[1-9][0-9]{3}[A-Z]{3}$");
    private static final Set<String> TAGS = new HashSet<>(Arrays.asList("C", "ECO", "0", "B", "A", null));

    @Test
    void generatesVehicleWithPlateAndPriority() {
        Vehicle v = RandomVehicleGenerator.generate(0.3, 0.4);

        assertThat(v.getPlate()).matches(PLATE);
        assertThat(v.getPriority()).isBetween(0, 9);
        assertThat(TAGS).contains(v.getEnvTag());
    }

    @Test
    void generatedVehicleHasValidEnvTag() {
        Vehicle v = RandomVehicleGenerator.generate(0.0, 0.0);
        
        // envTag can be null or one of the defined tags
        if (v.getEnvTag() != null) {
            assertThat(v.getEnvTag()).isIn("C", "ECO", "0", "B", "A");
        }
    }

    @Test
    void generatedVehicleHasStolenFlag() {
        // Generate with 100% stolen probability
        Vehicle v = RandomVehicleGenerator.generate(1.0, 0.0);
        assertThat(v.isStolen()).isTrue();
        
        // Generate with 0% stolen probability
        Vehicle v2 = RandomVehicleGenerator.generate(0.0, 0.0);
        assertThat(v2.isStolen()).isFalse();
    }

    @Test
    void generatedVehicleHasItvFailFlag() {
        // Generate with 100% ITV fail probability
        Vehicle v = RandomVehicleGenerator.generate(0.0, 1.0);
        assertThat(v.hasItvFail()).isTrue();
        
        // Generate with 0% ITV fail probability
        Vehicle v2 = RandomVehicleGenerator.generate(0.0, 0.0);
        assertThat(v2.hasItvFail()).isFalse();
    }

    @RepeatedTest(10)
    void generatedVehicleHasValidPlateFormat() {
        Vehicle v = RandomVehicleGenerator.generate(0.5, 0.5);
        assertThat(v.getPlate()).matches(PLATE);
    }

    @RepeatedTest(10)
    void generatedVehiclePriorityIsInRange() {
        Vehicle v = RandomVehicleGenerator.generate(0.5, 0.5);
        assertThat(v.getPriority()).isBetween(0, 9);
    }

    @Test
    void generatesMultipleUniqueVehicles() {
        Set<String> plates = new HashSet<>();
        for (int i = 0; i < 100; i++) {
            Vehicle v = RandomVehicleGenerator.generate(0.5, 0.5);
            plates.add(v.getPlate());
        }
        // With 100 generations, we should have multiple unique plates
        assertThat(plates.size()).isGreaterThan(1);
    }
}
