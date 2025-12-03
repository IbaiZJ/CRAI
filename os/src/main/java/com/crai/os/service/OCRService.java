package com.crai.os.service;


import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class OCRService {

    @PostConstruct
    public void init() {
        System.out.println("📸 OCR initialised");
    }

    public String recognize(String image) {
        return "1234ABC"; // Mock
    }
}

