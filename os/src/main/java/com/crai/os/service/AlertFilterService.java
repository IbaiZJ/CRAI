package com.crai.os.service;

import org.springframework.stereotype.Service;

import com.crai.os.model.AlertType;

@Service
public class AlertFilterService {

    public boolean shouldSend(AlertType type) {
        return type == AlertType.POLICE;
    }
}
