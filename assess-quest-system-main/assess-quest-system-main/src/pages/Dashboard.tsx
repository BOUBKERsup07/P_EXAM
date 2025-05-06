
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { exams } from "@/services/mockData";
import { Clock, Plus } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const userExams = exams.filter((exam) => exam.createdBy === user?.id);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Your Exams</h1>
        <Button 
          className="bg-exam-blue hover:bg-exam-darkblue text-white" 
          onClick={() => navigate("/exams/create")}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Exam
        </Button>
      </div>

      {userExams.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <p className="text-gray-500">You haven't created any exams yet.</p>
              <Button 
                className="bg-exam-blue hover:bg-exam-darkblue text-white"
                onClick={() => navigate("/exams/create")}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Your First Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userExams.map((exam) => (
            <Card key={exam.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-exam-lightgray">
                <CardTitle>{exam.name}</CardTitle>
                <CardDescription>{exam.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Clock className="h-4 w-4" />
                  <span>
                    Created on {new Date(exam.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {exam.questions.length} Questions
                  </span>
                  <span className="text-sm text-gray-500">
                    Unique Link: {exam.uniqueLink}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="bg-white border-t border-gray-100 gap-3 flex">
                <Button 
                  onClick={() => navigate(`/exams/${exam.id}`)} 
                  variant="outline"
                  className="flex-1"
                >
                  View
                </Button>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/take-exam/${exam.uniqueLink}`);
                    alert("Link copied to clipboard!");
                  }} 
                  variant="secondary"
                  className="flex-1"
                >
                  Copy Link
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
