package com.jobtracker.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms}") long expirationMs) {
        byte[] bytes;
        try { bytes = java.util.Base64.getDecoder().decode(secret); }
        catch (IllegalArgumentException e) { bytes = secret.getBytes(StandardCharsets.UTF_8); }
        if (bytes.length < 32) throw new IllegalArgumentException("JWT secret must be at least 32 bytes (or base64 encoding of 32 bytes).");
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expirationMs = expirationMs;
    }

    public String generate(Long userId, String email) {
        Date now = new Date();
        return Jwts.builder().subject(String.valueOf(userId)).claim("email", email)
            .issuedAt(now).expiration(new Date(now.getTime() + expirationMs))
            .signWith(key).compact();
    }

    public Long userIdFrom(String token) {
        String subject = Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).getPayload().getSubject();
        return Long.parseLong(subject);
    }
}
