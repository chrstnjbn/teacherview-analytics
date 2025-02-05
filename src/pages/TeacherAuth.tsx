import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const TeacherAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({
      title: "Coming Soon",
      description: "Sign in functionality will be implemented soon.",
    });
    setIsLoading(false);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({
      title: "Coming Soon",
      description: "Sign up functionality will be implemented soon.",
    });
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential) {
        toast({
          title: "Success!",
          description: `Welcome ${result.user.displayName || 'Teacher'}!`,
        });
        // Store user data in localStorage if needed
        localStorage.setItem('user', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
        }));
        navigate("/teacher/dashboard");
      }
    } catch (error) {
      console.error("Google Sign In Error:", error);
      if (error instanceof Error) {
        let errorMessage = "Failed to sign in with Google. Please try again.";
        
        // Handle specific Firebase Auth errors
        if (error.message.includes('popup-closed-by-user')) {
          errorMessage = "Sign-in cancelled. Please try again.";
        } else if (error.message.includes('auth/network-request-failed')) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (error.message.includes('auth/popup-blocked')) {
          errorMessage = "Popup was blocked. Please allow popups for this site.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
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
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input type="email" placeholder="Email" required />
                <Input type="password" placeholder="Password" required />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Sign In
                </Button>
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    type="button"
                  >
                    {isLoading ? "Signing in..." : "Continue with Google"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <Input placeholder="First Name" required />
                <Input placeholder="Last Name" required />
                <Input type="email" placeholder="Email" required />
                <Input type="tel" placeholder="Mobile Number" required />
                <Input type="password" placeholder="Password" required />
                <Input type="password" placeholder="Confirm Password" required />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Sign Up
                </Button>
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    type="button"
                  >
                    {isLoading ? "Signing up..." : "Sign up with Google"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default TeacherAuth;