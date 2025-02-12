
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

const TeacherAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      const existingTeachersData = localStorage.getItem('allTeachers');
      const teachers = existingTeachersData ? JSON.parse(existingTeachersData) : [];
      const existingTeacher = teachers.find((t: any) => t.email === result.user.email);

      if (existingTeacher) {
        localStorage.setItem('teacherProfile', JSON.stringify(existingTeacher));
        localStorage.setItem('user', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
        }));
        navigate("/teacher/dashboard");
      } else {
        localStorage.setItem('user', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
        }));
        navigate("/teacher/profile");
      }

      toast({
        title: `Welcome${result.user.displayName ? ` ${result.user.displayName}` : ''}!`,
        description: existingTeacher ? "Successfully signed in." : "Please complete your profile.",
      });
    } catch (error) {
      console.error("Google Sign In Error:", error);
      let errorMessage = "Failed to sign in with Google. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('popup-closed-by-user')) {
          errorMessage = "Sign-in cancelled. Please try again.";
        } else if (error.message.includes('auth/network-request-failed')) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (error.message.includes('auth/popup-blocked')) {
          errorMessage = "Popup was blocked. Please allow popups for this site.";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <SignInForm 
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onGoogleSignIn={handleGoogleSignIn}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm 
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onGoogleSignIn={handleGoogleSignIn}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default TeacherAuth;
