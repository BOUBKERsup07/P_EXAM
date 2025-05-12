package com.exam.controller;

import com.exam.model.Exam;
import com.exam.model.StudentAnswer;
import com.exam.repository.ExamRepository;
import com.exam.service.ExamService;
import com.exam.payload.request.StudentAnswerRequest;
import com.exam.payload.response.ExamResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "http://localhost:4200")
public class ExamController {

    @Autowired
    private ExamService examService;
    
    @Autowired
    private ExamRepository examRepository;

    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        return examService.getExamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
        return ResponseEntity.ok(examService.createExam(exam));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exam> updateExam(@PathVariable Long id, @RequestBody Exam exam) {
        return ResponseEntity.ok(examService.updateExam(id, exam));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{examId}/answers")
    public ResponseEntity<StudentAnswer> submitAnswer(
            @PathVariable Long examId,
            @RequestBody StudentAnswerRequest request) {
        return ResponseEntity.ok(examService.submitAnswer(
                request.getStudentExamId(),
                request.getQuestionId(),
                request.getSelectedAnswerId(),
                request.getAnswerText()));
    }
    
    @GetMapping("/access/{accessCode}")
    public ResponseEntity<Exam> getExamByAccessCode(@PathVariable String accessCode) {
        Optional<Exam> examOpt = examRepository.findByAccessCode(accessCode);
        if (examOpt.isPresent()) {
            Exam exam = examOpt.get();
            
            // Break circular references to avoid StackOverflowError during JSON serialization
            if (exam.getProfessor() != null) {
                exam.getProfessor().setExams(null); // Remove professor's exams reference
            }
            
            if (exam.getQuestions() != null) {
                exam.getQuestions().forEach(question -> {
                    question.setExam(null); // Remove question's exam reference
                    if (question.getAnswers() != null) {
                        question.getAnswers().forEach(answer -> {
                            answer.setQuestion(null); // Remove answer's question reference
                        });
                    }
                });
            }
            
            // Remove other potential circular references
            if (exam.getResults() != null) {
                exam.setResults(null);
            }
            
            return ResponseEntity.ok(exam);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
} 