package com.exam.security;

import com.exam.model.Professor;
import com.exam.model.Student;
import com.exam.repository.ProfessorRepository;
import com.exam.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.info("Tentative de chargement de l'utilisateur avec l'email: {}", email);
        
        // Vérifier d'abord dans la table des professeurs
        Professor professor = professorRepository.findByEmail(email).orElse(null);
        if (professor != null) {
            logger.info("Professeur trouvé: {}", email);
            logger.info("Mot de passe du professeur: {}", professor.getPassword());
            return new User(professor.getEmail(), professor.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_PROFESSOR")));
        }

        // Si pas de professeur, vérifier dans la table des étudiants
        Student student = studentRepository.findByEmail(email).orElse(null);
        if (student != null) {
            logger.info("Étudiant trouvé: {}", email);
            logger.info("Mot de passe de l'étudiant: {}", student.getPassword());
            return new User(student.getEmail(), student.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")));
        }

        logger.error("Aucun utilisateur trouvé avec l'email: {}", email);
        throw new UsernameNotFoundException("User not found with email: " + email);
    }
} 