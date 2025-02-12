
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

interface SignInFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onGoogleSignIn: () => void;
}

interface SignInFormData {
  email: string;
  password: string;
}

export const SignInForm = ({ isLoading, setIsLoading, onGoogleSignIn }: SignInFormProps) => {
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: "",
    password: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        signInData.email,
        signInData.password
      );

      const existingTeachersData = localStorage.getItem('allTeachers');
      const teachers = existingTeachersData ? JSON.parse(existingTeachersData) : [];
      const teacher = teachers.find((t: any) => t.email === userCredential.user.email);

      if (teacher) {
        localStorage.setItem('teacherProfile', JSON.stringify(teacher));
        localStorage.setItem('user', JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: teacher.displayName,
        }));
        navigate("/teacher/dashboard");
      } else {
        localStorage.setItem('user', JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || 'Teacher',
        }));
        navigate("/teacher/profile");
      }

      toast({
        title: "Success",
        description: "Signed in successfully.",
      });
    } catch (error) {
      console.error("Sign In Error:", error);
      let errorMessage = "Invalid email or password. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('auth/user-not-found')) {
          errorMessage = "No account found with this email.";
        } else if (error.message.includes('auth/wrong-password')) {
          errorMessage = "Incorrect password.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <Input 
        type="email" 
        name="email"
        placeholder="Email" 
        value={signInData.email}
        onChange={handleSignInChange}
        required 
      />
      <Input 
        type="password" 
        name="password"
        placeholder="Password" 
        value={signInData.password}
        onChange={handleSignInChange}
        required 
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
      <div className="text-center">
        <Button 
          variant="outline" 
          className="w-full mt-2"
          onClick={onGoogleSignIn}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Button>
      </div>
    </form>
  );
};
