package com.exam.payload.request;

import com.exam.model.QuestionType;
import com.exam.model.DifficultyLevel;
import lombok.Data;
import java.util.List;

@Data
public class QuestionRequest {
    private String text;
    private String imageUrl;
    private Integer timeLimit;
    private QuestionType type;
    private DifficultyLevel difficultyLevel;
    private Integer points;
    private String explanation;
    private List<AnswerRequest> answers;
    
    @Data
    public static class AnswerRequest {
        private String text;
        private Boolean isCorrect;
    }
}