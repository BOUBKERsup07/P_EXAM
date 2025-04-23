package com.exam.controller;

import com.exam.model.*;
import com.exam.payload.request.StudentAnswerRequest;
import com.exam.payload.request.StudentExamRequest;
import com.exam.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:4200")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private StudentExamRepository studentExamRepository;

    @Autowired
    private StudentAnswerRepository studentAnswerRepository;

    @PostMapping("/exams")
    public ResponseEntity<?> startExam(@RequestBody StudentExamRequest request) {
        Exam exam = examRepository.findByAccessCode(request.getExamAccessCode())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Student student = studentRepository.findByEmail(request.getStudentEmail())
                .orElseGet(() -> {
                    Student newStudent = new Student();
                    newStudent.setEmail(request.getStudentEmail());
                    newStudent.setFirstName(request.getFirstName());
                    newStudent.setLastName(request.getLastName());
                    return studentRepository.save(newStudent);
                });

        StudentExam studentExam = new StudentExam();
        studentExam.setStudent(student);
        studentExam.setExam(exam);
        studentExam.setStartTime(LocalDateTime.now());

        studentExam = studentExamRepository.save(studentExam);
        return ResponseEntity.ok(studentExam);
    }

    @PostMapping("/answers")
    public ResponseEntity<?> submitAnswer(@RequestBody StudentAnswerRequest request) {
        StudentExam studentExam = studentExamRepository.findById(request.getStudentExamId())
                .orElseThrow(() -> new RuntimeException("Student exam not found"));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        StudentAnswer studentAnswer = new StudentAnswer();
        studentAnswer.setStudentExam(studentExam);
        studentAnswer.setQuestion(question);

        if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
            Answer selectedAnswer = answerRepository.findById(request.getSelectedAnswerId())
                    .orElseThrow(() -> new RuntimeException("Answer not found"));
            studentAnswer.setSelectedAnswer(selectedAnswer);
            studentAnswer.setIsCorrect(selectedAnswer.getIsCorrect());
        } else {
            studentAnswer.setAnswerText(request.getAnswerText());
            studentAnswer.setIsCorrect(request.getAnswerText().equals(question.getAnswers().get(0).getText()));
        }

        studentAnswer = studentAnswerRepository.save(studentAnswer);

        // Update student exam score
        updateStudentExamScore(studentExam);

        return ResponseEntity.ok(studentAnswer);
    }

    @GetMapping("/exams/{studentExamId}/score")
    public ResponseEntity<?> getExamScore(@PathVariable Long studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Student exam not found"));

        return ResponseEntity.ok(studentExam.getScore());
    }

    private void updateStudentExamScore(StudentExam studentExam) {
        List<StudentAnswer> answers = studentAnswerRepository.findByStudentExam(studentExam);
        int totalQuestions = studentExam.getExam().getQuestions().size();
        int correctAnswers = (int) answers.stream().filter(StudentAnswer::getIsCorrect).count();
        
        int score = (int) ((double) correctAnswers / totalQuestions * 100);
        studentExam.setScore(score);
        studentExamRepository.save(studentExam);
    }
} 