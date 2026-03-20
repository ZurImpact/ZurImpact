package com.zhaw.backend.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Root ApplicationContext (Parent Context) for Services/Security/Filter etc.
 */
@Configuration
@ComponentScan(basePackages = {
        "com.zhaw.backend.security" // SessionService, AuthService, AuthCookieFilter, SecurityConfig
})
public class RootConfig {
}

