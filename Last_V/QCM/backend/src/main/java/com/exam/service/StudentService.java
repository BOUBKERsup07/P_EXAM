package com.exam.service;

import com.exam.model.Student;
import com.exam.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public Student findByEmail(String email) {
        return studentRepository.findByEmail(email)
                .orElse(null);
    }

    public Student save(Student student) {
        return studentRepository.save(student);
    }
} 