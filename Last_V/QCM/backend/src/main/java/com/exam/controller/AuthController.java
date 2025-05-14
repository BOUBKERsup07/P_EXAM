package com.exam.controller;

import com.exam.model.Professor;
import com.exam.model.Student;
import com.exam.service.AuthService;
import com.exam.service.ProfessorService;
import com.exam.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private ProfessorService professorService;

    @Autowired
    private StudentService studentService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        try {
            // Essayer d'abord de trouver un professeur
            Professor professor = professorService.findByEmail(email);
            if (professor != null && authService.verifyPassword(password, professor.getPassword())) {
                String token = authService.generateToken(professor.getEmail(), "PROFESSOR", professor.getId(), professor.getFirstName(), professor.getLastName());
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                
                // Créer un objet utilisateur simplifié pour éviter les problèmes de sérialisation
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", professor.getId());
                userMap.put("email", professor.getEmail());
                userMap.put("firstName", professor.getFirstName());
                userMap.put("lastName", professor.getLastName());
                userMap.put("role", "PROFESSOR");
                
                response.put("user", userMap);
                return ResponseEntity.ok(response);
            }

            // Si ce n'est pas un professeur, essayer de trouver un étudiant
            Student student = studentService.findByEmail(email);
            if (student != null && authService.verifyPassword(password, student.getPassword())) {
                String token = authService.generateToken(student.getEmail(), "STUDENT", student.getId(), student.getFirstName(), student.getLastName());
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                
                // Créer un objet utilisateur simplifié pour éviter les problèmes de sérialisation
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", student.getId());
                userMap.put("email", student.getEmail());
                userMap.put("firstName", student.getFirstName());
                userMap.put("lastName", student.getLastName());
                userMap.put("role", "STUDENT");
                
                response.put("user", userMap);
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.badRequest().body("Identifiants invalides");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de l'authentification: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String password = userData.get("password");
        String role = userData.get("role");
        String firstName = userData.get("firstName");
        String lastName = userData.get("lastName");

        // Validate required fields
        if (email == null || password == null || role == null || firstName == null || lastName == null) {
            return ResponseEntity.badRequest().body("Tous les champs sont obligatoires");
        }

        try {
            if ("PROFESSOR".equals(role)) {
                Professor existingProfessor = professorService.findByEmail(email);
                if (existingProfessor != null) {
                    return ResponseEntity.badRequest().body("Un professeur avec cet email existe déjà");
                }
                Professor professor = new Professor();
                professor.setEmail(email);
                professor.setPassword(authService.encodePassword(password));
                professor.setFirstName(firstName);
                professor.setLastName(lastName);
                professor = professorService.save(professor);
                return ResponseEntity.ok(professor);
            } else if ("STUDENT".equals(role)) {
                Student existingStudent = studentService.findByEmail(email);
                if (existingStudent != null) {
                    return ResponseEntity.badRequest().body("Un étudiant avec cet email existe déjà");
                }
                Student student = new Student();
                student.setEmail(email);
                student.setPassword(authService.encodePassword(password));
                student.setFirstName(firstName);
                student.setLastName(lastName);
                student = studentService.save(student);
                return ResponseEntity.ok(student);
            } else {
                return ResponseEntity.badRequest().body("Rôle invalide. Les rôles valides sont: PROFESSOR, STUDENT");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de l'inscription: " + e.getMessage());
        }
    }
}