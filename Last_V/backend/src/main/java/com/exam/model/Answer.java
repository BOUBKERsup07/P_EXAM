package com.exam.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "answers")
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String text;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;
    
    @Column(name = "keywords")
    private String keywords;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
}