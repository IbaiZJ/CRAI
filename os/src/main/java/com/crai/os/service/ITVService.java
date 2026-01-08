package com.crai.os.service;

import com.crai.os.model.*;
import com.crai.os.repository.ITVRepository;
import com.crai.os.utils.SpanishPlateGenerator;

import jakarta.annotation.PostConstruct;

import org.springframework.stereotype.Service;
import java.time.Duration;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import com.crai.os.config.SimulationConfig;

@Service
public class ITVService {

    private final ITVRepository itvRepository;
    private final SimulationConfig config;
    private final Random randomGenerator = new Random();

    public ITVService(ITVRepository itvRepository, SimulationConfig config) {
        this.itvRepository = itvRepository;
        this.config = config;
    }

    public ITVStatus check(String plate) {

        ITVRecord itvRecord = itvRepository.find(plate);

        if (itvRecord == null) {
            // Genera un registro al vuelo: probabilidad de fallo según configuración.
            boolean fail = randomGenerator.nextDouble() < config.getItvFailProbability();
            long now = System.currentTimeMillis();
            long expiration = fail
                    // Caducada en algún momento de los últimos 90 días
                    ? now - randomDurationMillis(90)
                    // Válida pero con caducidad entre 0 y 180 días
                    : now + randomDurationMillis(180);
            itvRecord = new ITVRecord(plate, expiration);
            itvRepository.save(itvRecord);
        }

        if (itvRecord.isExpired()) {
            return ITVStatus.EXPIRED; // ITV caducada
        }

        long daysLeft = (itvRecord.getExpirationTimestamp() - System.currentTimeMillis()) / (1000 * 60 * 60 * 24);
        if (daysLeft <= 30) {
            return ITVStatus.EXPIRING_SOON; // Próxima a caducar
        }

        return ITVStatus.VALID; // ITV OK
    }

    private long randomDurationMillis(int maxDays) {
        long max = Duration.ofDays(maxDays).toMillis();
        return ThreadLocalRandom.current().nextLong(1, max + 1);
    }

    /**
     * Genera datos aleatorios de ITV al arrancar
     */
    @PostConstruct
    public void preloadItvDatabase() {
        long now = System.currentTimeMillis();

        for (int i = 0; i < 200; i++) {

            String plate = SpanishPlateGenerator.generate();

            boolean expired = randomGenerator.nextBoolean();

            long oneYearMillis = Duration.ofDays(365).toMillis();
            long delta = ThreadLocalRandom.current().nextLong(0, oneYearMillis + 1);
            long expiration = expired
                    ? now - delta
                    : now + delta;

            itvRepository.save(new ITVRecord(plate, expiration));
        }
    }
}
