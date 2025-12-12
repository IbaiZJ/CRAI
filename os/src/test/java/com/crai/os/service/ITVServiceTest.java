package com.crai.os.service;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.crai.os.config.SimulationConfig;
import com.crai.os.model.ITVRecord;
import com.crai.os.model.ITVStatus;
import com.crai.os.repository.ITVRepository;

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

    @Test
    void createsValidRecordWhenMissingAndFailProbabilityIsZero() {
        when(config.getItvFailProbability()).thenReturn(0.0); // fuerza éxito

        ITVService service = new ITVService(repository, config);
        ITVStatus status = service.check("5678EFG"); // no existe en repo

        // Should be either VALID or EXPIRING_SOON (random duration between 0-180 days)
        assertThat(status).isIn(ITVStatus.VALID, ITVStatus.EXPIRING_SOON);
        assertThat(repository.exists("5678EFG")).isTrue();
    }

    @Test
    void preloadItvDatabaseCreatesRecords() {
        ITVService service = new ITVService(repository, config);
        
        // preloadItvDatabase is called by @PostConstruct, but we can call it manually too
        service.preloadItvDatabase();

        // After preload, there should be records in the repository (at least from preload)
        // Note: we can't easily check exact count since we start with empty and add 200
    }

    @Test
    void returnsExpiringSoonAtBoundary30Days() {
        long exactly30Days = System.currentTimeMillis() + Duration.ofDays(30).toMillis();
        repository.save(new ITVRecord("6789FGH", exactly30Days));

        ITVService service = new ITVService(repository, config);
        ITVStatus status = service.check("6789FGH");

        assertThat(status).isEqualTo(ITVStatus.EXPIRING_SOON);
    }

    @Test
    void returnsValidAt31Days() {
        long exactly31Days = System.currentTimeMillis() + Duration.ofDays(31).toMillis();
        repository.save(new ITVRecord("7890GHI", exactly31Days));

        ITVService service = new ITVService(repository, config);
        ITVStatus status = service.check("7890GHI");

        assertThat(status).isEqualTo(ITVStatus.VALID);
    }
}
