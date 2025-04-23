package com.exam.payload.response;

import com.exam.model.QuestionType;
import lombok.Data;
import java.util.List;

@Data
public class ExamResponse {
    private Long id;
    private String name;
    private String description;
    private String accessCode;
    private List<QuestionResponse> questions;

    @Data
    public static class QuestionResponse {
        private Long id;
        private String text;
        private String imageUrl;
        private Integer timeLimit;
        private QuestionType type;
        private List<AnswerResponse> answers;
    }

    @Data
    public static class AnswerResponse {
        private Long id;
        private String text;
        private Boolean isCorrect;
    }
} 