package com.zhaw.backend.controller;

import com.zhaw.backend.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.ServletWebRequest;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verification of the RFC 9457 wire format produced by
 * {@link GlobalExceptionHandler}. The HTTP paths run through MockMvc standalone
 * setup so the advice actually executes; the validation path is exercised by
 * invoking the override directly (container bean-validation needs a Jakarta EL
 * provider that is not on the test classpath). Assertions match against the raw
 * JSON body to avoid pulling in JsonPath.
 */
@DisplayName("GlobalExceptionHandler - Problem Details wire format")
class GlobalExceptionHandlerTest {

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new SampleController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("typed ApiException renders status/type/title/detail as problem+json")
    void rendersApiException() throws Exception {
        mvc.perform(get("/sample/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(content().string(containsString("\"type\":\"https://zurimpact.ch/problems/not-found\"")))
                .andExpect(content().string(containsString("\"title\":\"Not Found\"")))
                .andExpect(content().string(containsString("\"status\":404")))
                .andExpect(content().string(containsString("\"detail\":\"Widget 7 is gone\"")))
                .andExpect(content().string(containsString("\"instance\"")));
    }

    @Test
    @DisplayName("AccessDeniedException renders a 403 problem")
    void rendersAccessDenied() throws Exception {
        mvc.perform(get("/sample/forbidden"))
                .andExpect(status().isForbidden())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(content().string(containsString("\"type\":\"https://zurimpact.ch/problems/forbidden\"")))
                .andExpect(content().string(containsString("\"title\":\"Forbidden\"")))
                .andExpect(content().string(containsString("\"status\":403")));
    }

    @Test
    @DisplayName("unexpected exception renders a generic 500 with incidentId and no leak")
    void rendersInternalErrorWithoutLeak() throws Exception {
        mvc.perform(get("/sample/boom"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(content().string(containsString("\"type\":\"https://zurimpact.ch/problems/internal-error\"")))
                .andExpect(content().string(containsString("\"title\":\"Internal Server Error\"")))
                .andExpect(content().string(containsString("\"status\":500")))
                .andExpect(content().string(containsString("\"detail\":\"An unexpected error occurred.\"")))
                .andExpect(content().string(containsString("\"incidentId\"")))
                // must not leak the underlying exception message
                .andExpect(content().string(not(containsString("secret-stacktrace"))));
    }

    @Test
    @DisplayName("validation failure renders 400 with a field-level errors array")
    @SuppressWarnings("unchecked")
    void rendersValidationErrors() throws Exception {
        Method method = SampleController.class.getDeclaredMethod("validate", SampleBody.class);
        MethodParameter parameter = new MethodParameter(method, 0);
        BeanPropertyBindingResult binding = new BeanPropertyBindingResult(new SampleBody(null), "sampleBody");
        binding.addError(new FieldError("sampleBody", "name", "must not be blank"));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, binding);

        ResponseEntity<Object> response = new GlobalExceptionHandler()
                .handleMethodArgumentNotValid(ex, new HttpHeaders(), HttpStatus.BAD_REQUEST,
                        new ServletWebRequest(new MockHttpServletRequest()));

        assertNotNull(response);
        assertEquals(400, response.getStatusCode().value());
        ProblemDetail pd = (ProblemDetail) response.getBody();
        assertNotNull(pd);
        assertEquals(400, pd.getStatus());
        assertTrue(pd.getType().toString().endsWith("/problems/validation-error"));
        assertEquals("Validation failed", pd.getTitle());

        assertNotNull(pd.getProperties());
        List<Map<String, Object>> errors = (List<Map<String, Object>>) pd.getProperties().get("errors");
        assertNotNull(errors);
        assertEquals("name", errors.getFirst().get("field"));
        assertEquals("must not be blank", errors.getFirst().get("message"));
    }

    @RestController
    @RequestMapping("/sample")
    static class SampleController {

        @GetMapping("/not-found")
        void notFound() {
            throw new NotFoundException("Widget 7 is gone");
        }

        @GetMapping("/forbidden")
        void forbidden() {
            throw new AccessDeniedException("nope");
        }

        @GetMapping("/boom")
        void boom() {
            throw new IllegalStateException("secret-stacktrace");
        }

        // referenced by reflection in the validation test; never routed
        void validate(SampleBody body) {
        }
    }

    record SampleBody(String name) {
    }
}
