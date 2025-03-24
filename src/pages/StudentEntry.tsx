
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
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const StudentEntry = () => {
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
  const [savedStudentCode, setSavedStudentCode] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get the student college code set by the admin
    const storedStudentCode = localStorage.getItem("collegeStudentCode");
    if (storedStudentCode) {
      setSavedStudentCode(storedStudentCode);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && semester && collegeCode.trim()) {
      // Check if the college code matches the stored student code
      const enteredCode = collegeCode.trim().toUpperCase();
      
      // If no code is saved (first time setup) or the code matches
      if (!savedStudentCode || enteredCode.startsWith(savedStudentCode)) {
        // Store all student information in sessionStorage
        sessionStorage.setItem("studentName", name.trim());
        sessionStorage.setItem("studentSemester", semester);
        sessionStorage.setItem("studentCollegeCode", enteredCode);
        
        toast({
          title: "Success",
          description: "Welcome! You can now provide feedback.",
        });
        navigate("/student/feedback");
      } else {
        toast({
          title: "Invalid College Code",
          description: `Your college code should start with ${savedStudentCode}`,
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
                  Your college code should start with: {savedStudentCode}
                </div>
              )}
              <Input
                id="collegeCode"
                placeholder="Enter your college code"
                value={collegeCode}
                onChange={(e) => setCollegeCode(e.target.value)}
                required
                className="uppercase"
              />
            </div>
            
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StudentEntry;
