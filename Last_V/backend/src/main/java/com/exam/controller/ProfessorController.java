package com.exam.controller;

import com.exam.model.Answer;
import com.exam.model.Exam;
import com.exam.model.Professor;
import com.exam.model.Question;
import com.exam.model.ExamResult;
import com.exam.model.StudentAnswer;
import com.exam.model.StudentExam;
import com.exam.repository.AnswerRepository;
import com.exam.repository.ExamRepository;
import com.exam.repository.QuestionRepository;
import com.exam.repository.StudentAnswerRepository;
import com.exam.repository.StudentExamRepository;
import com.exam.service.ExamService;
import com.exam.service.ProfessorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;
import org.springframework.http.HttpStatus;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/professor")
@CrossOrigin(origins = "http://localhost:4200")
public class ProfessorController {

    @Autowired
    private ExamService examService;

    @Autowired
    private ProfessorService professorService;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private AnswerRepository answerRepository;
    
    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private StudentExamRepository studentExamRepository;
    
    @Autowired
    private StudentAnswerRepository studentAnswerRepository;
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @GetMapping("/exams")
    public ResponseEntity<List<Exam>> getProfessorExams(Authentication authentication) {
        try {
            String email = authentication.getName();
            Professor professor = professorService.findByEmail(email);
            if (professor == null) {
                return ResponseEntity.notFound().build();
            }
            
            List<Exam> exams = examService.getExamsByProfessor(professor);
            
            // Éviter les références circulaires pour la sérialisation JSON
            exams.forEach(exam -> {
                exam.setProfessor(null);
                if (exam.getQuestions() != null) {
                    exam.getQuestions().forEach(question -> {
                        question.setExam(null);
                        if (question.getAnswers() != null) {
                            question.getAnswers().forEach(answer -> {
                                answer.setQuestion(null);
                            });
                        }
                    });
                }
                if (exam.getResults() != null) {
                    exam.setResults(null);
                }
            });
            
            return ResponseEntity.ok(exams);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/exams/{id}")
    public ResponseEntity<?> getProfessorExam(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            Professor professor = professorService.findByEmail(email);
            if (professor == null) {
                return ResponseEntity.notFound().build();
            }
            
            Exam exam = examRepository.findById(id)
                    .orElse(null);
            
            if (exam == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Vérifier que l'examen appartient au professeur connecté
            if (!exam.getProfessor().getId().equals(professor.getId())) {
                return ResponseEntity.status(403).body("You don't have permission to view this exam");
            }
            
            // Éviter les références circulaires pour la sérialisation JSON
            if (exam.getQuestions() != null) {
                exam.getQuestions().forEach(question -> {
                    question.setExam(null);
                    if (question.getAnswers() != null) {
                        question.getAnswers().forEach(answer -> {
                            answer.setQuestion(null);
                        });
                    }
                });
            }
            if (exam.getResults() != null) {
                exam.setResults(null);
            }
            exam.setProfessor(null); // Éviter la récursion avec le professeur
            
            return ResponseEntity.ok().body(exam);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving exam: " + e.getMessage());
        }
    }

    @PostMapping("/exams")
    public ResponseEntity<?> createExam(@RequestBody Exam examData, Authentication authentication) {
        try {
            String email = authentication.getName();
            Professor professor = professorService.findByEmail(email);
            if (professor == null) {
                return ResponseEntity.notFound().build();
            }

            if (examData.getName() == null || examData.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Exam name is required");
            }

            Exam exam = new Exam();
            exam.setName(examData.getName());
            exam.setTitle(examData.getName()); // Définir le titre avec la même valeur que le nom
            exam.setDescription(examData.getDescription());
            exam.setProfessor(professor);
            exam.setDuration(examData.getDuration() != null ? examData.getDuration() : 60);
            exam.setAccessCode(UUID.randomUUID().toString());

            // Créer l'examen d'abord pour obtenir son ID
            Exam createdExam = examService.createExam(exam);
            
            // Ajouter les questions si elles sont fournies
            if (examData.getQuestions() != null && !examData.getQuestions().isEmpty()) {
                for (Question questionData : examData.getQuestions()) {
                    Question question = new Question();
                    question.setText(questionData.getText());
                    question.setImageUrl(questionData.getImageUrl());
                    question.setTimeLimit(questionData.getTimeLimit() != null ? questionData.getTimeLimit() : 60);
                    question.setType(questionData.getType());
                    question.setDifficultyLevel(questionData.getDifficultyLevel() != null ? questionData.getDifficultyLevel() : Question.DifficultyLevel.EASY);
                    question.setExplanation(questionData.getExplanation());
                    question.setPoints(questionData.getPoints() != null ? questionData.getPoints() : 1);
                    question.setExam(createdExam);
                    
                    // Sauvegarder la question
                    Question savedQuestion = questionRepository.save(question);
                    
                    // Ajouter les réponses si elles sont fournies
                    if (questionData.getAnswers() != null && !questionData.getAnswers().isEmpty()) {
                        List<Answer> answers = new ArrayList<>();
                        int optionCount = 1;
                        
                        for (Answer answerData : questionData.getAnswers()) {
                            Answer answer = new Answer();
                            
                            // Vérifier si le texte de la réponse est null ou vide
                            if (answerData.getText() == null || answerData.getText().trim().isEmpty()) {
                                // Attribuer une valeur par défaut en fonction du type de question
                                if (questionData.getType() == Question.QuestionType.DIRECT_ANSWER) {
                                    answer.setText("Réponse directe"); // Valeur par défaut pour les réponses directes
                                } else {
                                    answer.setText("Option " + optionCount); // Valeur par défaut pour les QCM
                                }
                            } else {
                                answer.setText(answerData.getText());
                            }
                            answer.setIsCorrect(answerData.getIsCorrect());

                            // Traiter les mots-clés pour les questions à réponse directe
                            if (questionData.getType() == Question.QuestionType.DIRECT_ANSWER) {
                                // Vérifier si des mots-clés sont fournis
                                if (answerData.getKeywords() != null && !answerData.getKeywords().trim().isEmpty()) {
                                    System.out.println("Mots-clés reçus dans le contrôleur: " + answerData.getKeywords());
                                    answer.setKeywords(answerData.getKeywords().trim());
                                } else {
                                    System.out.println("Aucun mot-clé reçu dans le contrôleur");
                                }
                            }

                            answer.setQuestion(savedQuestion);
                            answers.add(answer);
                            optionCount++;
                        }
                        
                        // Sauvegarder toutes les réponses en une seule fois
                        answerRepository.saveAll(answers);
                    }
                }
            }
            
            // Récupérer l'examen mis à jour avec toutes ses questions
            createdExam = examRepository.findById(createdExam.getId()).orElse(createdExam);
            
            // Éviter les références circulaires pour la sérialisation JSON
            if (createdExam.getQuestions() != null) {
                createdExam.setQuestions(null);
            }
            if (createdExam.getResults() != null) {
                createdExam.setResults(null);
            }
            return ResponseEntity.ok().body(createdExam);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating exam: " + e.getMessage());
        }
    }

    @PutMapping("/exams/{id}")
    public ResponseEntity<?> updateExam(@PathVariable Long id, @RequestBody Exam examData, Authentication authentication) {
        try {
            String email = authentication.getName();
            Professor professor = professorService.findByEmail(email);
            if (professor == null) {
                return ResponseEntity.notFound().build();
            }

            if (examData.getName() == null || examData.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Exam name is required");
            }

            // Récupérer l'examen existant
            Exam existingExam = examRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Exam not found"));

            // Vérifier que l'examen appartient au professeur connecté
            if (!existingExam.getProfessor().getId().equals(professor.getId())) {
                return ResponseEntity.status(403).body("You don't have permission to modify this exam");
            }

            // Conserver le professeur et l'access code
            examData.setProfessor(existingExam.getProfessor());
            examData.setAccessCode(existingExam.getAccessCode());
            
            // Utiliser le service pour mettre à jour l'examen et ses questions
            Exam updatedExam = examService.updateExam(id, examData);
            
            // Mettre à jour les champs supplémentaires si nécessaire
            if (examData.getDuration() != null) {
                updatedExam.setDuration(examData.getDuration());
                examRepository.save(updatedExam);
            }

            // Éviter les références circulaires pour la sérialisation JSON
            if (updatedExam.getQuestions() != null) {
                updatedExam.getQuestions().forEach(question -> {
                    question.setExam(null);
                    if (question.getAnswers() != null) {
                        question.getAnswers().forEach(answer -> {
                            answer.setQuestion(null);
                        });
                    }
                });
            }
            if (updatedExam.getResults() != null) {
                updatedExam.setResults(null);
            }
            updatedExam.setProfessor(null);

            return ResponseEntity.ok().body(updatedExam);
        } catch (Exception e) {
            e.printStackTrace(); // Pour le débogage
            return ResponseEntity.badRequest().body("Error updating exam: " + e.getMessage());
        }
    }

    @DeleteMapping("/exams/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            Professor professor = professorService.findByEmail(email);
            if (professor == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Récupérer l'examen existant
            Exam existingExam = examRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            
            // Vérifier que l'examen appartient au professeur connecté
            if (!existingExam.getProfessor().getId().equals(professor.getId())) {
                return ResponseEntity.status(403).body("You don't have permission to delete this exam");
            }
            
            examService.deleteExam(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting exam: " + e.getMessage());
        }
    }
    
    @PostMapping("/exams/{examId}/questions")
    public ResponseEntity<?> addQuestionsToExam(@PathVariable Long examId, @RequestBody List<Question> questions, Authentication authentication) {
        try {
            String email = authentication.getName();
            Professor professor = professorService.findByEmail(email);
            if (professor == null) {
                return ResponseEntity.notFound().build();
            }
            
            Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            
            // Vérifier que l'examen appartient au professeur connecté
            if (!exam.getProfessor().getId().equals(professor.getId())) {
                return ResponseEntity.status(403).body("You don't have permission to modify this exam");
            }
            
            for (Question questionData : questions) {
                Question question = new Question();
                question.setText(questionData.getText());
                question.setImageUrl(questionData.getImageUrl());
                question.setTimeLimit(questionData.getTimeLimit() != null ? questionData.getTimeLimit() : 60);
                question.setType(questionData.getType());
                question.setDifficultyLevel(questionData.getDifficultyLevel() != null ? questionData.getDifficultyLevel() : Question.DifficultyLevel.EASY);
                question.setExplanation(questionData.getExplanation());
                question.setPoints(questionData.getPoints() != null ? questionData.getPoints() : 1);
                question.setExam(exam);
                
                // Sauvegarder la question
                Question savedQuestion = questionRepository.save(question);
                
                // Ajouter les réponses si elles sont fournies
                if (questionData.getAnswers() != null && !questionData.getAnswers().isEmpty()) {
                    List<Answer> answers = new ArrayList<>();
                    int optionCount = 1;
                    
                    // Traitement spécial pour les questions à réponse directe
                    if (questionData.getType() == Question.QuestionType.DIRECT_ANSWER) {
                        // Pour les questions à réponse directe, s'assurer qu'il y a au moins une réponse
                        Answer answer = new Answer();
                        
                        // Si aucune réponse n'est fournie ou si la réponse est vide, créer une réponse par défaut
                        if (questionData.getAnswers() == null || questionData.getAnswers().isEmpty() ||
                            questionData.getAnswers().get(0).getText() == null || 
                            questionData.getAnswers().get(0).getText().trim().isEmpty()) {
                            answer.setText("Réponse directe");
                        } else {
                            answer.setText(questionData.getAnswers().get(0).getText());
                        }
                        
                        // Vérifier si des mots-clés sont fournis
                        if (questionData.getAnswers().get(0).getKeywords() != null && 
                            !questionData.getAnswers().get(0).getKeywords().trim().isEmpty()) {
                            answer.setKeywords(questionData.getAnswers().get(0).getKeywords().trim());
                        }
                        
                        answer.setIsCorrect(true); // La réponse directe est toujours correcte
                        answer.setQuestion(savedQuestion);
                        answers.add(answer);
                    } else {
                        // Traitement normal pour les questions à choix multiple
                        for (Answer answerData : questionData.getAnswers()) {
                            Answer answer = new Answer();
                            
                            // Vérifier si le texte de la réponse est null ou vide
                            if (answerData.getText() == null || answerData.getText().trim().isEmpty()) {
                                answer.setText("Option " + optionCount); // Valeur par défaut pour les QCM
                            } else {
                                answer.setText(answerData.getText());
                            }
                            
                            answer.setIsCorrect(answerData.getIsCorrect());
                            answer.setQuestion(savedQuestion);
                            answers.add(answer);
                            optionCount++;
                        }
                    }
                    
                    // Sauvegarder toutes les réponses en une seule fois
                    answerRepository.saveAll(answers);
                }
            }
            
            // Éviter les références circulaires pour la sérialisation JSON
            if (exam.getQuestions() != null) {
                exam.getQuestions().forEach(q -> {
                    q.setExam(null);
                    if (q.getAnswers() != null) {
                        q.getAnswers().forEach(a -> a.setQuestion(null));
                    }
                });
            }
            if (exam.getResults() != null) {
                exam.setResults(null);
            }
            exam.setProfessor(null);
            
            return ResponseEntity.ok().body(exam);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding questions to exam: " + e.getMessage());
        }
    }

    @PostMapping("/exams/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            String email = authentication.getName();
            Professor professor = professorService.findByEmail(email);
            
            if (professor == null) {
                return ResponseEntity.status(403).body("You don't have permission to upload images");
            }
            
            // Créer le répertoire de téléchargement s'il n'existe pas
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            
            // Générer un nom de fichier unique pour éviter les collisions
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Chemin complet du fichier
            Path filePath = Paths.get(uploadDir, newFilename);
            
            // Sauvegarder le fichier
            Files.copy(file.getInputStream(), filePath);
            
            // Construire l'URL absolue pour accéder à l'image
            String imageUrl = "http://localhost:8082/api/images/" + newFilename;
            
            // Retourner l'URL directement comme une chaîne de caractères, pas comme un objet JSON
            return ResponseEntity.ok().body("\"" + imageUrl + "\"");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload image: " + e.getMessage());
        }
    }
    
    @GetMapping("/exams/statistics")
    public ResponseEntity<?> getExamStatistics(Authentication authentication) {
        try {
            String email = authentication.getName();
            Professor professor = professorService.findByEmail(email);
            
            if (professor == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Professeur non trouvé");
            }

            List<Exam> exams = examRepository.findByProfessor(professor);
            Map<String, Object> statistics = new HashMap<>();
            
            // Statistiques globales
            statistics.put("totalExams", exams.size());
            int totalQuestions = 0;
            int totalResults = 0;
            Map<Long, Double> examAverages = new HashMap<>();
            Map<Long, Double> questionDifficulty = new HashMap<>();
            
            for (Exam exam : exams) {
                // Calculer le nombre total de questions
                totalQuestions += exam.getQuestions().size();
                
                // Calculer les moyennes par examen
                List<StudentExam> studentExams = studentExamRepository.findByExam(exam);
                totalResults += studentExams.size();
                
                if (!studentExams.isEmpty()) {
                    double averageScore = studentExams.stream()
                        .mapToDouble(StudentExam::getScore)
                        .average()
                        .orElse(0.0);
                    examAverages.put(exam.getId(), averageScore);
                }
                
                // Calculer la difficulté des questions
                for (Question question : exam.getQuestions()) {
                    List<StudentAnswer> answers = studentAnswerRepository.findByQuestion(question);
                    if (!answers.isEmpty()) {
                        long correctAnswers = answers.stream()
                            .filter(StudentAnswer::getIsCorrect)
                            .count();
                        double difficulty = 1.0 - ((double) correctAnswers / answers.size());
                        questionDifficulty.put(question.getId(), difficulty);
                    }
                }
            }
            
            statistics.put("totalQuestions", totalQuestions);
            statistics.put("totalResults", totalResults);
            statistics.put("examAverages", examAverages);
            statistics.put("questionDifficulty", questionDifficulty);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors du calcul des statistiques: " + e.getMessage());
        }
    }
}