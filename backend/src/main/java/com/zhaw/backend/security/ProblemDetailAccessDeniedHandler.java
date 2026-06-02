package com.zhaw.backend.security;

import com.zhaw.backend.exception.ProblemTypes;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

/**
 * Emits a 403 {@code application/problem+json} response when an authenticated
 * caller is denied at the filter-chain level, replacing Spring Security's
 * default access-denied handler.
 */
public class ProblemDetailAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        ProblemJsonResponseWriter.write(response, 403, ProblemTypes.FORBIDDEN,
                "Forbidden", "You do not have permission to perform this action.",
                request.getRequestURI());
    }
}