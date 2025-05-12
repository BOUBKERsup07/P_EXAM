package com.exam.repository;

import com.exam.model.StudentAnswer;
import com.exam.model.StudentExam;
import com.exam.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findByStudentExam(StudentExam studentExam);
    List<StudentAnswer> findByQuestion(Question question);
} 