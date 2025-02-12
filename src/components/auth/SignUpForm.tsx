
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

interface SignUpFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onGoogleSignIn: () => void;
}

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

export const SignUpForm = ({ isLoading, setIsLoading, onGoogleSignIn }: SignUpFormProps) => {
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

      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('teacherProfile', JSON.stringify(profileData));

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

  return (
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
          onClick={onGoogleSignIn}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? "Signing up..." : "Sign up with Google"}
        </Button>
      </div>
    </form>
  );
};
