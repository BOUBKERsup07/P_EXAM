package com.exam.controller;

import com.exam.model.Professor;
import com.exam.model.Student;
import com.exam.payload.request.LoginRequest;
import com.exam.payload.request.SignupRequest;
import com.exam.payload.response.JwtResponse;
import com.exam.repository.ProfessorRepository;
import com.exam.repository.StudentRepository;
import com.exam.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        logger.info("Tentative de connexion pour l'email: {}", loginRequest.getEmail());
        logger.info("Données reçues - Email: {}, Password: {}", loginRequest.getEmail(), loginRequest.getPassword() != null ? "***" : "null");
        
        if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
            logger.error("Email ou mot de passe manquant");
            return ResponseEntity.badRequest().body(Map.of("message", "Email et mot de passe requis"));
        }
        
        try {
            logger.info("Tentative d'authentification avec l'AuthenticationManager");
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            logger.info("Authentification réussie pour l'email: {}", loginRequest.getEmail());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            // Récupérer l'utilisateur
            String email = authentication.getName();
            Professor professor = professorRepository.findByEmail(email).orElse(null);
            if (professor != null) {
                logger.info("Utilisateur trouvé: Professeur {}", professor.getEmail());
                Map<String, Object> response = new HashMap<>();
                response.put("token", jwt);
                response.put("user", Map.of(
                    "id", professor.getId(),
                    "email", professor.getEmail(),
                    "firstName", professor.getFirstName(),
                    "lastName", professor.getLastName(),
                    "role", "PROFESSOR"
                ));
                logger.info("Réponse envoyée: {}", response);
                return ResponseEntity.ok(response);
            }

            Student student = studentRepository.findByEmail(email).orElse(null);
            if (student != null) {
                logger.info("Utilisateur trouvé: Étudiant {}", student.getEmail());
                Map<String, Object> response = new HashMap<>();
                response.put("token", jwt);
                response.put("user", Map.of(
                    "id", student.getId(),
                    "email", student.getEmail(),
                    "firstName", student.getFirstName(),
                    "lastName", student.getLastName(),
                    "role", "STUDENT"
                ));
                logger.info("Réponse envoyée: {}", response);
                return ResponseEntity.ok(response);
            }

            logger.error("Utilisateur non trouvé après authentification réussie: {}", email);
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        } catch (Exception e) {
            logger.error("Erreur d'authentification pour l'email {}: {}", loginRequest.getEmail(), e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Email ou mot de passe incorrect"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (professorRepository.existsByEmail(signUpRequest.getEmail()) || 
            studentRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Error: Email is already in use!"));
        }

        if ("PROFESSOR".equals(signUpRequest.getRole())) {
            Professor professor = new Professor();
            professor.setEmail(signUpRequest.getEmail());
            professor.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
            professor.setFirstName(signUpRequest.getFirstName());
            professor.setLastName(signUpRequest.getLastName());
            professorRepository.save(professor);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Professor registered successfully!"
            ));
        } else if ("STUDENT".equals(signUpRequest.getRole())) {
            Student student = new Student();
            student.setEmail(signUpRequest.getEmail());
            student.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
            student.setFirstName(signUpRequest.getFirstName());
            student.setLastName(signUpRequest.getLastName());
            studentRepository.save(student);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Student registered successfully!"
            ));
        } else {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Error: Invalid role!"));
        }
    }
} 