package com.crai.os.utils;

import java.util.Random;

import com.crai.os.model.Vehicle;

public class RandomVehicleGenerator {

    private static final Random r = new Random();

    private RandomVehicleGenerator() {
        throw new IllegalStateException("Utility class");
    }

    public static Vehicle generate(double stolenProbability, double itvFailProbability) {

        String plate = SpanishPlateGenerator.generate();

        String[] tags = { "C", "ECO", "0", null, "B", "A" };
        String env = tags[r.nextInt(tags.length)];

        boolean stolen = r.nextDouble() < stolenProbability;
        boolean itvFail = r.nextDouble() < itvFailProbability;

        boolean alert = r.nextBoolean();
        int priority = r.nextInt(10);

        Vehicle v = new Vehicle(plate, priority, alert, env, stolen);
        v.setItvFail(itvFail);

        return v;
    }
}
