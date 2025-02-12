
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

const TeacherAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Store user data
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
      };

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      toast({
        title: "Success",
        description: "Account created successfully. Please complete your profile.",
      });

      navigate("/teacher/profile");
    } catch (error) {
      console.error("Sign Up Error:", error);
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = "Email is already registered. Please use a different email.";
        } else if (error.message === "Passwords do not match") {
          errorMessage = error.message;
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

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential) {
        const userName = result.user.displayName || 'Teacher';
        toast({
          title: `Hi ${userName}!`,
          description: "Welcome to PerformEdge. Please complete your profile.",
        });
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
        }));
        navigate("/teacher/profile");
      }
    } catch (error) {
      console.error("Google Sign In Error:", error);
      if (error instanceof Error) {
        let errorMessage = "Failed to sign in with Google. Please try again.";
        
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
                <Input 
                  name="firstName"
                  placeholder="First Name" 
                  value={formData.firstName}
                  onChange={handleFormChange}
                  required 
                />
                <Input 
                  name="lastName"
                  placeholder="Last Name" 
                  value={formData.lastName}
                  onChange={handleFormChange}
                  required 
                />
                <Input 
                  name="email"
                  type="email" 
                  placeholder="Email" 
                  value={formData.email}
                  onChange={handleFormChange}
                  required 
                />
                <Input 
                  name="mobile"
                  type="tel" 
                  placeholder="Mobile Number" 
                  value={formData.mobile}
                  onChange={handleFormChange}
                  required 
                />
                <Input 
                  name="password"
                  type="password" 
                  placeholder="Password" 
                  value={formData.password}
                  onChange={handleFormChange}
                  required 
                />
                <Input 
                  name="confirmPassword"
                  type="password" 
                  placeholder="Confirm Password" 
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  required 
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
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
