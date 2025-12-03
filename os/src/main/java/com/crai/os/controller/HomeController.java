package com.crai.os.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "La aplicación está en ejecución";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
