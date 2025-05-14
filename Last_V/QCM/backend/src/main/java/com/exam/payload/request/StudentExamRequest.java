package com.exam.payload.request;

import lombok.Data;

@Data
public class StudentExamRequest {
    private String examAccessCode;
    private String studentEmail;
    private String firstName;
    private String lastName;
} 