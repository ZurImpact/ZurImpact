package com.zhaw.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhaw.backend.exception.ProblemTypes;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Writes an RFC 9457 Problem Details body for security-filter denials (401/403),
 * which are produced inside the Spring Security filter chain and therefore never
 * reach the {@code GlobalExceptionHandler} controller advice.
 *
 * <p>Builds a flat {@code LinkedHashMap} (type/title/status/detail/instance) and
 * serializes it with a plain {@link ObjectMapper}; this guarantees the RFC field
 * layout without depending on the MVC context's {@code ProblemDetail} Jackson
 * mixin, which is registered in the child servlet context only.
 */
final class ProblemJsonResponseWriter {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private ProblemJsonResponseWriter() {
    }

    static void write(HttpServletResponse response, int status, String typeSlug,
                      String title, String detail, String instance) throws IOException {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("type", ProblemTypes.BASE + typeSlug);
        body.put("title", title);
        body.put("status", status);
        body.put("detail", detail);
        if (instance != null) {
            body.put("instance", instance);
        }

        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        MAPPER.writeValue(response.getOutputStream(), body);
    }
}