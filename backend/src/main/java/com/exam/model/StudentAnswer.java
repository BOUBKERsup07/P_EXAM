package com.exam.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "student_answers")
public class StudentAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_exam_id", nullable = false)
    private StudentExam studentExam;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(columnDefinition = "TEXT")
    private String answerText; // For DIRECT_ANSWER type

    @ManyToOne
    @JoinColumn(name = "selected_answer_id")
    private Answer selectedAnswer; // For MULTIPLE_CHOICE type

    @Column(nullable = false)
    private Boolean isCorrect;

    @Column
    private Double points;

    @Column(columnDefinition = "TEXT")
    private String feedback;
} 