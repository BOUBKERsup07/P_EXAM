package com.exam.service;

import com.exam.model.*;
import com.exam.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private StudentExamRepository studentExamRepository;

    @Autowired
    private StudentAnswerRepository studentAnswerRepository;
    
    @Autowired
    private ExamResultRepository examResultRepository;
    
    @Autowired
    private AnswerSubmissionRepository answerSubmissionRepository;

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public List<Exam> getExamsByProfessor(Professor professor) {
        List<Exam> exams = examRepository.findByProfessor(professor);
        // Charger les questions et leurs réponses pour chaque examen
        exams.forEach(exam -> {
            if (exam.getQuestions() != null) {
                exam.getQuestions().forEach(question -> {
                    if (question.getAnswers() != null) {
                        question.getAnswers().size(); // Force le chargement des réponses
                    }
                });
            }
        });
        return exams;
    }

    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }
    
    public Optional<Exam> getExamByAccessCode(String accessCode) {
        return examRepository.findByAccessCode(accessCode);
    }
    
    @Transactional
    public StudentExam startOrResumeExam(Exam exam, Student student) {
        // Check if the student already has an exam record
        return studentExamRepository.findByStudentAndExam(student, exam)
                .orElseGet(() -> {
                    // Create a new student exam record
                    StudentExam newStudentExam = new StudentExam();
                    newStudentExam.setStudent(student);
                    newStudentExam.setExam(exam);
                    newStudentExam.setStartTime(java.time.LocalDateTime.now());
                    newStudentExam.setIsCorrected(Boolean.FALSE);
                    newStudentExam.setScore(0);
                    return studentExamRepository.save(newStudentExam);
                });
    }

    @Transactional
    public Exam createExam(Exam exam) {
        // Generate a unique access code
        exam.setAccessCode(UUID.randomUUID().toString());
        
        // Sauvegarder l'examen d'abord pour s'assurer qu'il a un ID
        exam = examRepository.saveAndFlush(exam);
        
        // Créer une nouvelle liste pour les questions
        List<Question> newQuestions = new ArrayList<>();
        
        // Ajouter les questions et réponses
        if (exam.getQuestions() != null && !exam.getQuestions().isEmpty()) {
            for (Question question : exam.getQuestions()) {
                // Définir des valeurs par défaut pour tous les champs obligatoires si null
                if (question.getDifficultyLevel() == null) {
                    question.setDifficultyLevel(Question.DifficultyLevel.EASY);
                }
                
                if (question.getPoints() == null) {
                    question.setPoints(1);
                }
                
                if (question.getTimeLimit() == null) {
                    question.setTimeLimit(60); // 60 secondes par défaut
                }
                
                if (question.getType() == null) {
                    question.setType(Question.QuestionType.MULTIPLE_CHOICE);
                }
                
                // Créer une nouvelle question pour éviter les problèmes de référence
                Question newQuestion = new Question();
                newQuestion.setText(question.getText());
                newQuestion.setImageUrl(question.getImageUrl());
                newQuestion.setTimeLimit(question.getTimeLimit());
                newQuestion.setType(question.getType());
                newQuestion.setDifficultyLevel(question.getDifficultyLevel());
                newQuestion.setExplanation(question.getExplanation());
                newQuestion.setPoints(question.getPoints());
                newQuestion.setExam(exam);
                
                // Sauvegarder la question pour obtenir son ID
                Question savedQuestion = questionRepository.saveAndFlush(newQuestion);
                
                // Ajouter à la liste des nouvelles questions
                newQuestions.add(savedQuestion);
                
                // Traiter les réponses
                List<Answer> newAnswers = new ArrayList<>();
                
                // Traitement spécial pour les questions à réponse directe
                if (question.getType() == Question.QuestionType.DIRECT_ANSWER) {
                    // Pour les questions à réponse directe, s'assurer qu'il y a au moins une réponse
                    Answer newAnswer = new Answer();
                    
                    System.out.println("Création d'une question à réponse directe");
                    System.out.println("Nombre de réponses: " + (question.getAnswers() != null ? question.getAnswers().size() : 0));
                    
                    // Vérifier si le texte de la réponse est null ou vide
                    if (question.getAnswers() == null || question.getAnswers().isEmpty() ||
                        question.getAnswers().get(0).getText() == null || 
                        question.getAnswers().get(0).getText().trim().isEmpty()) {
                        newAnswer.setText("Réponse directe");
                        System.out.println("Aucune réponse fournie, utilisation de la valeur par défaut");
                    } else {
                        newAnswer.setText(question.getAnswers().get(0).getText());
                        System.out.println("Réponse directe: " + question.getAnswers().get(0).getText());
                        
                        // Afficher les mots-clés reçus
                        System.out.println("Mots-clés reçus: " + (question.getAnswers().get(0).getKeywords() != null ? 
                                                                 question.getAnswers().get(0).getKeywords() : "null"));
                        
                        // Récupérer les mots-clés s'ils existent
                        if (question.getAnswers().get(0).getKeywords() != null && 
                            !question.getAnswers().get(0).getKeywords().trim().isEmpty()) {
                            String keywords = question.getAnswers().get(0).getKeywords();
                            newAnswer.setKeywords(keywords);
                            System.out.println("Mots-clés enregistrés: " + keywords);
                            
                            // Vérification immédiate si les mots-clés ont été correctement définis
                            if (newAnswer.getKeywords() == null || !newAnswer.getKeywords().equals(keywords)) {
                                System.err.println("ERREUR: Les mots-clés n'ont pas été correctement définis!");
                                System.err.println("Mots-clés attendus: " + keywords);
                                System.err.println("Mots-clés actuels: " + newAnswer.getKeywords());
                                throw new RuntimeException("Échec de l'enregistrement des mots-clés. Vérifiez les logs.");
                            }
                        } else {
                            System.out.println("Aucun mot-clé défini ou vide");
                        }
                    }
                    
                    newAnswer.setIsCorrect(true); // La réponse directe est toujours correcte
                    newAnswer.setQuestion(savedQuestion);
                    newAnswers.add(newAnswer);
                } else if (question.getAnswers() != null && !question.getAnswers().isEmpty()) {
                    // Traitement normal pour les questions à choix multiple
                    int optionCount = 1;
                    for (Answer answer : question.getAnswers()) {
                        Answer newAnswer = new Answer();
                        
                        // Vérifier si le texte de la réponse est null ou vide
                        if (answer.getText() == null || answer.getText().trim().isEmpty()) {
                            newAnswer.setText("Option " + optionCount); // Valeur par défaut pour les QCM
                        } else {
                            newAnswer.setText(answer.getText());
                        }
                        
                        newAnswer.setIsCorrect(answer.getIsCorrect());
                        newAnswer.setQuestion(savedQuestion);
                        newAnswers.add(newAnswer);
                        optionCount++;
                    }
                }
                
                // Sauvegarder toutes les réponses en une seule fois (seulement si la liste n'est pas vide)
                if (!newAnswers.isEmpty()) {
                    answerRepository.saveAll(newAnswers);
                }
            }
        }
        
        // Mettre à jour la liste des questions de l'examen
        exam.setQuestions(newQuestions);
        
        // Sauvegarder et retourner l'examen mis à jour
        return examRepository.save(exam);
    }

    @Transactional
    public Exam updateExam(Long id, Exam examDetails) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
                
        // Vérifier si l'examen a déjà été passé par des étudiants
        List<StudentExam> studentExams = studentExamRepository.findByExam(exam);
        boolean examTakenByStudents = !studentExams.isEmpty();
        
        // Si l'examen a déjà été passé, nous ne modifions que les métadonnées de base
        // et non les questions pour éviter de perturber les résultats existants
        if (examTakenByStudents) {
            exam.setName(examDetails.getName());
            exam.setDescription(examDetails.getDescription());
            // Ne pas modifier le code d'accès pour un examen déjà passé
            // car cela pourrait affecter les références existantes
            
            // Sauvegarder et retourner l'examen avec les métadonnées mises à jour
            // mais sans modifier les questions
            return examRepository.save(exam);
        }
        
        // Si l'examen n'a pas encore été passé, nous pouvons le modifier complètement
        exam.setName(examDetails.getName());
        exam.setDescription(examDetails.getDescription());
        exam.setAccessCode(examDetails.getAccessCode());
        
        // Supprimer les questions existantes et leurs réponses
        if (exam.getQuestions() != null) {
            exam.getQuestions().forEach(question -> {
                if (question.getAnswers() != null) {
                    answerRepository.deleteAll(question.getAnswers());
                }
            });
            questionRepository.deleteAll(exam.getQuestions());
            exam.getQuestions().clear();
        }
        
        // Sauvegarder l'examen d'abord pour s'assurer qu'il a un ID
        exam = examRepository.saveAndFlush(exam);
        
        // Créer une nouvelle liste pour les questions
        List<Question> newQuestions = new ArrayList<>();
        
        // Ajouter les nouvelles questions et réponses
        if (examDetails.getQuestions() != null) {
            for (Question question : examDetails.getQuestions()) {
                // Définir des valeurs par défaut pour tous les champs obligatoires si null
                if (question.getDifficultyLevel() == null) {
                    question.setDifficultyLevel(Question.DifficultyLevel.EASY);
                }
                
                if (question.getPoints() == null) {
                    question.setPoints(1);
                }
                
                if (question.getTimeLimit() == null) {
                    question.setTimeLimit(60); // 60 secondes par défaut
                }
                
                if (question.getType() == null) {
                    question.setType(Question.QuestionType.MULTIPLE_CHOICE);
                }
                
                // Créer une nouvelle question pour éviter les problèmes de référence
                Question newQuestion = new Question();
                newQuestion.setText(question.getText());
                newQuestion.setImageUrl(question.getImageUrl());
                newQuestion.setTimeLimit(question.getTimeLimit());
                newQuestion.setType(question.getType());
                newQuestion.setDifficultyLevel(question.getDifficultyLevel());
                newQuestion.setExplanation(question.getExplanation());
                newQuestion.setPoints(question.getPoints());
                newQuestion.setExam(exam);
                
                // Sauvegarder la question pour obtenir son ID
                Question savedQuestion = questionRepository.saveAndFlush(newQuestion);
                
                // Ajouter à la liste des nouvelles questions
                newQuestions.add(savedQuestion);
                
                // Traiter les réponses
                List<Answer> newAnswers = new ArrayList<>();
                
                // Traitement spécial pour les questions à réponse directe
                if (question.getType() == Question.QuestionType.DIRECT_ANSWER) {
                    // Pour les questions à réponse directe, s'assurer qu'il y a au moins une réponse
                    Answer newAnswer = new Answer();
                    
                    // Si aucune réponse n'est fournie ou si la réponse est vide, créer une réponse par défaut
                   // Utiliser la réponse fournie par l'utilisateur, même si elle est vide
                    if (question.getAnswers() != null && !question.getAnswers().isEmpty() &&
                    question.getAnswers().get(0).getText() != null) {
                    // Conserver la réponse exacte fournie par l'utilisateur
                    newAnswer.setText(question.getAnswers().get(0).getText());
                    
                    // Récupérer les mots-clés s'ils existent
                    if (question.getAnswers().get(0).getKeywords() != null && 
                        !question.getAnswers().get(0).getKeywords().trim().isEmpty()) {
                        String keywords = question.getAnswers().get(0).getKeywords();
                        newAnswer.setKeywords(keywords);
                        System.out.println("Mots-clés mis à jour: " + keywords);
                        
                        // Vérification immédiate si les mots-clés ont été correctement définis
                        if (newAnswer.getKeywords() == null || !newAnswer.getKeywords().equals(keywords)) {
                            System.err.println("ERREUR: Les mots-clés n'ont pas été correctement définis lors de la mise à jour!");
                            System.err.println("Mots-clés attendus: " + keywords);
                            System.err.println("Mots-clés actuels: " + newAnswer.getKeywords());
                            throw new RuntimeException("Échec de la mise à jour des mots-clés. Vérifiez les logs.");
                        }
                    }
                    } else {
                    // Seulement si aucune réponse n'est fournie, utiliser une valeur par défaut
                    newAnswer.setText("Réponse directe");
                    }
                    
                    newAnswer.setIsCorrect(true); // La réponse directe est toujours correcte
                    newAnswer.setQuestion(savedQuestion);
                    newAnswers.add(newAnswer);
                } else if (question.getAnswers() != null && !question.getAnswers().isEmpty()) {
                    // Traitement normal pour les questions à choix multiple
                    int optionCount = 1;
                    for (Answer answer : question.getAnswers()) {
                        Answer newAnswer = new Answer();
                        
                        // Vérifier si le texte de la réponse est null ou vide
                        if (answer.getText() == null || answer.getText().trim().isEmpty()) {
                            newAnswer.setText("Option " + optionCount); // Valeur par défaut pour les QCM
                        } else {
                            newAnswer.setText(answer.getText());
                        }
                        
                        newAnswer.setIsCorrect(answer.getIsCorrect());
                        newAnswer.setQuestion(savedQuestion);
                        newAnswers.add(newAnswer);
                        optionCount++;
                    }
                }
                
                // Sauvegarder toutes les réponses en une seule fois (seulement si la liste n'est pas vide)
                if (!newAnswers.isEmpty()) {
                    answerRepository.saveAll(newAnswers);
                }
            }
        }
        
        // Mettre à jour la liste des questions de l'examen
        exam.setQuestions(newQuestions);
        
        // Sauvegarder et retourner l'examen mis à jour
        return examRepository.save(exam);
    }

    @Transactional
    public void deleteExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        
        try {
            // 1. Trouver tous les résultats d'examen associés à cet examen
            List<ExamResult> examResults = examResultRepository.findByExam(exam);
            
            // 1.1 Supprimer les soumissions de réponses associées aux résultats
            for (ExamResult result : examResults) {
                List<AnswerSubmission> submissions = answerSubmissionRepository.findByExamResult(result);
                answerSubmissionRepository.deleteAll(submissions);
            }
            
            // 1.2 Supprimer les résultats d'examen
            examResultRepository.deleteAll(examResults);
            
            // 2. Trouver et supprimer les examens des étudiants et leurs réponses
            List<StudentExam> studentExams = studentExamRepository.findByExam(exam);
            
            for (StudentExam studentExam : studentExams) {
                // 2.1 Supprimer les réponses des étudiants associées à cet examen
                List<StudentAnswer> studentAnswers = studentAnswerRepository.findByStudentExam(studentExam);
                studentAnswerRepository.deleteAll(studentAnswers);
            }
            
            // 2.2 Supprimer les examens des étudiants
            studentExamRepository.deleteAll(studentExams);
            
            // 3. Supprimer les questions et réponses
            if (exam.getQuestions() != null) {
                for (Question question : exam.getQuestions()) {
                    if (question.getAnswers() != null) {
                        // 3.1 Supprimer les réponses
                        answerRepository.deleteAll(question.getAnswers());
                    }
                }
                // 3.2 Supprimer les questions
                questionRepository.deleteAll(exam.getQuestions());
            }
            
            // 4. Enfin, supprimer l'examen lui-même
            examRepository.delete(exam);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting exam: " + e.getMessage(), e);
        }
    }

    @Transactional
    public StudentAnswer submitAnswer(Long studentExamId, Long questionId, Long selectedAnswerId, String answerText) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Student exam not found"));

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        StudentAnswer studentAnswer = new StudentAnswer();
        studentAnswer.setStudentExam(studentExam);
        studentAnswer.setQuestion(question);

        if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
            Answer selectedAnswer = answerRepository.findById(selectedAnswerId)
                    .orElseThrow(() -> new RuntimeException("Answer not found"));
            studentAnswer.setSelectedAnswer(selectedAnswer);
            studentAnswer.setIsCorrect(selectedAnswer.getIsCorrect());
        } else {
            studentAnswer.setAnswerText(answerText);
            
            // Récupérer la réponse correcte
            Answer correctAnswer = question.getAnswers().get(0);
            
            // Vérifier si la réponse est exactement correcte
            boolean isExactMatch = answerText.trim().equalsIgnoreCase(correctAnswer.getText().trim());
            
            // Si ce n'est pas une correspondance exacte et qu'il y a des mots-clés, vérifier les mots-clés
            boolean containsKeywords = false;
            if (!isExactMatch && correctAnswer.getKeywords() != null && !correctAnswer.getKeywords().isEmpty()) {
                String[] keywords = correctAnswer.getKeywords().split(",");
                
                // Vérifier si au moins un des mots-clés est présent dans la réponse
                for (String keyword : keywords) {
                    String trimmedKeyword = keyword.trim().toLowerCase();
                    if (trimmedKeyword.length() > 0 && answerText.toLowerCase().contains(trimmedKeyword)) {
                        containsKeywords = true;
                        break; // Un seul mot-clé suffit pour considérer la réponse comme correcte
                    }
                }
            }
            
            // La réponse est correcte si c'est une correspondance exacte ou si elle contient tous les mots-clés
            studentAnswer.setIsCorrect(isExactMatch || containsKeywords);
        }

        studentAnswer = studentAnswerRepository.save(studentAnswer);

        // Update student exam score
        updateStudentExamScore(studentExam);

        return studentAnswer;
    }

    private void updateStudentExamScore(StudentExam studentExam) {
        List<StudentAnswer> answers = studentAnswerRepository.findByStudentExam(studentExam);
        int totalQuestions = studentExam.getExam().getQuestions().size();
        int correctAnswers = (int) answers.stream().filter(StudentAnswer::getIsCorrect).count();
        
        int score = (int) ((double) correctAnswers / totalQuestions * 100);
        studentExam.setScore(score);
        studentExamRepository.save(studentExam);
    }
    
    @Transactional
    public Map<String, Object> submitExamWithAnswers(Exam exam, Student student, List<Map<String, Object>> answers, Integer durationMinutes) {
        // Process each answer and calculate score
        int correctAnswersCount = 0;
        LocalDateTime submissionTime = LocalDateTime.now();
        List<Map<String, Object>> processedAnswers = new ArrayList<>();
        
        for (Map<String, Object> answerData : answers) {
            // Extract data from the submission - handle different formats
            Long questionId;
            String answer;
            
            // Check if the question is in a nested map or directly as questionId
            if (answerData.containsKey("question") && answerData.get("question") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> questionMap = (Map<String, Object>) answerData.get("question");
                questionId = Long.valueOf(questionMap.get("id").toString());
            } else if (answerData.containsKey("questionId")) {
                questionId = Long.valueOf(answerData.get("questionId").toString());
            } else {
                throw new RuntimeException("Question ID not found in submission");
            }
            
            // Get the answer
            if (answerData.containsKey("answer")) {
                answer = answerData.get("answer").toString();
            } else {
                throw new RuntimeException("Answer not found in submission");
            }
            
            // Find the question
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));
            
            // Determine if the answer is correct
            boolean isCorrect = false;
            if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
                // For multiple choice, find the matching answer
                // First, try to match by ID (if the answer is a number)
                try {
                    Long answerId = Long.valueOf(answer);
                    for (Answer possibleAnswer : question.getAnswers()) {
                        if (possibleAnswer.getId().equals(answerId) && possibleAnswer.getIsCorrect()) {
                            isCorrect = true;
                            break;
                        }
                    }
                } catch (NumberFormatException e) {
                    // If the answer is not a number, try to match by text
                    for (Answer possibleAnswer : question.getAnswers()) {
                        if (possibleAnswer.getText().equals(answer) && possibleAnswer.getIsCorrect()) {
                            isCorrect = true;
                            break;
                        }
                    }
                }
            } else {
                // Pour les réponses directes
                if (!question.getAnswers().isEmpty()) {
                    Answer correctAnswer = question.getAnswers().get(0);
                    String studentAnswerTrimmed = answer.trim().toLowerCase();
                    String correctAnswerTrimmed = correctAnswer.getText().trim().toLowerCase();
                    
                    // 1. Vérifier la correspondance exacte avec la réponse correcte
                    if (studentAnswerTrimmed.equals(correctAnswerTrimmed)) {
                        isCorrect = true;
                    } else {
                        // 2. Vérifier les mots-clés
                        if (correctAnswer.getKeywords() != null && !correctAnswer.getKeywords().isEmpty()) {
                            String[] keywords = correctAnswer.getKeywords().split(",");
                            
                            // Vérifier si la réponse correspond exactement à l'un des mots-clés
                            for (String keyword : keywords) {
                                String trimmedKeyword = keyword.trim().toLowerCase();
                                if (studentAnswerTrimmed.equals(trimmedKeyword)) {
                                    isCorrect = true;
                                    break;
                                }
                            }
                            
                            // Si toujours pas correct, vérifier si tous les mots-clés sont présents dans la réponse
                            if (!isCorrect) {
                                boolean allKeywordsPresent = true;
                                for (String keyword : keywords) {
                                    String trimmedKeyword = keyword.trim().toLowerCase();
                                    if (!studentAnswerTrimmed.contains(trimmedKeyword)) {
                                        allKeywordsPresent = false;
                                        break;
                                    }
                                }
                                
                                if (allKeywordsPresent && keywords.length > 0) {
                                    isCorrect = true;
                                }
                            }
                        }
                    }
                }
            }
            
            if (isCorrect) {
                correctAnswersCount++;
            }
            
            // Add to processed answers with more details
            Map<String, Object> processedAnswer = new HashMap<>();
            processedAnswer.put("questionId", questionId);
            processedAnswer.put("questionText", question.getText());
            
            // For multiple choice questions, try to find the actual answer text
            String answerText = answer;
            if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
                try {
                    Long answerId = Long.parseLong(answer);
                    for (Answer possibleAnswer : question.getAnswers()) {
                        if (possibleAnswer.getId().equals(answerId)) {
                            answerText = possibleAnswer.getText();
                            break;
                        }
                    }
                } catch (NumberFormatException e) {
                    // Not a number, use the original answer text
                }
            }
            
            processedAnswer.put("answer", answerText);
            processedAnswer.put("studentAnswer", answerText); // Add studentAnswer for frontend compatibility
            processedAnswer.put("isCorrect", isCorrect);
            
            // Add correct answer information
            if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
                for (Answer possibleAnswer : question.getAnswers()) {
                    if (possibleAnswer.getIsCorrect()) {
                        processedAnswer.put("correctAnswer", possibleAnswer.getText());
                        break;
                    }
                }
            } else if (!question.getAnswers().isEmpty()) {
                processedAnswer.put("correctAnswer", question.getAnswers().get(0).getText());
            }
            
            processedAnswers.add(processedAnswer);
        }
        
        // Calculate score
        int totalQuestions = exam.getQuestions().size();
        int score = totalQuestions > 0 ? (correctAnswersCount * 100) / totalQuestions : 0;
        
        // Save the exam result to the database
        ExamResult examResult = new ExamResult();
        examResult.setExam(exam);
        examResult.setStudent(student);
        examResult.setScore((double) score);
        examResult.setSubmissionDate(submissionTime);
        examResult.setCompletionDate(submissionTime);
        examResult = examResultRepository.save(examResult);
        
        // Get or create the student exam record
        StudentExam studentExam;
        Optional<StudentExam> studentExamOpt = studentExamRepository.findByStudentAndExam(student, exam);
        if (studentExamOpt.isPresent()) {
            studentExam = studentExamOpt.get();
            studentExam.setEndTime(submissionTime);
            studentExam.setScore(score);
            studentExam.setIsCorrected(Boolean.TRUE);
            studentExam = studentExamRepository.save(studentExam);
        } else {
            // Create a new student exam record if it doesn't exist
            studentExam = new StudentExam();
            studentExam.setStudent(student);
            studentExam.setExam(exam);
            
            // Utiliser la durée réelle fournie par le frontend si disponible
            if (durationMinutes != null && durationMinutes > 0) {
                studentExam.setStartTime(submissionTime.minusMinutes(durationMinutes));
            } else {
                // Sinon, utiliser une valeur par défaut de 1 minute
                studentExam.setStartTime(submissionTime.minusMinutes(1));
            }
            
            studentExam.setEndTime(submissionTime);
            studentExam.setScore(score);
            studentExam.setIsCorrected(Boolean.TRUE);
            studentExam = studentExamRepository.save(studentExam);
        }
        
        // Save individual student answers
        List<StudentAnswer> studentAnswers = new ArrayList<>();
        for (Map<String, Object> answerData : answers) {
            // Extract data from the submission
            Long questionId;
            String answerText;
            
            // Get the question ID
            if (answerData.containsKey("question") && answerData.get("question") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> questionMap = (Map<String, Object>) answerData.get("question");
                questionId = Long.valueOf(questionMap.get("id").toString());
            } else if (answerData.containsKey("questionId")) {
                questionId = Long.valueOf(answerData.get("questionId").toString());
            } else {
                continue; // Skip if no question ID
            }
            
            // Get the answer
            if (answerData.containsKey("answer")) {
                answerText = answerData.get("answer").toString();
            } else {
                continue; // Skip if no answer
            }
            
            // Find the question
            Optional<Question> questionOpt = questionRepository.findById(questionId);
            if (!questionOpt.isPresent()) {
                continue; // Skip if question not found
            }
            Question question = questionOpt.get();
            
            // Create and save student answer
            StudentAnswer studentAnswer = new StudentAnswer();
            studentAnswer.setStudentExam(studentExam);
            studentAnswer.setQuestion(question);
            
            // Always store the raw answer text regardless of question type
            studentAnswer.setAnswerText(answerText);
            
            // Handle different question types for determining correctness and selected answer
            if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
                boolean isCorrect = false;
                Answer selectedAnswer = null;
                
                // First try to find by ID
                try {
                    Long answerId = Long.valueOf(answerText);
                    for (Answer possibleAnswer : question.getAnswers()) {
                        if (possibleAnswer.getId().equals(answerId)) {
                            selectedAnswer = possibleAnswer;
                            isCorrect = possibleAnswer.getIsCorrect();
                            break;
                        }
                    }
                } catch (NumberFormatException e) {
                    // Not a number, that's okay
                }
                
                // If not found by ID, try to find by text
                if (selectedAnswer == null) {
                    for (Answer possibleAnswer : question.getAnswers()) {
                        if (possibleAnswer.getText().equals(answerText)) {
                            selectedAnswer = possibleAnswer;
                            isCorrect = possibleAnswer.getIsCorrect();
                            break;
                        }
                    }
                }
                
                // Set the selected answer if found
                if (selectedAnswer != null) {
                    studentAnswer.setSelectedAnswer(selectedAnswer);
                }
                
                studentAnswer.setIsCorrect(isCorrect);
            } else {
                // Pour les questions à réponse directe
                if (!question.getAnswers().isEmpty()) {
                    Answer correctAnswer = question.getAnswers().get(0);
                    String studentAnswerTrimmed = answerText.trim().toLowerCase();
                    String correctAnswerTrimmed = correctAnswer.getText().trim().toLowerCase();
                    
                    boolean isCorrect = false;
                    
                    // 1. Vérifier la correspondance exacte avec la réponse correcte
                    if (studentAnswerTrimmed.equals(correctAnswerTrimmed)) {
                        isCorrect = true;
                    } else {
                        // 2. Vérifier les mots-clés
                        if (correctAnswer.getKeywords() != null && !correctAnswer.getKeywords().isEmpty()) {
                            String[] keywords = correctAnswer.getKeywords().split(",");
                            
                            // Vérifier si la réponse correspond exactement à l'un des mots-clés
                            for (String keyword : keywords) {
                                String trimmedKeyword = keyword.trim().toLowerCase();
                                if (studentAnswerTrimmed.equals(trimmedKeyword)) {
                                    isCorrect = true;
                                    break;
                                }
                            }
                            
                            // Si toujours pas correct, vérifier si tous les mots-clés sont présents dans la réponse
                            if (!isCorrect) {
                                boolean allKeywordsPresent = true;
                                for (String keyword : keywords) {
                                    String trimmedKeyword = keyword.trim().toLowerCase();
                                    if (!studentAnswerTrimmed.contains(trimmedKeyword)) {
                                        allKeywordsPresent = false;
                                        break;
                                    }
                                }
                                
                                if (allKeywordsPresent && keywords.length > 0) {
                                    isCorrect = true;
                                }
                            }
                        }
                    }
                    
                    studentAnswer.setIsCorrect(isCorrect);
                } else {
                    studentAnswer.setIsCorrect(false);
                }
            }
            
            studentAnswers.add(studentAnswer);
        }
        
        // Save all student answers
        if (!studentAnswers.isEmpty()) {
            studentAnswerRepository.saveAll(studentAnswers);
        }
        
        // Create answer submissions for the exam result
        List<AnswerSubmission> answerSubmissions = new ArrayList<>();
        for (StudentAnswer studentAnswer : studentAnswers) {
            AnswerSubmission submission = new AnswerSubmission();
            submission.setExamResult(examResult);
            submission.setQuestion(studentAnswer.getQuestion());
            
            // Always set the answer text from the student answer
            submission.setAnswerText(studentAnswer.getAnswerText());
            
            // Also set the selected answer ID if available
            if (studentAnswer.getSelectedAnswer() != null) {
                submission.setSelectedAnswerId(studentAnswer.getSelectedAnswer().getId());
            }
            
            submission.setIsCorrect(studentAnswer.getIsCorrect());
            answerSubmissions.add(submission);
        }
        
        // Save all answer submissions
        if (!answerSubmissions.isEmpty()) {
            answerSubmissionRepository.saveAll(answerSubmissions);
        }
        
        // Identifier les questions sans réponse
        List<Map<String, Object>> unansweredQuestions = new ArrayList<>();
        for (Question question : exam.getQuestions()) {
            boolean isAnswered = false;
            for (Map<String, Object> answerData : answers) {
                Long questionId = null;
                
                // Extraire l'ID de la question
                if (answerData.containsKey("question") && answerData.get("question") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> questionMap = (Map<String, Object>) answerData.get("question");
                    questionId = Long.valueOf(questionMap.get("id").toString());
                } else if (answerData.containsKey("questionId")) {
                    questionId = Long.valueOf(answerData.get("questionId").toString());
                }
                
                if (questionId != null && questionId.equals(question.getId())) {
                    isAnswered = true;
                    break;
                }
            }
            
            if (!isAnswered) {
                Map<String, Object> unansweredQuestion = new HashMap<>();
                unansweredQuestion.put("id", question.getId());
                unansweredQuestion.put("text", question.getText());
                unansweredQuestion.put("type", question.getType());
                
                // Ajouter la réponse correcte pour les questions sans réponse
                if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
                    for (Answer possibleAnswer : question.getAnswers()) {
                        if (possibleAnswer.getIsCorrect()) {
                            unansweredQuestion.put("correctAnswer", possibleAnswer.getText());
                            break;
                        }
                    }
                } else if (!question.getAnswers().isEmpty()) {
                    unansweredQuestion.put("correctAnswer", question.getAnswers().get(0).getText());
                    
                    // Ajouter les mots-clés pour les réponses directes
                    Answer correctAnswer = question.getAnswers().get(0);
                    if (correctAnswer.getKeywords() != null && !correctAnswer.getKeywords().isEmpty()) {
                        unansweredQuestion.put("keywords", correctAnswer.getKeywords());
                    }
                }
                
                unansweredQuestions.add(unansweredQuestion);
            }
        }
        
        // Calculer le temps passé sur l'examen avec précision
        long timeSpentMinutes = 0;
        long timeSpentSeconds = 0;
        String formattedTimeSpent = "0 minutes 0 secondes";
        
        if (studentExam.getStartTime() != null && studentExam.getEndTime() != null) {
            java.time.Duration duration = java.time.Duration.between(studentExam.getStartTime(), studentExam.getEndTime());
            timeSpentSeconds = duration.getSeconds();
            timeSpentMinutes = duration.toMinutes();
            
            // Calculer les minutes et secondes pour l'affichage formaté
            long minutes = timeSpentSeconds / 60;
            long seconds = timeSpentSeconds % 60;
            formattedTimeSpent = minutes + " minutes " + seconds + " secondes";
        }
        
        // Create a complete result object to return
        Map<String, Object> result = new HashMap<>();
        result.put("examId", exam.getId());
        result.put("examName", exam.getTitle());
        result.put("score", (double) score);
        result.put("totalQuestions", totalQuestions);
        result.put("correctAnswers", correctAnswersCount);
        result.put("endTime", submissionTime.toString());
        // Format the end time for display
        result.put("formattedEndTime", submissionTime.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        result.put("examResultId", examResult.getId());
        result.put("answers", processedAnswers);
        result.put("unansweredQuestions", unansweredQuestions);
        result.put("timeSpent", timeSpentMinutes);
        result.put("timeSpentSeconds", timeSpentSeconds);
        result.put("formattedTimeSpent", formattedTimeSpent);
        
        return result;
    }
}
