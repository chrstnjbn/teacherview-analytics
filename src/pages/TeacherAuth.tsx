
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

interface SignInFormData {
  email: string;
  password: string;
}

const TeacherAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: "",
    password: ""
  });
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

      // Get user data from localStorage if it exists
      const existingTeachersData = localStorage.getItem('allTeachers');
      const teachers = existingTeachersData ? JSON.parse(existingTeachersData) : [];
      const teacher = teachers.find((t: any) => t.email === userCredential.user.email);

      if (teacher) {
        // If teacher exists, store their profile
        localStorage.setItem('teacherProfile', JSON.stringify(teacher));
        localStorage.setItem('user', JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: teacher.displayName,
        }));
        navigate("/teacher/dashboard");
      } else {
        // If no profile exists, redirect to profile creation
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
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create initial profile data during sign up
      const profileData = {
        teacherId: "",
        department: "",
        subjects: "",
        courses: "",
        researchPapers: "",
        displayName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        mobile: formData.mobile,
        uid: userCredential.user.uid
      };

      // Store user data
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
      };

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('teacherProfile', JSON.stringify(profileData));

      // Also store in allTeachers array
      const existingTeachersData = localStorage.getItem('allTeachers');
      const teachers = existingTeachersData ? JSON.parse(existingTeachersData) : [];
      teachers.push(profileData);
      localStorage.setItem('allTeachers', JSON.stringify(teachers));

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
      
      // Check if user already has a profile
      const existingTeachersData = localStorage.getItem('allTeachers');
      const teachers = existingTeachersData ? JSON.parse(existingTeachersData) : [];
      const existingTeacher = teachers.find((t: any) => t.email === result.user.email);

      if (existingTeacher) {
        // If profile exists, store it and go to dashboard
        localStorage.setItem('teacherProfile', JSON.stringify(existingTeacher));
        localStorage.setItem('user', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
        }));
        navigate("/teacher/dashboard");
      } else {
        // If no profile, create basic user data and redirect to profile creation
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
