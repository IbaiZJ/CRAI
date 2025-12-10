package com.crai.os.utils;

import org.junit.jupiter.api.Test;

import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

class SpanishPlateGeneratorTest {

    private static final Pattern PATTERN = Pattern.compile("^[1-9][0-9]{3}[A-Z]{3}$");

    @Test
    void generatesPlateWithFourDigitsAndThreeLetters() {
        for (int i = 0; i < 20; i++) {
            String plate = SpanishPlateGenerator.generate();
            assertThat(plate).matches(PATTERN);
        }
    }
}
