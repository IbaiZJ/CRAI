package com.crai;

public class Vehicle extends Thread{
 private final int id;
    private final Camera camara;
    private final BufferOCR buffer;

    public Vehicle(int id, Camera camara, BufferOCR buffer) {
        this.id = id;
        this.camara = camara;
        this.buffer = buffer;
    }

    @Override
    public void run() {
        try {
            // Llegada aleatoria
            Thread.sleep((long) (Math.random() * 1500));

            System.out.println("🚗 Vehículo " + id + " llega a la zona");

            // Paso 1: Capturar matrícula (recurso crítico)
            String matricula = camara.capturarMatricula(id);

            // Paso 2: Enviar al OCR (productor)
            buffer.producir(matricula);

        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
