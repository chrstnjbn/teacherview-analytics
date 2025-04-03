import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { db, COLLECTIONS, ROLES } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

const StudentEntry = () => {
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
  const [savedStudentCode, setSavedStudentCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserRole, currentUser } = useAuth();

  useEffect(() => {
    setSavedStudentCode("VIT");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && semester && collegeCode.trim()) {
      const enteredCodePrefix = collegeCode
        .trim()
        .substring(0, 3)
        .toUpperCase();

      if (!savedStudentCode || enteredCodePrefix === savedStudentCode) {
        try {
          setIsSubmitting(true);

          let authUser = currentUser;
          if (!authUser) {
            try {
              const credentials = await signInAnonymously(auth);
              await new Promise((resolve) => setTimeout(resolve, 1000));
              authUser = credentials.user;
            } catch (authError: any) {
              if (authError.code === "auth/admin-restricted-operation") {
                throw new Error(
                  "Anonymous authentication is not enabled. Please contact the administrator."
                );
              }
              throw authError;
            }
          }

          if (!authUser?.uid) {
            throw new Error("Authentication failed");
          }

          const userDocRef = doc(db, COLLECTIONS.USERS, authUser.uid);
          await setDoc(userDocRef, {
            role: ROLES.STUDENT,
            displayName: name.trim(),
            collegeCode: collegeCode.trim().toUpperCase(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isAnonymous: true,
          });

          await new Promise((resolve) => setTimeout(resolve, 500));

          const studentData = {
            name: name.trim(),
            semester: semester,
            collegeCode: collegeCode.trim().toUpperCase(),
            createdAt: serverTimestamp(),
            userId: authUser.uid,
            role: ROLES.STUDENT,
          };

          const studentRef = collection(db, COLLECTIONS.STUDENTS);
          const docRef = await addDoc(studentRef, studentData);

          await setUserRole(ROLES.STUDENT);

          const sessionData = {
            studentName: name.trim(),
            studentSemester: semester,
            studentCollegeCode: collegeCode.trim().toUpperCase(),
            studentId: docRef.id,
          };

          for (const [key, value] of Object.entries(sessionData)) {
            sessionStorage.setItem(key, value);
          }

          toast({
            title: "Success",
            description: "Welcome! You can now provide feedback.",
          });
          navigate("/student/feedback");
        } catch (error: any) {
          console.error("Error saving student data:", error);
          let errorMessage =
            "Failed to save student information. Please try again.";

          if (error.code === "permission-denied") {
            errorMessage =
              "Authentication error. Please refresh and try again.";
          } else if (error.message.includes("Anonymous authentication")) {
            errorMessage = error.message;
          }

          toast({
            title: "Authentication Error",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      } else {
        toast({
          title: "Invalid College Code",
          description: `Your college code should start with VIT`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please fill all the required fields.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Student Entry</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Current Semester</Label>
              <Select value={semester} onValueChange={setSemester} required>
                <SelectTrigger id="semester" className="w-full">
                  <SelectValue placeholder="Select your current semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                  <SelectItem value="3">Semester 3</SelectItem>
                  <SelectItem value="4">Semester 4</SelectItem>
                  <SelectItem value="5">Semester 5</SelectItem>
                  <SelectItem value="6">Semester 6</SelectItem>
                  <SelectItem value="7">Semester 7</SelectItem>
                  <SelectItem value="8">Semester 8</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collegeCode">College Code</Label>
              {savedStudentCode && (
                <div className="text-sm text-gray-500 mb-1">
                  Your college code must start with: VIT
                </div>
              )}
              <Input
                id="collegeCode"
                placeholder="Enter your college code"
                value={collegeCode}
                onChange={(e) => setCollegeCode(e.target.value.slice(0, 10))}
                maxLength={10}
                className="uppercase"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Continue"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StudentEntry;
