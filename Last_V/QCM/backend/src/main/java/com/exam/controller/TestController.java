package com.exam.controller;

import com.exam.model.Answer;
import com.exam.repository.AnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:4200")
public class TestController {

    @Autowired
    private AnswerRepository answerRepository;

    @GetMapping("/keywords/{answerId}")
    public ResponseEntity<?> testKeywords(@PathVariable Long answerId) {
        Optional<Answer> answerOpt = answerRepository.findById(answerId);
        
        if (!answerOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Answer answer = answerOpt.get();
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", answer.getId());
        response.put("text", answer.getText());
        response.put("isCorrect", answer.getIsCorrect());
        response.put("keywords", answer.getKeywords());
        response.put("questionId", answer.getQuestion().getId());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/keywords/{answerId}")
    public ResponseEntity<?> updateKeywords(@PathVariable Long answerId, @RequestBody Map<String, String> request) {
        String keywords = request.get("keywords");
        
        Optional<Answer> answerOpt = answerRepository.findById(answerId);
        
        if (!answerOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Answer answer = answerOpt.get();
        answer.setKeywords(keywords);
        
        answer = answerRepository.save(answer);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", answer.getId());
        response.put("text", answer.getText());
        response.put("isCorrect", answer.getIsCorrect());
        response.put("keywords", answer.getKeywords());
        response.put("questionId", answer.getQuestion().getId());
        
        return ResponseEntity.ok(response);
    }
}
