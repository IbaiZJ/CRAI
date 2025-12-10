package com.crai.os.service;

import com.crai.os.config.SimulationConfig;
import com.crai.os.model.ITVRecord;
import com.crai.os.model.ITVStatus;
import com.crai.os.repository.ITVRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ITVServiceTest {

    private ITVRepository repository;

    @Mock
    private SimulationConfig config;

    @BeforeEach
    void setUp() {
        repository = new ITVRepository();
    }

    @Test
    void returnsExpiredWhenRecordIsPastDueDate() {
        long expiredTs = System.currentTimeMillis() - Duration.ofDays(5).toMillis();
        repository.save(new ITVRecord("1234ABC", expiredTs));

        ITVService service = new ITVService(repository, config);
        ITVStatus status = service.check("1234ABC");

        assertThat(status).isEqualTo(ITVStatus.EXPIRED);
    }

    @Test
    void returnsExpiringSoonWhenRecordExpiresWithin30Days() {
        long soonTs = System.currentTimeMillis() + Duration.ofDays(7).toMillis();
        repository.save(new ITVRecord("2345BCD", soonTs));

        ITVService service = new ITVService(repository, config);
        ITVStatus status = service.check("2345BCD");

        assertThat(status).isEqualTo(ITVStatus.EXPIRING_SOON);
    }

    @Test
    void returnsValidWhenRecordExpiresBeyond30Days() {
        long futureTs = System.currentTimeMillis() + Duration.ofDays(60).toMillis();
        repository.save(new ITVRecord("3456CDE", futureTs));

        ITVService service = new ITVService(repository, config);
        ITVStatus status = service.check("3456CDE");

        assertThat(status).isEqualTo(ITVStatus.VALID);
    }

    @Test
    void createsExpiredRecordWhenMissingAndFailProbabilityIsOne() {
        when(config.getItvFailProbability()).thenReturn(1.0); // fuerza fallo

        ITVService service = new ITVService(repository, config);
        ITVStatus status = service.check("4567DEF"); // no existe en repo

        assertThat(status).isEqualTo(ITVStatus.EXPIRED);
        assertThat(repository.exists("4567DEF")).isTrue();
    }
}
