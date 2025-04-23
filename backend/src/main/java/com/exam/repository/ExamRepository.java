package com.exam.repository;

import com.exam.model.Exam;
import com.exam.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByProfessor(Professor professor);
    Optional<Exam> findByAccessCode(String accessCode);

    @Query("SELECT e FROM Exam e WHERE e.id NOT IN " +
           "(SELECT se.exam.id FROM StudentExam se WHERE se.student.id = :studentId)")
    List<Exam> findAvailableExams(@Param("studentId") Long studentId);

    @Query("SELECT e FROM Exam e WHERE e.id IN " +
           "(SELECT se.exam.id FROM StudentExam se WHERE se.student.id = :studentId)")
    List<Exam> findCompletedExams(@Param("studentId") Long studentId);

    @Query("SELECT CASE WHEN COUNT(se) = 0 THEN true ELSE false END " +
           "FROM StudentExam se WHERE se.exam.id = :examId AND se.student.id = :studentId")
    boolean isExamAvailableForStudent(@Param("examId") Long examId, @Param("studentId") Long studentId);

    @Query("SELECT e FROM Exam e LEFT JOIN FETCH e.questions WHERE e.id = :id")
    Optional<Exam> findByIdWithQuestions(@Param("id") Long id);

    @Query("SELECT DISTINCT e FROM Exam e " +
           "LEFT JOIN FETCH e.questions q " +
           "LEFT JOIN FETCH q.answers " +
           "WHERE e.professor = :professor")
    List<Exam> findByProfessorWithQuestionsAndAnswers(@Param("professor") Professor professor);
} 