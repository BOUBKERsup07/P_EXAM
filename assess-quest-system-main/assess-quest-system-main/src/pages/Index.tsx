
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { getExamByLink } from "@/services/mockData";

export default function Index() {
  const navigate = useNavigate();
  const [examLink, setExamLink] = useState("");

  const handleExamLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examLink.trim()) {
      toast.error("Please enter an exam link");
      return;
    }

    // Extract link code from full URL if provided
    let code = examLink;
    try {
      if (examLink.includes('/')) {
        const url = new URL(examLink);
        const pathParts = url.pathname.split('/');
        code = pathParts[pathParts.length - 1];
      }
    } catch (e) {
      // If URL parsing fails, use as-is
    }

    if (getExamByLink(code)) {
      navigate(`/take-exam/${code}`);
    } else {
      toast.error("Invalid exam link");
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] pt-10">
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl mx-auto mb-10">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-exam-blue to-exam-purple bg-clip-text text-transparent">
            AssessQuest
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create interactive exams with timed questions. Share with students using a unique link and get instant results.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-6 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-3 text-exam-blue">For Professors</h2>
              <p className="text-gray-600 mb-4">
                Create custom exams with multiple-choice or direct-answer questions. Define time limits and share securely.
              </p>
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full bg-exam-blue hover:bg-exam-darkblue"
              >
                Login as Professor
              </Button>
            </div>
            
            <div className="p-6 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-3 text-exam-purple">For Students</h2>
              <p className="text-gray-600 mb-4">
                Access exams with the link provided by your professor. Complete questions within the time limits.
              </p>
              <form onSubmit={handleExamLinkSubmit} className="flex flex-col gap-2">
                <Input
                  value={examLink}
                  onChange={(e) => setExamLink(e.target.value)}
                  placeholder="Enter exam link or code"
                />
                <Button 
                  type="submit"
                  className="w-full bg-exam-purple hover:opacity-90"
                >
                  Access Exam
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Demo exam code: cs-intro-101</p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-exam-blue rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold mb-2">Create Exams</h3>
              <p className="text-gray-600">Professors build exams with timed questions and automatic scoring</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-exam-blue rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold mb-2">Share Link</h3>
              <p className="text-gray-600">Students access the exam through a unique, secure link</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-exam-blue rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-600">Get immediate feedback and detailed score analysis</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
