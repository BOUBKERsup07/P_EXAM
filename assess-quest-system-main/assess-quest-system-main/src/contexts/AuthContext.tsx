
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { users } from "@/services/mockData";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, validate with a backend
    // For demo, we'll check against our mock data
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser && password === "password") { // Simple password check for demo
      localStorage.setItem("user", JSON.stringify(foundUser));
      setUser(foundUser);
      toast.success("Login successful");
    } else {
      toast.error("Invalid email or password");
      throw new Error("Invalid credentials");
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
