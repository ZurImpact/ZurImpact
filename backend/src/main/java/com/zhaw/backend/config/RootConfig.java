package com.zhaw.backend.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.context.annotation.Import;

/**
 * Root ApplicationContext (Parent Context) for Services/Security/Filter etc.
 */
@Configuration
@Import(PersistenceConfig.class)
@ComponentScan(
        basePackages = "com.zhaw.backend",
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class, RestController.class}),
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com\\.zhaw\\.backend\\.config\\..*")
        }
)
public class RootConfig {
}
