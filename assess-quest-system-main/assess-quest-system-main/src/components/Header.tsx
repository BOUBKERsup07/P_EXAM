
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 
            className="text-2xl font-bold bg-gradient-to-r from-exam-blue to-exam-purple bg-clip-text text-transparent cursor-pointer" 
            onClick={() => navigate("/")}
          >
            AssessQuest
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name}
              </span>
              <Button 
                variant="outline" 
                onClick={logout}
                className="border-exam-blue text-exam-blue hover:bg-exam-blue hover:text-white"
              >
                Log Out
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => navigate("/login")}
              className="bg-exam-blue hover:bg-exam-darkblue text-white"
            >
              Log In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
