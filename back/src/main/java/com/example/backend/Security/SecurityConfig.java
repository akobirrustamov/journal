package com.example.backend.Security;

import com.example.backend.Entity.User;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity          // enables @PreAuthorize on controllers
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepo userRepo;
    private final MyFilter myFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors()
            .and()
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ── Public: auth endpoints ─────────────────────────────
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/student-auth/**").permitAll()

                // ── Public: journal browsing ───────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/v1/journals/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/issues/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/articles/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/citations/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/metadata/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/search/**").permitAll()

                // ── Public: SEO & indexing ─────────────────────────────
                .requestMatchers("/sitemap.xml").permitAll()
                .requestMatchers("/robots.txt").permitAll()
                .requestMatchers("/oai-pmh/**").permitAll()

                // ── Public: file downloads ─────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/v1/files/**").permitAll()

                // ── Public: swagger ────────────────────────────────────
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                // ── Public: static / SPA ───────────────────────────────
                .requestMatchers("/", "/index.html", "/static/**", "/*.ico", "/*.json").permitAll()
                .requestMatchers(HttpMethod.GET, "/**").permitAll()

                // ── Legacy permissive rules kept for backward compat ───
                .requestMatchers(HttpMethod.DELETE, "/**").permitAll()
                .requestMatchers(HttpMethod.PUT,    "/**").permitAll()
                .requestMatchers(HttpMethod.POST,   "/**").permitAll()

                .anyRequest().authenticated()
            )
            .addFilterBefore(myFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService users() {
        return username -> userRepo.findByPhone(username).orElseThrow();
    }

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}