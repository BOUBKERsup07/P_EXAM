package com.exam.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "answer_submissions")
public class AnswerSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "exam_result_id")
    private ExamResult examResult;

    @Column(columnDefinition = "TEXT")
    private String answer;

    private boolean isCorrect;
} 