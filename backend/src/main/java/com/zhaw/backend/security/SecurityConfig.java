package com.zhaw.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security wiring for the JSON API.
 *
 * <p>CSRF is disabled because: (a) every endpoint is JSON-only — no cross-site
 * forms, (b) the auth cookie is HttpOnly + SameSite=Lax, which prevents
 * cross-site cookie inclusion on top-level navigations from third-party
 * origins for state-changing methods. CORS is restricted to a configured
 * origin list, not "*".
 *
 * <p>Authentication uses {@link AuthCookieFilter} reading sessions through
 * {@link DbSessionService}; principals are plain UsernamePasswordAuthenticationToken
 * carrying an {@link AuthenticatedUser} principal so a future OAuth filter can
 * slot in beside it without conflict.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOriginsCsv;

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> allowed = Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        config.setAllowedOrigins(allowed);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Content-Type", "Accept", "X-Requested-With"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthCookieFilter authCookieFilter(SessionService sessionService) {
        return new AuthCookieFilter(sessionService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthCookieFilter authCookieFilter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(h -> h
                        .frameOptions(frame -> frame.deny())
                        .httpStrictTransportSecurity(hsts -> hsts.maxAgeInSeconds(31_536_000)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(new OrRequestMatcher(
                                new AntPathRequestMatcher("/swagger-ui.html"),
                                new AntPathRequestMatcher("/swagger-ui/**"),
                                new AntPathRequestMatcher("/v3/api-docs/**")
                        )).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/register", HttpMethod.POST.name())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/verify-email", HttpMethod.POST.name())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/resend-verification", HttpMethod.POST.name())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/login", HttpMethod.POST.name())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/password-reset/request", HttpMethod.POST.name())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/password-reset/confirm", HttpMethod.POST.name())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/dev-login", HttpMethod.POST.name())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/logout", HttpMethod.POST.name())).authenticated()
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/whoami", HttpMethod.GET.name())).authenticated()
                        .requestMatchers(new AntPathRequestMatcher("/api/users/me/password-change", HttpMethod.POST.name())).authenticated()
                        .requestMatchers(new AntPathRequestMatcher("/api/users/**", HttpMethod.GET.name())).hasAnyRole("USER", "ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/action", HttpMethod.GET.name())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/actions", HttpMethod.POST.name())).hasAnyRole("ADMIN", "PARTNER")
                        .requestMatchers(new AntPathRequestMatcher("/api/actions/**", HttpMethod.PUT.name())).hasAnyRole("ADMIN", "PARTNER")
                        .requestMatchers(new AntPathRequestMatcher("/api/actions/**", HttpMethod.DELETE.name())).hasAnyRole("ADMIN", "PARTNER")
                        .requestMatchers(new AntPathRequestMatcher("/api/subTasks/**", HttpMethod.PUT.name())).hasAnyRole("ADMIN", "PARTNER")
                        .requestMatchers(new AntPathRequestMatcher("/api/subTasks/**", HttpMethod.DELETE.name())).hasAnyRole("ADMIN", "PARTNER")
                        .requestMatchers(new AntPathRequestMatcher("/api/settings/**")).authenticated()
                        .requestMatchers(new AntPathRequestMatcher("/api/admin/**")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/user/**")).hasAnyRole("USER", "ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(authCookieFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
