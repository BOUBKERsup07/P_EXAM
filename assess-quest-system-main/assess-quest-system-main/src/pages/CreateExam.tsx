
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addExam, generateUniqueLink } from "@/services/mockData";
import { Question, QuestionType } from "@/types";
import { Plus, Trash, Clock } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function CreateExam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: uuidv4(),
    text: "",
    type: "MCQ",
    choices: Array(4).fill("").map((_, i) => ({ id: String.fromCharCode(97 + i), text: "" })),
    correctAnswer: "a",
    timeLimit: 30,
  });

  const addQuestion = () => {
    if (!currentQuestion.text.trim()) {
      toast.error("Question text cannot be empty");
      return;
    }

    if (currentQuestion.type === "MCQ" && 
        currentQuestion.choices?.some(choice => !choice.text.trim())) {
      toast.error("All choices must have text");
      return;
    }

    setQuestions(prev => [...prev, currentQuestion]);
    setCurrentQuestion({
      id: uuidv4(),
      text: "",
      type: "MCQ",
      choices: Array(4).fill("").map((_, i) => ({ id: String.fromCharCode(97 + i), text: "" })),
      correctAnswer: "a",
      timeLimit: 30,
    });
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    setCurrentQuestion(prev => ({
      ...prev,
      type,
      choices: type === "MCQ" 
        ? Array(4).fill("").map((_, i) => ({ id: String.fromCharCode(97 + i), text: "" })) 
        : undefined,
      correctAnswer: type === "MCQ" ? "a" : "",
    }));
  };

  const updateChoiceText = (choiceId: string, text: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      choices: prev.choices?.map(choice => 
        choice.id === choiceId ? { ...choice, text } : choice
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Exam name is required");
      return;
    }

    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create an exam");
      return;
    }

    try {
      const newExam = addExam({
        name,
        description,
        questions,
        createdBy: user.id,
      });
      
      toast.success("Exam created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Create New Exam</h1>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Exam Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Introduction to Biology"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief description of this exam"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        {questions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Added Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {questions.map((q, index) => (
                  <li key={q.id} className="p-4 border rounded-md relative">
                    <div className="flex justify-between">
                      <span className="font-medium">Question {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(q.id)}
                        className="text-red-500 hover:text-red-700 p-0 h-auto"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2">{q.text}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{q.timeLimit} seconds</span>
                      <span className="mx-2">•</span>
                      <span>Type: {q.type}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
                placeholder="Enter your question here"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  value={currentQuestion.type}
                  onValueChange={(value: QuestionType) => handleQuestionTypeChange(value)}
                >
                  <SelectTrigger id="questionType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">Multiple Choice</SelectItem>
                    <SelectItem value="DIRECT">Direct Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="5"
                  value={currentQuestion.timeLimit}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, timeLimit: parseInt(e.target.value)})}
                />
              </div>
            </div>
            
            {currentQuestion.type === "MCQ" && (
              <div className="space-y-3">
                <Label>Answer Choices</Label>
                {currentQuestion.choices?.map((choice) => (
                  <div key={choice.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`choice-${choice.id}`}
                      name="correctAnswer"
                      checked={currentQuestion.correctAnswer === choice.id}
                      onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: choice.id})}
                      className="h-4 w-4 text-exam-blue focus:ring-exam-blue"
                    />
                    <Label htmlFor={`choice-${choice.id}`} className="min-w-6">
                      {choice.id})
                    </Label>
                    <Input
                      value={choice.text}
                      onChange={(e) => updateChoiceText(choice.id, e.target.value)}
                      placeholder={`Option ${choice.id.toUpperCase()}`}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {currentQuestion.type === "DIRECT" && (
              <div className="space-y-2">
                <Label htmlFor="correctAnswer">Correct Answer</Label>
                <Input
                  id="correctAnswer"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                  placeholder="Enter the exact correct answer"
                />
              </div>
            )}
            
            <Button
              type="button"
              onClick={addQuestion}
              className="w-full mt-2 bg-exam-purple hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-exam-blue hover:bg-exam-darkblue"
            disabled={questions.length === 0}
          >
            Create Exam
          </Button>
        </div>
      </form>
    </div>
  );
}
