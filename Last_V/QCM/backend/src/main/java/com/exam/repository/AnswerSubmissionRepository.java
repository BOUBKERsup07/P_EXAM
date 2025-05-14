package com.exam.repository;

import com.exam.model.AnswerSubmission;
import com.exam.model.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerSubmissionRepository extends JpaRepository<AnswerSubmission, Long> {
    List<AnswerSubmission> findByExamResult(ExamResult examResult);
}
