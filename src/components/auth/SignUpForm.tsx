import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Label } from "@/components/ui/label";

interface SignUpFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onGoogleSignIn: () => void;
  isAdminRoute?: boolean;
}

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  collegeCode: string;
  staffId: string;
}

export const SignUpForm = ({ isLoading, setIsLoading, onGoogleSignIn, isAdminRoute = false }: SignUpFormProps) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    collegeCode: "",
    staffId: ""
  });
  const [savedStaffCode, setSavedStaffCode] = useState("");
  const [savedStaffId, setSavedStaffId] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the staff college code set by admin
    const storedStaffCode = localStorage.getItem("collegeStaffCode");
    if (storedStaffCode) {
      setSavedStaffCode(storedStaffCode);
    }
    
    // Get the admin staff ID
    const storedStaffId = localStorage.getItem("adminStaffId");
    if (storedStaffId) {
      setSavedStaffId(storedStaffId);
    }
  }, []);

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

      // If admin route, verify staff ID is present
      if (isAdminRoute && !formData.staffId.trim()) {
        throw new Error("staff-id-required");
      }

      // Verify college code
      const enteredCode = formData.collegeCode.trim().toUpperCase();
      
      // If no code is saved (first time setup) or the code matches
      if (!savedStaffCode || enteredCode.startsWith(savedStaffCode)) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        const profileData = {
          teacherId: isAdminRoute ? formData.staffId : "",
          department: "",
          subjects: "",
          courses: "",
          researchPapers: "",
          displayName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          mobile: formData.mobile,
          uid: userCredential.user.uid,
          collegeCode: enteredCode
        };

        const userData = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: `${formData.firstName} ${formData.lastName}`,
          collegeCode: enteredCode,
          staffId: isAdminRoute ? formData.staffId : ""
        };

        // Save admin staff ID if on admin route
        if (isAdminRoute && formData.staffId.trim()) {
          localStorage.setItem("adminStaffId", formData.staffId.trim());
        }

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

        navigate(isAdminRoute ? "/admin/dashboard" : "/teacher/profile");
      } else {
        throw new Error("invalid-college-code");
      }
    } catch (error) {
      console.error("Sign Up Error:", error);
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = "Email is already registered. Please use a different email.";
        } else if (error.message === "Passwords do not match") {
          errorMessage = error.message;
        } else if (error.message === "invalid-college-code") {
          errorMessage = `Invalid college code. Must start with ${savedStaffCode}`;
        } else if (error.message === "staff-id-required") {
          errorMessage = "Staff ID is required for admin registration.";
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
      <div className="space-y-1">
        {savedStaffCode && (
          <div className="text-xs text-gray-500 mb-1">
            College code should start with: {savedStaffCode}
          </div>
        )}
        <Input 
          name="collegeCode"
          placeholder="College Code" 
          value={formData.collegeCode}
          onChange={handleFormChange}
          required 
          className="uppercase"
          maxLength={8}
        />
      </div>
      {isAdminRoute && (
        <div className="space-y-1">
          <Label htmlFor="staffId">Staff ID</Label>
          <Input 
            name="staffId"
            id="staffId"
            placeholder="Staff ID" 
            value={formData.staffId}
            onChange={handleFormChange}
            required 
          />
        </div>
      )}
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
