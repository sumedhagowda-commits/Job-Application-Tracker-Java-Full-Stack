package com.jobtracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRequest(
    @NotBlank @Email @Size(max = 160) String email,
    @NotBlank @Size(min = 6, max = 72) String password
) {}
