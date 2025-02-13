
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

      // After successful authentication, check if user exists in our system
      const existingTeachersData = localStorage.getItem('allTeachers');
      const teachers = existingTeachersData ? JSON.parse(existingTeachersData) : [];
      let teacher = teachers.find((t: any) => t.email === userCredential.user.email);

      if (!teacher) {
        // If teacher doesn't exist in our system, create a new profile
        teacher = {
          teacherId: "",
          department: "",
          subjects: "",
          courses: "",
          researchPapers: "",
          displayName: userCredential.user.displayName || signInData.email.split('@')[0],
          email: userCredential.user.email,
          uid: userCredential.user.uid
        };
        
        // Add to allTeachers
        teachers.push(teacher);
        localStorage.setItem('allTeachers', JSON.stringify(teachers));
      }

      // Store the current user's profile
      localStorage.setItem('teacherProfile', JSON.stringify(teacher));
      localStorage.setItem('user', JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: teacher.displayName,
      }));

      // Navigate based on profile completion
      if (teacher.teacherId) {
        navigate("/teacher/dashboard");
      } else {
        navigate("/teacher/profile");
      }

      toast({
        title: "Success",
        description: "Signed in successfully",
      });
    } catch (error) {
      console.error("Sign In Error:", error);
      let errorMessage = "Invalid email or password. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('auth/user-not-found')) {
          errorMessage = "No account found with this email. Please sign up first.";
        } else if (error.message.includes('auth/wrong-password')) {
          errorMessage = "Incorrect password. Please try again.";
        } else if (error.message.includes('auth/invalid-email')) {
          errorMessage = "Invalid email format. Please check your email.";
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
      <div className="space-y-2">
        <Input 
          type="email" 
          name="email"
          placeholder="Email" 
          value={signInData.email}
          onChange={handleSignInChange}
          required 
          className="w-full"
        />
        <Input 
          type="password" 
          name="password"
          placeholder="Password" 
          value={signInData.password}
          onChange={handleSignInChange}
          required 
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button 
        type="button"
        variant="outline" 
        className="w-full"
        onClick={onGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Google"}
      </Button>
    </form>
  );
};
