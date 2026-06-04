package com.zhaw.backend.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for the security-filter Problem Detail handlers (401/403). These
 * run inside the filter chain — never through the controller advice — so they
 * serialize the RFC 9457 body themselves via {@link ProblemJsonResponseWriter}.
 */
@DisplayName("ProblemDetail security handlers")
class ProblemDetailSecurityHandlersTest {

    private final ObjectMapper mapper = new ObjectMapper();

    private MockHttpServletRequest request(String uri) {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRequestURI(uri);
        return req;
    }

    @Test
    @DisplayName("entry point writes a 401 problem+json with type/title/status/detail/instance")
    void authenticationEntryPointWrites401() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        new ProblemDetailAuthenticationEntryPoint()
                .commence(request("/api/users/me/actions"), response, new BadCredentialsException("nope"));

        assertEquals(401, response.getStatus());
        assertTrue(response.getContentType().contains("application/problem+json"),
                "content type was " + response.getContentType());

        JsonNode body = mapper.readTree(response.getContentAsString());
        assertTrue(body.get("type").asText().endsWith("/problems/unauthorized"));
        assertEquals("Unauthorized", body.get("title").asText());
        assertEquals(401, body.get("status").asInt());
        assertEquals("/api/users/me/actions", body.get("instance").asText());
        assertTrue(body.has("detail"));
    }

    @Test
    @DisplayName("access denied handler writes a 403 problem+json with type/title/status/detail/instance")
    void accessDeniedHandlerWrites403() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        new ProblemDetailAccessDeniedHandler()
                .handle(request("/api/users/999/actions"), response, new AccessDeniedException("denied"));

        assertEquals(403, response.getStatus());
        assertTrue(response.getContentType().contains("application/problem+json"),
                "content type was " + response.getContentType());

        JsonNode body = mapper.readTree(response.getContentAsString());
        assertTrue(body.get("type").asText().endsWith("/problems/forbidden"));
        assertEquals("Forbidden", body.get("title").asText());
        assertEquals(403, body.get("status").asInt());
        assertEquals("/api/users/999/actions", body.get("instance").asText());
        assertTrue(body.has("detail"));
    }
}
