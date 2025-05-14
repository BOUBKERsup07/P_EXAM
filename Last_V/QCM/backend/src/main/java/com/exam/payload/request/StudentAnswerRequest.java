package com.exam.payload.request;

import lombok.Data;

@Data
public class StudentAnswerRequest {
    private Long studentExamId;
    private Long questionId;
    private Long selectedAnswerId; // For MULTIPLE_CHOICE type
    private String answerText; // For DIRECT_ANSWER type
} 