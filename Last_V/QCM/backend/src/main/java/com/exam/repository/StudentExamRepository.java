package com.exam.repository;

import com.exam.model.StudentExam;
import com.exam.model.Exam;
import com.exam.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentExamRepository extends JpaRepository<StudentExam, Long> {
    List<StudentExam> findByExam(Exam exam);
    Optional<StudentExam> findByStudentAndExam(Student student, Exam exam);
    List<StudentExam> findByStudentAndExamOrderByStartTimeDesc(Student student, Exam exam);
}