package com.exam.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;

@Entity
@Data
@Table(name = "exams")
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(nullable = false, unique = true)
    private String accessCode = UUID.randomUUID().toString();

    @ManyToOne
    @JoinColumn(name = "professor_id", nullable = false)
    private Professor professor;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    private List<StudentExam> studentExams = new ArrayList<>();
} 