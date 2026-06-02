package com.zhaw.backend.exception;

import org.springframework.http.HttpStatus;

/** 403 — the caller is authenticated but not allowed to perform the action. */
public class ForbiddenException extends ApiException {

    public ForbiddenException(String detail) {
        super(HttpStatus.FORBIDDEN, ProblemTypes.FORBIDDEN, "Forbidden", detail);
    }
}