package com.zhaw.backend.controller;

import com.zhaw.backend.exception.ApiException;
import com.zhaw.backend.exception.ProblemTypes;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Translates every uncaught exception into an RFC 9457 Problem Details response
 * ({@code application/problem+json}).
 *
 * <p>Lives in {@code com.zhaw.backend.controller} on purpose: that is the only
 * package scanned by the DispatcherServlet (MVC) context in {@code AppConfig},
 * so the {@code ExceptionHandlerExceptionResolver} picks it up. {@code RootConfig}
 * explicitly excludes {@code @ControllerAdvice} from its scan to avoid a
 * duplicate bean in the parent context.
 *
 * <p>Spring sets the HTTP status from {@code ProblemDetail.getStatus()} and the
 * {@code application/problem+json} content type automatically when a handler
 * returns a {@link ProblemDetail}, and fills {@code instance} with the request
 * path when it is left null.
 *
 * <p>Security-layer denials (401/403) that are raised inside the filter chain
 * are handled separately by {@code ProblemDetailAuthenticationEntryPoint} and
 * {@code ProblemDetailAccessDeniedHandler}; the {@code AccessDeniedException}
 * handler here covers {@code @PreAuthorize} denials that surface through the
 * DispatcherServlet instead.
 */
@Hidden // exclude from springdoc: it cannot introspect ResponseEntityExceptionHandler's inherited handlers and fails /v3/api-docs generation
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Application errors with an explicit status/type/title. */
    @ExceptionHandler(ApiException.class)
    public ProblemDetail handleApiException(ApiException ex) {
        return problem(ex.getStatus(), ex.getTypeSlug(), ex.getTitle(), ex.getMessage());
    }

    /** {@code @PreAuthorize} / method-security denials reaching the dispatcher. */
    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        log.error("Access denied: ", ex);
        return problem(HttpStatus.FORBIDDEN, ProblemTypes.FORBIDDEN, "Forbidden",
                "You do not have permission to perform this action.");
    }

    /** Anything unexpected. Logs the full stack server-side; leaks nothing to the client. */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex, HttpServletRequest request) {
        String incidentId = UUID.randomUUID().toString();
        log.error("Unhandled exception [incidentId={}] on {} {}",
                incidentId, request.getMethod(), request.getRequestURI(), ex);
        ProblemDetail pd = problem(HttpStatus.INTERNAL_SERVER_ERROR, ProblemTypes.INTERNAL_ERROR,
                "Internal Server Error", "An unexpected error occurred.");
        pd.setProperty("incidentId", incidentId);
        return pd;
    }

    /** Bean-validation failures on {@code @Valid @RequestBody} DTOs — adds a field-level {@code errors} array. */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  HttpHeaders headers,
                                                                  HttpStatusCode status,
                                                                  WebRequest request) {
        ProblemDetail pd = problem(HttpStatus.BAD_REQUEST, ProblemTypes.VALIDATION_ERROR,
                "Validation failed", "One or more fields are invalid.");
        List<Map<String, Object>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("field", fe.getField());
                    entry.put("message", fe.getDefaultMessage() == null ? "invalid" : fe.getDefaultMessage());
                    return entry;
                })
                .toList();
        pd.setProperty("errors", errors);
        return handleExceptionInternal(ex, pd, headers, HttpStatus.BAD_REQUEST, request);
    }

    private static ProblemDetail problem(HttpStatus status, String typeSlug, String title, String detail) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, detail);
        pd.setType(URI.create(ProblemTypes.BASE + typeSlug));
        pd.setTitle(title);
        return pd;
    }
}