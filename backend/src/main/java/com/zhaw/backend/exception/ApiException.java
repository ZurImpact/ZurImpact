package com.zhaw.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base type for application errors that map to an RFC 9457 Problem Details
 * response. Carries everything the {@code GlobalExceptionHandler} needs to
 * build a {@code ProblemDetail} without per-exception handler code: the HTTP
 * status, the problem {@code type} slug, and a human-readable {@code title}.
 * The exception message becomes the problem {@code detail}.
 */
@Getter
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String typeSlug;
    private final String title;

    protected ApiException(HttpStatus status, String typeSlug, String title, String detail) {
        super(detail);
        this.status = status;
        this.typeSlug = typeSlug;
        this.title = title;
    }
}
