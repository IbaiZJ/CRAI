package com.crai.os.utils;

import java.util.Random;

public class SpanishPlateGenerator {

    private static final String LETTERS = "BCDFGHJKLMNPRSTVWXYZ";
    private static final Random random = new Random();

    private SpanishPlateGenerator() {
        throw new IllegalStateException("Utility class");
    }

    public static String generate() {

        int numbers = random.nextInt(9000) + 1000; // 1000-9999

        StringBuilder letters = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            letters.append(LETTERS.charAt(random.nextInt(LETTERS.length())));
        }

        return numbers + letters.toString();
    }
}
