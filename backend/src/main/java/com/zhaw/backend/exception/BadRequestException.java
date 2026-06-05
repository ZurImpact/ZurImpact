package com.zhaw.backend.exception;

import org.springframework.http.HttpStatus;

/**
 * 400 — the request was syntactically valid but semantically rejected.
 */
public class BadRequestException extends ApiException {

    public BadRequestException(String detail) {
        super(HttpStatus.BAD_REQUEST, ProblemTypes.BAD_REQUEST, "Bad Request", detail);
    }
}