package com.crai;

import java.util.Random;

public class OCR extends Thread{
    
    private final BufferOCR buffer;
    private final Random random = new Random();

    public OCR(BufferOCR buffer) {
        this.buffer = buffer;
    }

    @Override
    public void run() {
        while (true) {
            try {
                String matricula = buffer.consumir();
                System.out.println("🔍 OCR procesando: " + matricula);

                Thread.sleep(600 + random.nextInt(500));

                String[] etiquetas = {"0", "B", "C", "ECO"};
                String etiqueta = etiquetas[random.nextInt(etiquetas.length)];

                String estado = (etiqueta.equals("C") || etiqueta.equals("ECO"))
                        ? "PERMITIDO"
                        : "DENEGADO";

                System.out.println("✔ OCR " + matricula +
                        ": Etiqueta " + etiqueta + " → " + estado);

            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
