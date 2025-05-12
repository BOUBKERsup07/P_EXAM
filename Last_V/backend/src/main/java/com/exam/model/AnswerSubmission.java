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
    @JoinColumn(name = "exam_result_id", nullable = false)
    private ExamResult examResult;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "answer_text")
    private String answerText;

    @Column(name = "selected_answer_id")
    private Long selectedAnswerId;

    @Column(name = "is_correct")
    private Boolean isCorrect;
}
