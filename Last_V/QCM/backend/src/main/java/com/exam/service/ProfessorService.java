package com.exam.service;

import com.exam.model.Professor;
import com.exam.repository.ProfessorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfessorService {

    @Autowired
    private ProfessorRepository professorRepository;

    public Professor findByEmail(String email) {
        return professorRepository.findByEmail(email)
                .orElse(null);
    }

    public Professor save(Professor professor) {
        return professorRepository.save(professor);
    }
} 