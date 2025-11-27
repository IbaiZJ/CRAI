package com.crai;

import java.util.LinkedList;
import java.util.Queue;

public class BufferOCR {
 private final int capacity;
    private final Queue<String> cola = new LinkedList<>();

    public BufferOCR(int capacity) {
        this.capacity = capacity;
    }

    public synchronized void producir(String matricula) throws InterruptedException {
        while (cola.size() == capacity) {
            wait(); 
        }

        cola.add(matricula);
        System.out.println("➡️ Entra en cola OCR: " + matricula);

        notifyAll();
    }

    public synchronized String consumir() throws InterruptedException {
        while (cola.isEmpty()) {
            wait(); 
        }

        String matricula = cola.remove();
        notifyAll();
        return matricula;
    }
}
