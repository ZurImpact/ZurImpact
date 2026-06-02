package com.zhaw.backend.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("TokenHashing - Unit Tests")
class TokenHashingTest {

    @Test
    @DisplayName("randomHexToken returns 64-character lowercase hex string")
    void randomTokenIsHex64Chars() {
        String token = TokenHashing.randomHexToken();
        assertNotNull(token);
        assertEquals(64, token.length());
        assertTrue(token.matches("[0-9a-f]{64}"), "must be lowercase hex");
    }

    @Test
    @DisplayName("randomHexToken produces unique values across calls")
    void randomTokenIsUnique() {
        String a = TokenHashing.randomHexToken();
        String b = TokenHashing.randomHexToken();
        assertNotEquals(a, b);
    }

    @Test
    @DisplayName("sha256Hex produces 64-character lowercase hex string")
    void sha256HexIs64Chars() {
        String hash = TokenHashing.sha256Hex("hello");
        assertNotNull(hash);
        assertEquals(64, hash.length());
        assertTrue(hash.matches("[0-9a-f]{64}"));
    }

    @Test
    @DisplayName("sha256Hex is deterministic for the same input")
    void sha256HexIsDeterministic() {
        String a = TokenHashing.sha256Hex("same-input");
        String b = TokenHashing.sha256Hex("same-input");
        assertEquals(a, b);
    }

    @Test
    @DisplayName("sha256Hex produces different hashes for different inputs")
    void sha256HexDifferentInputsDifferentHashes() {
        assertNotEquals(
                TokenHashing.sha256Hex("input-one"),
                TokenHashing.sha256Hex("input-two")
        );
    }

    @Test
    @DisplayName("raw token and its sha256 hash are never equal")
    void rawTokenDiffersFromItsHash() {
        String raw = TokenHashing.randomHexToken();
        assertNotEquals(raw, TokenHashing.sha256Hex(raw));
    }

    @Test
    @DisplayName("sha256Hex of the same token matches what SessionService would store")
    void hashRoundTrip() {
        String raw = TokenHashing.randomHexToken();
        String hash1 = TokenHashing.sha256Hex(raw);
        String hash2 = TokenHashing.sha256Hex(raw);
        assertEquals(hash1, hash2);
        assertNotEquals(raw, hash1);
    }
}
