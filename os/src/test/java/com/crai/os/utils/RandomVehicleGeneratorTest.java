package com.crai.os.utils;

import com.crai.os.model.Vehicle;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

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
}
