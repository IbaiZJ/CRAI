package com.crai;

public class Camera {

    public synchronized String capturarMatricula(int vehiculoId) throws InterruptedException {
        System.out.println("📸 Cámara capturando matrícula del vehículo " + vehiculoId);

        // Simulación de tiempo de captura
        Thread.sleep(400 + (int)(Math.random() * 300));

        String matricula = "ABC" + String.format("%03d", vehiculoId);

        System.out.println("📸 Cámara: matrícula capturada → " + matricula);

        return matricula;
    }
}
