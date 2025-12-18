package com.crai.os.service;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OCRServiceTest {

    private OCRService ocrService;

    @BeforeEach
    void setUp() {
        ocrService = new OCRService();
    }

    @Test
    void initDoesNotThrow() {
        // Simply verify init doesn't throw any exception
        ocrService.init();
    }

    @Test
    void recognizeReturnsMockedPlate() {
        String result = ocrService.recognize("any_image_data");
        assertThat(result).isEqualTo("1234ABC");
    }

    @Test
    void recognizeReturnsConsistentResult() {
        String result1 = ocrService.recognize("image1");
        String result2 = ocrService.recognize("image2");

        assertThat(result1).isEqualTo(result2);
    }

    @Test
    void recognizeReturnsUnknownWhenImageIsNull() {
        String result = ocrService.recognize(null);
        assertThat(result).isEqualTo("UNKNOWN");
    }

    @Test
    void recognizeReturnsUnknownWhenImageIsBlank() {
        String result = ocrService.recognize("");
        assertThat(result).isEqualTo("UNKNOWN");
    }
}
