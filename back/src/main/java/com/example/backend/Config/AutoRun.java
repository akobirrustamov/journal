package com.example.backend.Config;

import com.example.backend.Entity.*;
import com.example.backend.Enums.UserRoles;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
public class AutoRun implements CommandLineRunner {
    private final RoleRepo roleRepo;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {


        // Seed all roles (idempotent – only inserts if missing)
        seedRoles();

        checkAndCreateUser("superadmin", "00000000", "SUPER ADMIN", UserRoles.ROLE_SUPERADMIN);
        checkAndCreateUser("Akobir", "Akobir", "SUPER ADMIN", UserRoles.ROLE_SUPERADMIN);
    }

    private void seedRoles() {
        saveRoleIfMissing(1,  UserRoles.ROLE_ADMIN);
        saveRoleIfMissing(2,  UserRoles.ROLE_USER);
        saveRoleIfMissing(3,  UserRoles.ROLE_JOURNAL_ADMIN);
        saveRoleIfMissing(4,  UserRoles.ROLE_EDITOR);
        saveRoleIfMissing(5,  UserRoles.ROLE_SUPERADMIN);
        saveRoleIfMissing(6,  UserRoles.ROLE_REVIEWER);
        saveRoleIfMissing(7,  UserRoles.ROLE_AUTHOR);
        saveRoleIfMissing(8,  UserRoles.ROLE_READER);
    }

    private void saveRoleIfMissing(int id, UserRoles roleEnum) {
        if (!roleRepo.existsById(id)) {
            roleRepo.save(new Role(id, roleEnum));
        }
    }

    private void checkAndCreateUser(String phone, String password, String name, UserRoles role) {
        Optional<User> userByPhone = userRepo.findByPhone(phone);
        if (userByPhone.isEmpty()) {
            User user = User.builder()
                    .phone(phone)
                    .name(name)
                    .password(passwordEncoder.encode(password))
                    .roles(List.of(roleRepo.findByName(role)))
                    .build();
            userRepo.save(user);
        }
    }
}
