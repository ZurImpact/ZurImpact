package com.zhaw.backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Token generation + hashing helpers shared by session, email-verification
 * and password-reset token services.
 */
public final class TokenHashing {

    private static final SecureRandom RNG = new SecureRandom();

    private TokenHashing() {
    }

    /**
     * Returns 32 random bytes hex-encoded (64 chars).
     */
    public static String randomHexToken() {
        byte[] bytes = new byte[32];
        RNG.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    /**
     * SHA-256 of the input, hex-encoded (64 chars).
     */
    public static String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable on this JVM", e);
        }
    }
}
