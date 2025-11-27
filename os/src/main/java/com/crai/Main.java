package com.crai;

public class Main {

    public static void main(String[] args) {

        System.out.println("\n===== SIMULACIÓN VEHÍCULOS + CÁMARA + OCR =====\n");

        final int NUM_VEHICULOS = 20;
        final int CAPACIDAD_COLA = 5;

        Camera camara = new Camera();
        BufferOCR buffer = new BufferOCR(CAPACIDAD_COLA);

        // OCR (consumidor)
        OCR ocr = new OCR(buffer);
        ocr.setDaemon(true);
        ocr.start();

        // Vehículos (productores)
        Thread[] vehiculos = new Thread[NUM_VEHICULOS];

        for (int i = 0; i < NUM_VEHICULOS; i++) {
            vehiculos[i] = new Vehicle(i, camara, buffer);
            vehiculos[i].start();
        }

        // Esperar fin de llegada de vehículos
        for (Thread t : vehiculos) {
            try {
                t.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println("\n🎉 Simulación completada.\n");
    }
}