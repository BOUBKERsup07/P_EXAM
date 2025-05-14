package com.exam.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
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

    @ManyToOne
    @JoinColumn(name = "selected_answer_id")
    private Answer selectedAnswer;

    @Column(name = "answer_text")
    private String answerText;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;
} 