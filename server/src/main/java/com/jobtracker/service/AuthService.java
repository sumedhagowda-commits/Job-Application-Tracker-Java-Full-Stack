package com.jobtracker.service;

import com.jobtracker.dto.*;
import com.jobtracker.model.User;
import com.jobtracker.repo.UserRepository;
import com.jobtracker.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        User user = users.save(new User(request.name().trim(), email, encoder.encode(request.password())));
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), jwt.generate(user.getId(), user.getEmail()));
    }

    public AuthResponse login(AuthRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim())
            .filter(u -> encoder.matches(request.password(), u.getPasswordHash()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), jwt.generate(user.getId(), user.getEmail()));
    }
}
