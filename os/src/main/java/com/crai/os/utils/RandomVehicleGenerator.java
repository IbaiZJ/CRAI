package com.crai.os.utils;

import java.util.Random;

import com.crai.os.model.Vehicle;

public class RandomVehicleGenerator {

    private static final Random r = new Random();

    private RandomVehicleGenerator() {
        // Private constructor to hide implicit public one
    }

    public static Vehicle generate(double stolenProbability, double itvFailProbability) {

        String plate = SpanishPlateGenerator.generate();

        String[] tags = { "C", "ECO", "0", null, "B", "A" };
        String env = tags[r.nextInt(tags.length)];

        boolean stolen = r.nextDouble() < stolenProbability;
        boolean itvFail = r.nextDouble() < itvFailProbability;

        boolean alert = r.nextBoolean();
        int priority = computePriority(alert, stolen, itvFail, env);

        Vehicle v = new Vehicle(plate, priority, alert, env, stolen);
        v.setItvFail(itvFail);

        return v;
    }

    // Priority order: 3 stolen/alert, 2 itv fail, 1 invalid env tag, 0 normal.
    private static int computePriority(boolean alert, boolean stolen, boolean itvFail, String envTag) {
        if (stolen || alert) {
            return 3;
        }
        if (itvFail) {
            return 2;
        }
        if (!isValidEnvTag(envTag)) {
            return 1;
        }
        return 0;
    }

    private static boolean isValidEnvTag(String envTag) {
        if (envTag == null) {
            return false;
        }
        String tag = envTag.toUpperCase();
        return "C".equals(tag) || "ECO".equals(tag) || "0".equals(tag);
    }
}
