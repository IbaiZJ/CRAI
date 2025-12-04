package com.crai.os.controller;

import com.crai.os.service.PoliceService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/police")
public class PoliceController {

    private final PoliceService policeService;

    public PoliceController(PoliceService policeService) {
        this.policeService = policeService;
    }

    @GetMapping("/alerts")
    public Object getAlerts() {
        return policeService.getProcessedAlerts();
    }
}
