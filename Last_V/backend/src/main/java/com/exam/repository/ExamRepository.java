package com.exam.repository;

import com.exam.model.Exam;
import com.exam.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    Optional<Exam> findByAccessCode(String accessCode);
    List<Exam> findByProfessor(Professor professor);
} 