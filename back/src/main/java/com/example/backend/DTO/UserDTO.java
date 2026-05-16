package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private String phone;
    private String password;
    private boolean rememberMe;
    private UUID id;
    private String name;
    private String email;
    private String orcid;
    private String affiliation;
    private String country;
    private String bio;
    private List<Integer> roleIds;
}
