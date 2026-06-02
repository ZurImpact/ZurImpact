package com.zhaw.backend.security;

import com.zhaw.backend.exception.ProblemTypes;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;

/**
 * Emits a 401 {@code application/problem+json} response when an unauthenticated
 * request hits a protected endpoint, replacing Spring Security's default
 * (bodyless) entry point.
 */
public class ProblemDetailAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        ProblemJsonResponseWriter.write(response, 401, ProblemTypes.UNAUTHORIZED,
                "Unauthorized", "Authentication is required to access this resource.",
                request.getRequestURI());
    }
}