package com.zhaw.backend.exception;

/**
 * Central registry for RFC 9457 (Problem Details) {@code type} URIs.
 *
 * <p>The base is a stable, app-owned namespace. Per RFC 9457 these URIs do not
 * have to resolve to a live document; they identify the problem category. Keep
 * every slug here so the controller advice, the typed exceptions, and the
 * security handlers all reference one source of truth.
 */
public final class ProblemTypes {

    /**
     * Base URI for all problem types. Slugs are appended, e.g. {@code BASE + "not-found"}.
     */
    public static final String BASE = "https://zurimpact.ch/problems/";

    public static final String VALIDATION_ERROR = "validation-error";
    public static final String BAD_REQUEST = "bad-request";
    public static final String UNAUTHORIZED = "unauthorized";
    public static final String FORBIDDEN = "forbidden";
    public static final String NOT_FOUND = "not-found";
    public static final String CONFLICT = "conflict";
    public static final String BUSINESS_RULE = "business-rule";
    public static final String INTERNAL_ERROR = "internal-error";

    private ProblemTypes() {
    }
}
