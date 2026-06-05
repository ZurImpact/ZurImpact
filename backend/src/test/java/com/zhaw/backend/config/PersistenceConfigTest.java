package com.zhaw.backend.config;

import jakarta.persistence.EntityManagerFactory;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Smoke test that verifies the Spring application context loads correctly
 * with all persistence beans wired. Uses the same Testcontainers-backed
 * config as the integration tests.
 * <p>
 * If Docker is not available, the entire test class is skipped.
 */
@ExtendWith(DockerAvailableCondition.class)
@SpringJUnitConfig(TestDatabaseConfig.class)
@DisplayName("PersistenceConfig – Context Smoke Test")
class PersistenceConfigTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private Flyway flyway;

    @Test
    @DisplayName("DataSource bean is available")
    void dataSourceBeanExists() {
        assertNotNull(dataSource);
    }

    @Test
    @DisplayName("JdbcTemplate bean is available")
    void jdbcTemplateBeanExists() {
        assertNotNull(jdbcTemplate);
    }

    @Test
    @DisplayName("EntityManagerFactory bean is available")
    void entityManagerFactoryBeanExists() {
        assertNotNull(entityManagerFactory);
    }

    @Test
    @DisplayName("TransactionManager bean is available")
    void transactionManagerBeanExists() {
        assertNotNull(transactionManager);
    }

    @Test
    @DisplayName("Flyway has applied at least one migration")
    void flywayHasAppliedMigrations() {
        int appliedCount = flyway.info().applied().length;
        assertTrue(appliedCount >= 1,
                "Expected at least 1 applied Flyway migration, got " + appliedCount);
    }
}
