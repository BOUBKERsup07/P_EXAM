package com.exam.controller;

import com.exam.model.*;
import com.exam.repository.*;
import com.exam.service.ExamService;
import com.exam.payload.request.AccessCodeRequest;
import com.exam.payload.request.StudentAnswerRequest;
import com.exam.payload.request.StudentExamRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:4200")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

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
    private ExamService examService;
    
    @Autowired
    private ExamResultRepository examResultRepository;

    @PostMapping("/exams")
    public ResponseEntity<?> startExam(@RequestBody StudentExamRequest request) {
        Exam exam = examRepository.findByAccessCode(request.getExamAccessCode())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Student student = studentRepository.findByEmail(request.getStudentEmail())
                .orElseGet(() -> {
                    Student newStudent = new Student();
                    newStudent.setEmail(request.getStudentEmail());
                    newStudent.setFirstName(request.getFirstName());
                    newStudent.setLastName(request.getLastName());
                    return studentRepository.save(newStudent);
                });

        StudentExam studentExam = new StudentExam();
        studentExam.setStudent(student);
        studentExam.setExam(exam);
        studentExam.setStartTime(LocalDateTime.now());

        studentExam = studentExamRepository.save(studentExam);
        return ResponseEntity.ok(studentExam);
    }

    @PostMapping("/answers")
    public ResponseEntity<?> submitAnswer(@RequestBody StudentAnswerRequest request) {
        StudentExam studentExam = studentExamRepository.findById(request.getStudentExamId())
                .orElseThrow(() -> new RuntimeException("Student exam not found"));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        StudentAnswer studentAnswer = new StudentAnswer();
        studentAnswer.setStudentExam(studentExam);
        studentAnswer.setQuestion(question);

        if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
            Answer selectedAnswer = answerRepository.findById(request.getSelectedAnswerId())
                    .orElseThrow(() -> new RuntimeException("Answer not found"));
            studentAnswer.setSelectedAnswer(selectedAnswer);
            studentAnswer.setIsCorrect(selectedAnswer.getIsCorrect());
        } else {
            studentAnswer.setAnswerText(request.getAnswerText());
            
            // Vérification de la réponse directe
            boolean isCorrect = false;
            Answer correctAnswer = question.getAnswers().get(0);
            String studentAnswerTrimmed = request.getAnswerText().trim().toLowerCase();
            String correctAnswerTrimmed = correctAnswer.getText().trim().toLowerCase();
            
            System.out.println("Début de la vérification pour la réponse: '" + studentAnswerTrimmed + "'");
            System.out.println("Réponse correcte (text): '" + correctAnswerTrimmed + "'");
            
            // 1. Vérifier la correspondance exacte avec la réponse correcte (text)
            if (studentAnswerTrimmed.equals(correctAnswerTrimmed)) {
                isCorrect = true;
                System.out.println("Correspondance exacte avec la réponse correcte (text): OUI");
            } else {
                System.out.println("Correspondance exacte avec la réponse correcte (text): NON");
                
                // 2. Vérifier les mots-clés
                if (correctAnswer.getKeywords() != null && !correctAnswer.getKeywords().isEmpty()) {
                    System.out.println("Mots-clés définis: '" + correctAnswer.getKeywords() + "'");
                    
                    // Traiter les mots-clés
                    String[] keywords = correctAnswer.getKeywords().split(",");
                    System.out.println("Nombre de mots-clés: " + keywords.length);
                    
                    // Vérifier si la réponse correspond exactement à l'un des mots-clés
                    for (String keyword : keywords) {
                        String trimmedKeyword = keyword.trim().toLowerCase();
                        System.out.println("Vérification du mot-clé: '" + trimmedKeyword + "'");
                        
                        if (studentAnswerTrimmed.equals(trimmedKeyword)) {
                            isCorrect = true;
                            System.out.println("Correspondance exacte avec le mot-clé '" + trimmedKeyword + "': OUI");
                            break;
                        } else {
                            System.out.println("Correspondance exacte avec le mot-clé '" + trimmedKeyword + "': NON");
                        }
                    }
                    
                    // Si toujours pas correct, vérifier si tous les mots-clés sont présents dans la réponse
                    if (!isCorrect) {
                        boolean allKeywordsPresent = true;
                        for (String keyword : keywords) {
                            String trimmedKeyword = keyword.trim().toLowerCase();
                            if (!studentAnswerTrimmed.contains(trimmedKeyword)) {
                                allKeywordsPresent = false;
                                System.out.println("Le mot-clé '" + trimmedKeyword + "' n'est pas présent dans la réponse");
                                break;
                            }
                        }
                        
                        if (allKeywordsPresent && keywords.length > 0) {
                            isCorrect = true;
                            System.out.println("Tous les mots-clés sont présents dans la réponse: OUI");
                        } else {
                            System.out.println("Tous les mots-clés sont présents dans la réponse: NON");
                        }
                    }
                } else {
                    System.out.println("Aucun mot-clé défini pour cette réponse");
                }
            }
            
            System.out.println("Résultat final de la vérification: " + (isCorrect ? "CORRECT" : "INCORRECT"));
            
            studentAnswer.setIsCorrect(isCorrect);
        }

        studentAnswer = studentAnswerRepository.save(studentAnswer);

        // Update student exam score
        updateStudentExamScore(studentExam);

        return ResponseEntity.ok(studentAnswer);
    }

    @GetMapping("/exams/{studentExamId}/score")
    public ResponseEntity<?> getExamScore(@PathVariable Long studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Student exam not found"));

        return ResponseEntity.ok(studentExam.getScore());
    }
    
    @GetMapping("/exams/{examId}")
    public ResponseEntity<?> getExamForStudent(@PathVariable Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        
        // Break circular references to avoid StackOverflowError during JSON serialization
        if (exam.getProfessor() != null) {
            exam.getProfessor().setExams(null); // Remove professor's exams reference
        }
        
        if (exam.getQuestions() != null) {
            exam.getQuestions().forEach(question -> {
                question.setExam(null); // Remove question's exam reference
                if (question.getAnswers() != null) {
                    question.getAnswers().forEach(answer -> {
                        answer.setQuestion(null); // Remove answer's question reference
                    });
                }
            });
        }
        
        // Remove other potential circular references
        if (exam.getResults() != null) {
            exam.setResults(null);
        }
        
        return ResponseEntity.ok(exam);
    }
    
    @PostMapping("/access-exam")
    public ResponseEntity<?> accessExamByCode(@RequestBody AccessCodeRequest request) {
        try {
            // Find the exam by access code using the service
            Optional<Exam> examOpt = examService.getExamByAccessCode(request.getAccessCode());
            if (!examOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Invalid access code. No exam found.");
            }
            
            Exam exam = examOpt.get();
            
            // Get the authenticated student
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Optional<Student> studentOpt = studentRepository.findByEmail(email);
            
            if (!studentOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Student not found. Please log in again.");
            }
            
            Student student = studentOpt.get();
            
            // Check if the student has already completed this exam
            Optional<ExamResult> existingResult = examResultRepository.findByStudentAndExam(student, exam);
            if (existingResult.isPresent()) {
                return ResponseEntity.badRequest().body("Vous avez déjà passé cet examen. Impossible de le passer une deuxième fois.");
            }
            
            // Check if the student has already started this exam (even if not completed)
            Optional<StudentExam> existingStudentExam = studentExamRepository.findByStudentAndExam(student, exam);
            if (existingStudentExam.isPresent()) {
                return ResponseEntity.badRequest().body("Vous avez déjà commencé cet examen. Impossible de le passer une deuxième fois.");
            }
            
            // Explicitly create a new student exam record
            StudentExam studentExam = new StudentExam();
            studentExam.setStudent(student);
            studentExam.setExam(exam);
            studentExam.setStartTime(LocalDateTime.now());
            studentExam.setIsCorrected(Boolean.FALSE);
            studentExam.setScore(0);
            studentExam = studentExamRepository.save(studentExam);
            
            // Break circular references to avoid StackOverflowError during JSON serialization
            if (exam.getProfessor() != null) {
                exam.getProfessor().setExams(null); // Remove professor's exams reference
            }
            
            if (exam.getQuestions() != null) {
                exam.getQuestions().forEach(question -> {
                    question.setExam(null); // Remove question's exam reference
                    if (question.getAnswers() != null) {
                        question.getAnswers().forEach(answer -> {
                            answer.setQuestion(null); // Remove answer's question reference
                        });
                    }
                });
            }
            
            // Remove other potential circular references
            if (exam.getResults() != null) {
                exam.setResults(null);
            }
            
            // Create response with exam and student exam ID
            Map<String, Object> response = new HashMap<>();
            response.put("exam", exam);
            response.put("studentExamId", studentExam.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error accessing exam: " + e.getMessage());
        }
    }

    @PostMapping("/exams/{examId}/submit")
    public ResponseEntity<?> submitExam(@PathVariable Long examId, @RequestBody List<Map<String, Object>> answers) {
        try {
            // Find the exam
            Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            
            // Get the authenticated student
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Student student = studentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            // Use the service to process the exam submission and get the result
            Map<String, Object> result = examService.submitExamWithAnswers(exam, student, answers);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing exam submission: " + e.getMessage());
        }
    }

    @PostMapping("/submit-exam")
    public ResponseEntity<?> submitExam(@RequestBody Map<String, Object> request) {
        try {
            // Extract exam ID and answers from the request
            Long examId = Long.valueOf(request.get("examId").toString());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> answers = (List<Map<String, Object>>) request.get("answers");
            
            // Get the authenticated student
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Optional<Student> studentOpt = studentRepository.findByEmail(email);
            
            if (!studentOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Student not found");
            }
            
            Student student = studentOpt.get();
            
            // Get the exam
            Optional<Exam> examOpt = examRepository.findById(examId);
            if (!examOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Exam not found");
            }
            
            Exam exam = examOpt.get();
            
            // Process the submission using the service
            Map<String, Object> result = examService.submitExamWithAnswers(exam, student, answers);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error submitting exam: " + e.getMessage());
        }
    }
    
    @GetMapping("/exams/{examId}/result")
    public ResponseEntity<?> getExamResult(@PathVariable Long examId) {
        try {
            // Get the authenticated student
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Student student = studentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            // Get the exam
            Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            
            // Find the exam results - il peut y en avoir plusieurs si l'étudiant a passé l'examen plusieurs fois
            List<ExamResult> results = examResultRepository.findByStudentAndExamOrderBySubmissionDateDesc(student, exam);
            
            if (results.isEmpty()) {
                throw new RuntimeException("Exam result not found");
            }
            
            // Prendre le résultat le plus récent
            ExamResult result = results.get(0);
            
            // Trouver tous les enregistrements StudentExam pour cet étudiant et cet examen
            List<StudentExam> studentExams = studentExamRepository.findByStudentAndExamOrderByStartTimeDesc(student, exam);
            
            if (studentExams.isEmpty()) {
                throw new RuntimeException("Student exam record not found");
            }
            
            // Prendre l'enregistrement le plus récent
            StudentExam studentExam = studentExams.get(0);
            List<StudentAnswer> studentAnswers = studentAnswerRepository.findByStudentExam(studentExam);
            
            // Transform the result to include more details
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("id", result.getId());
            resultMap.put("examId", exam.getId());
            resultMap.put("examName", exam.getTitle());
            resultMap.put("score", result.getScore());
            resultMap.put("timeSpent", studentExam.getEndTime() != null && studentExam.getStartTime() != null ?
                    java.time.Duration.between(studentExam.getStartTime(), studentExam.getEndTime()).toMinutes() : 0);
            resultMap.put("submissionDate", result.getSubmissionDate().toString());
            resultMap.put("formattedDate", result.getSubmissionDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            
            // Add answers details
            List<Map<String, Object>> answersDetails = new ArrayList<>();
            for (StudentAnswer answer : studentAnswers) {
                Map<String, Object> answerMap = new HashMap<>();
                Question question = answer.getQuestion();
                
                answerMap.put("questionId", question.getId());
                answerMap.put("questionText", question.getText());
                
                // Pour les réponses à choix multiples, récupérer le texte de la réponse au lieu de l'ID
                String studentAnswerText = answer.getAnswerText();
                if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE && studentAnswerText != null) {
                    try {
                        // Essayer de parser l'ID de la réponse
                        Long answerId = Long.parseLong(studentAnswerText);
                        // Trouver la réponse correspondante pour obtenir son texte
                        Optional<Answer> selectedAnswer = question.getAnswers().stream()
                                .filter(a -> a.getId().equals(answerId))
                                .findFirst();
                        
                        if (selectedAnswer.isPresent()) {
                            answerMap.put("studentAnswer", selectedAnswer.get().getText());
                        } else {
                            answerMap.put("studentAnswer", "Réponse non trouvée");
                        }
                    } catch (NumberFormatException e) {
                        // Si ce n'est pas un ID valide, utiliser le texte tel quel
                        answerMap.put("studentAnswer", studentAnswerText);
                    }
                } else {
                    // Pour les questions à réponse libre
                    answerMap.put("studentAnswer", studentAnswerText != null ? studentAnswerText : "");
                }
                
                // Ajouter l'information si la réponse est correcte
                answerMap.put("isCorrect", answer.getIsCorrect());
                
                // Ajouter la bonne réponse pour tous les types de questions
                if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
                    Optional<Answer> correctAnswer = question.getAnswers().stream()
                            .filter(Answer::getIsCorrect)
                            .findFirst();
                    
                    if (correctAnswer.isPresent()) {
                        answerMap.put("correctAnswer", correctAnswer.get().getText());
                    }
                } else if (question.getType() == Question.QuestionType.DIRECT_ANSWER) {
                    // Pour les questions à réponse directe, prendre la première réponse
                    if (!question.getAnswers().isEmpty()) {
                        Answer correctAnswer = question.getAnswers().get(0);
                        answerMap.put("correctAnswer", correctAnswer.getText());
                        
                        // Ajouter également les mots-clés si disponibles
                        if (correctAnswer.getKeywords() != null && !correctAnswer.getKeywords().isEmpty()) {
                            answerMap.put("keywords", correctAnswer.getKeywords());
                        }
                    }
                }
                
                answersDetails.add(answerMap);
            }
            
            resultMap.put("answers", answersDetails);
            
            return ResponseEntity.ok(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching exam result: " + e.getMessage());
        }
    }
    
    @GetMapping("/results")
    public ResponseEntity<?> getStudentResults() {
        try {
            // Get the authenticated student
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Optional<Student> studentOpt = studentRepository.findByEmail(email);
            
            if (!studentOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Student not found");
            }
            
            Student student = studentOpt.get();
            
            // Get all exam results for the student
            List<ExamResult> allResults = examResultRepository.findByStudent(student);
            
            // Group results by exam and keep only the most recent one for each exam
            Map<Long, ExamResult> latestResultsByExam = new HashMap<>();
            
            for (ExamResult result : allResults) {
                Long examId = result.getExam().getId();
                
                // If we haven't seen this exam before, or if this result is more recent
                if (!latestResultsByExam.containsKey(examId) || 
                    result.getSubmissionDate().isAfter(latestResultsByExam.get(examId).getSubmissionDate())) {
                    latestResultsByExam.put(examId, result);
                }
            }
            
            // Transform the results to include more details
            List<Map<String, Object>> transformedResults = new ArrayList<>();
            for (ExamResult result : latestResultsByExam.values()) {
                Map<String, Object> resultMap = new HashMap<>();
                resultMap.put("id", result.getId());
                resultMap.put("examId", result.getExam().getId());
                resultMap.put("examName", result.getExam().getTitle());
                resultMap.put("score", result.getScore());
                resultMap.put("submissionDate", result.getSubmissionDate().toString());
                resultMap.put("formattedDate", result.getSubmissionDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                transformedResults.add(resultMap);
            }
            
            return ResponseEntity.ok(transformedResults);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching results: " + e.getMessage());
        }
    }

    private void updateStudentExamScore(StudentExam studentExam) {
        List<StudentAnswer> answers = studentAnswerRepository.findByStudentExam(studentExam);
        int totalQuestions = studentExam.getExam().getQuestions().size();
        int correctAnswers = (int) answers.stream().filter(StudentAnswer::getIsCorrect).count();
        int score = totalQuestions > 0 ? (correctAnswers * 100) / totalQuestions : 0;
        studentExam.setScore(score);
        studentExam.setIsCorrected(Boolean.TRUE);
        studentExamRepository.save(studentExam);
    }

    @PostMapping("/check-exam-access")
    public ResponseEntity<?> checkExamAccess(@RequestBody AccessCodeRequest request) {
        try {
            // Find the exam by access code using the service
            Optional<Exam> examOpt = examService.getExamByAccessCode(request.getAccessCode());
            if (!examOpt.isPresent()) {
                return ResponseEntity.ok(Map.of("canAccess", false, "message", "Code d'accès invalide. Aucun examen trouvé."));
            }
            
            Exam exam = examOpt.get();
            
            // Get the authenticated student
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Optional<Student> studentOpt = studentRepository.findByEmail(email);
            
            if (!studentOpt.isPresent()) {
                return ResponseEntity.ok(Map.of("canAccess", false, "message", "Étudiant non trouvé. Veuillez vous reconnecter."));
            }
            
            Student student = studentOpt.get();
            
            // Check if the student has already completed this exam
            List<ExamResult> existingResults = examResultRepository.findByStudentAndExamOrderBySubmissionDateDesc(student, exam);
            if (!existingResults.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "canAccess", false, 
                    "message", "Vous avez déjà passé cet examen. Impossible de le passer une deuxième fois."
                ));
            }
            
            // Check if the student has already started this exam (even if not completed)
            Optional<StudentExam> existingStudentExam = studentExamRepository.findByStudentAndExam(student, exam);
            if (existingStudentExam.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "canAccess", false, 
                    "message", "Vous avez déjà commencé cet examen. Impossible de le passer une deuxième fois."
                ));
            }
            
            // Student can access the exam
            return ResponseEntity.ok(Map.of(
                "canAccess", true,
                "message", "Code d'accès valide",
                "examId", exam.getId(),
                "examName", exam.getTitle()
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                "canAccess", false,
                "message", "Erreur lors de la vérification du code d'accès: " + e.getMessage()
            ));
        }
    }
}