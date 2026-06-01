package com.zhaw.backend.exception;

import org.springframework.http.HttpStatus;

/** 422 — the request was well-formed but violates a business rule. */
public class BusinessRuleException extends ApiException {

    public BusinessRuleException(String detail) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, ProblemTypes.BUSINESS_RULE, "Unprocessable Entity", detail);
    }
}