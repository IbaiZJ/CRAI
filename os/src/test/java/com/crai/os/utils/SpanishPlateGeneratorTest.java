package com.crai.os.utils;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

class SpanishPlateGeneratorTest {

    private static final Pattern PATTERN = Pattern.compile("^[1-9][0-9]{3}[A-Z]{3}$");
    private static final String VALID_LETTERS = "BCDFGHJKLMNPRSTVWXYZ";

    @Test
    void privateConstructorForCoverage() throws Exception {
        Constructor<SpanishPlateGenerator> constructor = SpanishPlateGenerator.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        // Just invoke to cover the private constructor
        SpanishPlateGenerator instance = constructor.newInstance();
        assertThat(instance).isNotNull();
    }

    @Test
    void generatesPlateWithFourDigitsAndThreeLetters() {
        for (int i = 0; i < 20; i++) {
            String plate = SpanishPlateGenerator.generate();
            assertThat(plate).matches(PATTERN);
        }
    }

    @RepeatedTest(50)
    void generatedPlateMatchesExpectedFormat() {
        String plate = SpanishPlateGenerator.generate();
        assertThat(plate).hasSize(7);
        assertThat(plate).matches(PATTERN);
    }

    @Test
    void generatedPlateNumbersAreInValidRange() {
        for (int i = 0; i < 100; i++) {
            String plate = SpanishPlateGenerator.generate();
            String numberPart = plate.substring(0, 4);
            int number = Integer.parseInt(numberPart);
            assertThat(number).isBetween(1000, 9999);
        }
    }

    @Test
    void generatedPlateLettersAreValid() {
        for (int i = 0; i < 100; i++) {
            String plate = SpanishPlateGenerator.generate();
            String letterPart = plate.substring(4);
            for (char c : letterPart.toCharArray()) {
                assertThat(VALID_LETTERS).contains(String.valueOf(c));
            }
        }
    }

    @Test
    void generatesMultipleUniquePlates() {
        Set<String> plates = new HashSet<>();
        for (int i = 0; i < 100; i++) {
            plates.add(SpanishPlateGenerator.generate());
        }
        // With 100 generations, we should have multiple unique plates
        assertThat(plates.size()).isGreaterThan(50);
    }
}
