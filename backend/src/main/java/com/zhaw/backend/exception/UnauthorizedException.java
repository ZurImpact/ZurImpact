package com.zhaw.backend.exception;

import org.springframework.http.HttpStatus;

/** 401 — authentication is required and has failed or is missing. */
public class UnauthorizedException extends ApiException {

    public UnauthorizedException(String detail) {
        super(HttpStatus.UNAUTHORIZED, ProblemTypes.UNAUTHORIZED, "Unauthorized", detail);
    }
}