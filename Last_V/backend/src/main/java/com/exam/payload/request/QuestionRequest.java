package com.exam.payload.request;

import com.exam.model.Question;
import com.exam.model.Question.QuestionType;
import java.util.List;

public class QuestionRequest {
    private String text;
    private String imageUrl;
    private Integer timeLimit;
    private QuestionType type;
    private List<AnswerRequest> answers;
    private Integer[] correctAnswerIndices;

    // Getters and Setters
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Integer getTimeLimit() {
        return timeLimit;
    }

    public void setTimeLimit(Integer timeLimit) {
        this.timeLimit = timeLimit;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public List<AnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerRequest> answers) {
        this.answers = answers;
    }

    public Integer[] getCorrectAnswerIndices() {
        return correctAnswerIndices;
    }

    public void setCorrectAnswerIndices(Integer[] correctAnswerIndices) {
        this.correctAnswerIndices = correctAnswerIndices;
    }
} 