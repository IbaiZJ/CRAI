package com.crai.os.controller;

import org.springframework.web.bind.annotation.*;
import com.crai.os.service.*;

@RestController
@RequestMapping("/camera")
public class CameraController {

    private final CameraPoolService cameraService;

    public CameraController(CameraPoolService cameraService) {
        this.cameraService = cameraService;
    }

    @GetMapping("/status")
    public String status() {
        return cameraService.getStatus();
    }
}
