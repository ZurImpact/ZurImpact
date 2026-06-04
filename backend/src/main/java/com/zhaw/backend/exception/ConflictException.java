package com.zhaw.backend.exception;

import org.springframework.http.HttpStatus;

/** 409 — the request conflicts with the current state (e.g. a duplicate). */
public class ConflictException extends ApiException {

    public ConflictException(String detail) {
        super(HttpStatus.CONFLICT, ProblemTypes.CONFLICT, "Conflict", detail);
    }
}