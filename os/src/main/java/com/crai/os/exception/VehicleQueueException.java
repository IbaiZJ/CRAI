package com.crai.os.exception;

/**
 * Exception thrown when a vehicle cannot be enqueued for processing.
 */
public class VehicleQueueException extends RuntimeException {

    public VehicleQueueException(String message) {
        super(message);
    }

    public VehicleQueueException(String message, Throwable cause) {
        super(message, cause);
    }
}
