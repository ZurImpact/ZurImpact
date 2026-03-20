package com.zhaw.backend.config;

import org.springframework.security.web.context.AbstractSecurityWebApplicationInitializer;

/**
 * Registers the Spring Security filter chain \(delegatingFilterProxy\) in the servlet container.
 *
 * The root ApplicationContext is created via {@link WebAppInitializer#getRootConfigClasses()} \(RootConfig\).
 * Therefore, do NOT call super\(...\) here, otherwise RootConfig is overridden and beans such as SessionService

 */
public class SecurityInitializer extends AbstractSecurityWebApplicationInitializer {
}
