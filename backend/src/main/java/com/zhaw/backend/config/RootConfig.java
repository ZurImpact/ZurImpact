package com.zhaw.backend.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Root ApplicationContext (Parent Context) for Services/Security/Filter etc.
 */
@Configuration
@ComponentScan(basePackages = {
        "com.zhaw.backend.config",
        "com.zhaw.backend.security",
        "com.zhaw.backend.model.dao",
        "com.zhaw.backend.service"
})
public class RootConfig {
}

