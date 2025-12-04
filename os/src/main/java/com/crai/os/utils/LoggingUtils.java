package com.crai.os.utils;

import org.springframework.stereotype.Component;

@Component
public class LoggingUtils {

    public void log(String msg) {
        System.out.println("LOG: " + msg);
    }
}
