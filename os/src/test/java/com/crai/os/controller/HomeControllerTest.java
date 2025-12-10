package com.crai.os.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class HomeControllerTest {

    private final HomeController controller = new HomeController();

    @Test
    void homeReturnsExpectedMessage() {
        assertEquals("La aplicación está en ejecución", controller.home());
    }

    @Test
    void healthReturnsOk() {
        assertEquals("OK", controller.health());
    }
}
