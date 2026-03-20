package com.zhaw.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import jakarta.persistence.EntityManagerFactory;
import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.DriverManager;
import java.util.Objects;
import java.util.Properties;

/**
 * Persistence configuration: DataSource → Flyway → JPA/Hibernate.
 *
 * Credentials are read from environment variables (DB_URL, DB_USER,
 * DB_PASSWORD).
 * Copy .env.example to .env and set real values for local development.
 * In Kubernetes, inject these as Secret-backed env vars in the pod spec.
 *
 * Flyway runs migrations BEFORE the EntityManagerFactory is created,
 * so Hibernate's "validate" mode will always see the correct schema.
 */
@Configuration
@EnableTransactionManagement
public class PersistenceConfig {

    // ── Read credentials from environment — NEVER hardcode these ────────

    /**
     * Loads key=value pairs from backend/.env (if present) into system properties.
     *
     * <p>
     * Motivation: In local dev, developers often keep secrets in a .env file,
     * but Java only sees real environment variables (System.getenv) unless a loader is used.
     * This tiny loader avoids adding an extra dependency.
     * </p>
     *
     * <p>
     * Precedence:
     * <ul>
     *   <li>JVM system properties (-DDB_URL=...)</li>
     *   <li>OS environment variables</li>
     *   <li>backend/.env file (only if neither of the above is set)</li>
     * </ul>
     * </p>
     */
    private static void loadDotenvIfPresent() {
        // Already loaded (or explicitly skipped)
        if (Boolean.getBoolean("ZURIMPACT_DOTENV_LOADED")) {
            return;
        }

        // Mark as attempted to avoid repeated file IO even if .env is missing.
        System.setProperty("ZURIMPACT_DOTENV_LOADED", "true");

        Path dotenv = findDotenv();
        if (dotenv == null) {
            // In Docker/Tomcat contexts the working dir might be different. We keep it best-effort.
            return;
        }

        try (BufferedReader reader = Files.newBufferedReader(dotenv, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                int idx = line.indexOf('=');
                if (idx <= 0) {
                    continue;
                }

                String key = line.substring(0, idx).trim();
                String value = line.substring(idx + 1).trim();
                if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }

                // Only set if neither JVM props nor real env vars provide it.
                if (System.getProperty(key) == null && System.getenv(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (IOException ignored) {
            // Best-effort only; app will still fail later with a clear message if values are missing.
        }
    }

    /**
     * Tries to locate a .env file in common dev/test/runtime working directory layouts.
     * Returns null if none found.
     */
    private static Path findDotenv() {
        // 1) Most common when running from repo root
        Path candidate = Path.of("backend", ".env");
        if (Files.exists(candidate)) {
            return candidate;
        }

        // 2) Sometimes people run from backend/ directly
        candidate = Path.of(".env");
        if (Files.exists(candidate)) {
            return candidate;
        }

        // 3) When running from backend/target/... or similar, walk upwards and look for backend/.env
        // user.dir is the JVM working directory.
        String userDir = System.getProperty("user.dir");
        if (userDir != null) {
            Path dir = Path.of(userDir).toAbsolutePath().normalize();
            for (int i = 0; i < 8 && dir != null; i++) {
                Path repoStyle = dir.resolve("backend").resolve(".env");
                if (Files.exists(repoStyle)) {
                    return repoStyle;
                }
                Path backendStyle = dir.resolve(".env");
                if (Files.exists(backendStyle) && dir.getFileName() != null && dir.getFileName().toString().equalsIgnoreCase("backend")) {
                    return backendStyle;
                }
                dir = dir.getParent();
            }
        }

        return null;
    }

    private static String requireEnv(String name) {
        loadDotenvIfPresent();

        // Prefer JVM system properties (e.g. -DDB_URL=...) for local debugging
        String value = System.getProperty(name);
        if (value == null) {
            value = System.getenv(name);
        }

        Objects.requireNonNull(value,
                "Required variable '" + name + "' is not set. " +
                        "Set it as an environment variable, or pass it as -D" + name + "=..., " +
                        "or create backend/.env from backend/.env.example.");
        return value;
    }

    /**
     * Defensive JDBC driver registration.
     *
     * <p>
     * In some IDE-driven exploded deployments, the first request can arrive while the webapp
     * classpath is still settling. Explicitly registering the PostgreSQL driver makes startup
     * more robust and avoids sporadic "No suitable driver" failures.
     * </p>
     */
    private static void ensurePostgresDriverRegistered() {
        try {
            // Will register itself with DriverManager when loaded.
            Class.forName("org.postgresql.Driver", true, PersistenceConfig.class.getClassLoader());
        } catch (ClassNotFoundException ignored) {
            // If the driver JAR is truly missing from WEB-INF/lib, the subsequent connection attempt will fail.
        }

        // Optional sanity-check: if no driver can handle our URL later, Hikari will still throw.
        // We keep this method side-effect only (registration), no hard fail here.
        try {
            DriverManager.getDrivers();
        } catch (Exception ignored) {
            // ignore
        }
    }

    // ── DataSource ──────────────────────────────────────────────────────

    @Bean
    public DataSource dataSource() {
        ensurePostgresDriverRegistered();
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(requireEnv("DB_URL"));
        ds.setUsername(requireEnv("DB_USER"));
        ds.setPassword(requireEnv("DB_PASSWORD"));

        // Pool sizing
        ds.setMaximumPoolSize(10);
        ds.setMinimumIdle(2);

        // Timeouts (milliseconds)
        ds.setConnectionTimeout(30_000); // 30s — fail fast if DB is unreachable
        ds.setIdleTimeout(600_000); // 10m — release idle connections
        ds.setMaxLifetime(1_800_000); // 30m — recycle before PostgreSQL drops them
        ds.setKeepaliveTime(60_000); // 1m — keep idle connections alive

        ds.setPoolName("ZurImpact-HikariPool");
        return ds;
    }

    // ── Flyway (runs before JPA) ────────────────────────────────────────

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        return Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .load();
    }

    // ── JPA / Hibernate ─────────────────────────────────────────────────

    @Bean
    @DependsOn("flyway") // guarantees migrations finish first
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean emf = new LocalContainerEntityManagerFactoryBean();
        emf.setDataSource(dataSource);
        emf.setPackagesToScan("ch.zhaw.zurimpact.model.entities");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        vendorAdapter.setShowSql(false); // never log SQL in production
        vendorAdapter.setGenerateDdl(false); // Flyway owns the schema
        emf.setJpaVendorAdapter(vendorAdapter);

        Properties jpaProps = new Properties();
        jpaProps.put("hibernate.hbm2ddl.auto", "validate");
        jpaProps.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        emf.setJpaProperties(jpaProps);

        return emf;
    }

    // ── Transaction manager ─────────────────────────────────────────────

    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }

    // ── JdbcTemplate (used by DAOs for native SQL) ──────────────────────

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
