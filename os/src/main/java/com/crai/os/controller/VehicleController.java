package com.crai.os.controller;

import com.crai.os.model.Vehicle;
import com.crai.os.service.CameraPoolService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vehicle")
public class VehicleController {

    private final CameraPoolService cameraService;

    public VehicleController(CameraPoolService cameraService) {
        this.cameraService = cameraService;
    }

    @PostMapping("/send")
    public String sendVehicle(@RequestBody Vehicle v) {
        cameraService.enqueueVehicle(v);
        return "Vehicle added to camera queue.";
    }
}

