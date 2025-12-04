package com.crai.os.service;

import com.crai.os.model.*;
import com.crai.os.repository.ITVRepository;
import com.crai.os.utils.SpanishPlateGenerator;

import jakarta.annotation.PostConstruct;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Random;

@Service
public class ITVService {

    private final ITVRepository itvRepository;
    private final Random random = new Random();

    public ITVService(ITVRepository itvRepository) {
        this.itvRepository = itvRepository;
    }

    public ITVStatus check(String plate) {

        ITVRecord record = itvRepository.find(plate);

        if (record == null) {
            return ITVStatus.UNKNOWN; // No consta ITV
        }

        if (record.isExpired()) {
            return ITVStatus.EXPIRED; // ITV caducada
        }

        return ITVStatus.VALID; // ITV OK
    }

    /**
     * Genera datos aleatorios de ITV al arrancar
     */
    @PostConstruct
    public void preloadItvDatabase() {
        long now = System.currentTimeMillis();

        for (int i = 0; i < 200; i++) {

            String plate = SpanishPlateGenerator.generate();

            boolean expired = random.nextBoolean();

            long expiration = expired
                    ? now - random.nextInt(1000 * 60 * 60 * 24 * 365)
                    : now + random.nextInt(1000 * 60 * 60 * 24 * 365);

            itvRepository.save(new ITVRecord(plate, expiration));
        }
    }
}
