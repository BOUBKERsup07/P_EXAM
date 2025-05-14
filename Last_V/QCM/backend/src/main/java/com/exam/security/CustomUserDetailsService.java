package com.exam.security;

import com.exam.model.Student;
import com.exam.model.Professor;
import com.exam.repository.StudentRepository;
import com.exam.repository.ProfessorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try to find a professor first
        Professor professor = professorRepository.findByEmail(email).orElse(null);
        if (professor != null) {
            return org.springframework.security.core.userdetails.User
                    .withUsername(professor.getEmail())
                    .password(professor.getPassword())
                    .authorities("PROFESSOR")
                    .build();
        }

        // If not a professor, try to find a student
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return org.springframework.security.core.userdetails.User
                .withUsername(student.getEmail())
                .password(student.getPassword())
                .authorities("STUDENT")
                .build();
    }
} 