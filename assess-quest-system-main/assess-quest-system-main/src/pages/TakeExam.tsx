
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getExamByLink, submitExamResult } from "@/services/mockData";
import { Answer, Exam, Question } from "@/types";
import { toast } from "sonner";
import { Clock } from "lucide-react";

enum ExamState {
  REGISTRATION,
  IN_PROGRESS,
  COMPLETED
}

export default function TakeExam() {
  const { uniqueLink } = useParams<{ uniqueLink: string }>();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [email, setEmail] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [examState, setExamState] = useState<ExamState>(ExamState.REGISTRATION);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [result, setResult] = useState<{score: number, totalQuestions: number} | null>(null);
  
  // Load exam data
  useEffect(() => {
    if (!uniqueLink) return;
    
    const examData = getExamByLink(uniqueLink);
    if (examData) {
      setExam(examData);
    } else {
      toast.error("Exam not found");
      navigate("/");
    }
  }, [uniqueLink, navigate]);

  // Timer for current question
  useEffect(() => {
    if (examState !== ExamState.IN_PROGRESS || !exam) return;
    
    const question = exam.questions[currentQuestionIndex];
    setTimeLeft(question.timeLimit);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQuestionIndex, examState, exam]);

  const startExam = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setExamState(ExamState.IN_PROGRESS);
    toast.info("Exam started! Good luck!");
  };

  const handleNextQuestion = () => {
    // Save current answer
    if (exam) {
      const question = exam.questions[currentQuestionIndex];
      const isCorrect = isAnswerCorrect(question, currentAnswer);
      
      setAnswers(prev => [...prev, {
        questionId: question.id,
        value: currentAnswer,
        isCorrect
      }]);
      
      setCurrentAnswer("");
      
      // Move to next question or complete exam
      if (currentQuestionIndex < exam.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        completeExam();
      }
    }
  };

  const isAnswerCorrect = (question: Question, answer: string): boolean => {
    if (question.type === "DIRECT") {
      return answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    } else {
      return answer === question.correctAnswer;
    }
  };

  const completeExam = () => {
    if (!exam) return;
    
    // Calculate and submit results
    const result = submitExamResult({
      studentEmail: email,
      examId: exam.id,
      answers,
      totalQuestions: exam.questions.length,
    });
    
    setResult({
      score: result.score,
      totalQuestions: result.totalQuestions,
    });
    
    setExamState(ExamState.COMPLETED);
    toast.success("Exam completed!");
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
        <p>Loading exam...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {examState === ExamState.REGISTRATION && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{exam.name}</CardTitle>
            <CardDescription>{exam.description}</CardDescription>
          </CardHeader>
          <form onSubmit={startExam}>
            <CardContent className="space-y-4">
              <p>Please enter your email to begin the exam.</p>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  This exam contains {exam.questions.length} questions. Each question has a time limit.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-exam-blue hover:bg-exam-darkblue">
                Start Exam
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {examState === ExamState.IN_PROGRESS && (
        <Card>
          <CardHeader className="relative">
            <div className="absolute w-full h-1 top-0 left-0 bg-gray-100">
              <div 
                className="h-full bg-exam-blue transition-all" 
                style={{ 
                  width: `${timeLeft / exam.questions[currentQuestionIndex].timeLimit * 100}%`,
                  animation: `progress ${exam.questions[currentQuestionIndex].timeLimit}s linear forwards` 
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium bg-exam-blue text-white px-2 py-1 rounded-md mr-2">
                  {currentQuestionIndex + 1}/{exam.questions.length}
                </span>
                <CardTitle>Question</CardTitle>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">{exam.questions[currentQuestionIndex].text}</p>
            
            {exam.questions[currentQuestionIndex].imageUrl && (
              <div className="my-4 flex justify-center">
                <img 
                  src={exam.questions[currentQuestionIndex].imageUrl} 
                  alt="Question illustration" 
                  className="max-h-64 object-contain"
                />
              </div>
            )}
            
            {exam.questions[currentQuestionIndex].type === "MCQ" ? (
              <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                {exam.questions[currentQuestionIndex].choices?.map((choice) => (
                  <div key={choice.id} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
                    <RadioGroupItem value={choice.id} id={`option-${choice.id}`} />
                    <Label htmlFor={`option-${choice.id}`} className="flex-grow cursor-pointer">
                      {choice.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="answer">Your Answer</Label>
                <Input
                  id="answer"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here"
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleNextQuestion} 
              className="w-full bg-exam-blue hover:bg-exam-darkblue"
            >
              {currentQuestionIndex < exam.questions.length - 1 ? "Next Question" : "Finish Exam"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {examState === ExamState.COMPLETED && result && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Exam Completed!</CardTitle>
            <CardDescription>Thank you for completing {exam.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="py-8">
              <div className="text-5xl font-bold mb-2 text-exam-blue">
                {Math.round(result.score)}%
              </div>
              <p className="text-gray-600">
                You scored {Math.round(result.score)}% ({Math.round(result.score * result.totalQuestions / 100)} out of {result.totalQuestions} questions correct)
              </p>
            </div>
            
            <div className="space-y-2 text-left">
              <h3 className="font-medium">Response summary:</h3>
              {answers.map((answer, index) => (
                <div key={index} className="flex justify-between p-2 border-b">
                  <span>Question {index + 1}:</span>
                  <span className={answer.isCorrect ? "text-green-600" : "text-red-600"}>
                    {answer.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
