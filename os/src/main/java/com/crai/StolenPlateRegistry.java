package com.crai;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class StolenPlateRegistry {

    private static final Set<String> stolenPlates = ConcurrentHashMap.newKeySet();

    public static void init(int numVehicles) {

        stolenPlates.clear();

        int stolenCount = Math.max(1, numVehicles / 10); 
        // Ejemplo: 30 vehículos → 3 robados

        for (int i = 0; i < stolenCount; i++) {
            int randomId = (int)(Math.random() * numVehicles);
            String plate = "ABC" + String.format("%03d", randomId);
            stolenPlates.add(plate);
        }

        System.out.println("🔒 Stolen plates loaded: " + stolenPlates);
    }

    public static boolean isStolen(String plate) {
        return stolenPlates.contains(plate);
    }
}
