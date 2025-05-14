package com.exam.repository;

import com.exam.model.Exam;
import com.exam.model.ExamResult;
import com.exam.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    List<ExamResult> findByStudent(Student student);
    List<ExamResult> findByStudentOrderByCompletionDateDesc(Student student);
    Optional<ExamResult> findByExamIdAndStudentId(Long examId, Long studentId);
    List<ExamResult> findByExam(Exam exam);
    Optional<ExamResult> findByStudentAndExam(Student student, Exam exam);
    List<ExamResult> findByStudentAndExamOrderBySubmissionDateDesc(Student student, Exam exam);
}