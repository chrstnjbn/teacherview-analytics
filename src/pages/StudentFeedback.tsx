import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TeacherInfo {
  displayName: string;
  department: string;
  subjects: string;
}

interface FeedbackForm {
  teacherId: string;
  feedback: string;
}

const StudentFeedback = () => {
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [feedbackForms, setFeedbackForms] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const studentName = sessionStorage.getItem("studentName");

  useEffect(() => {
    const storedTeacherInfo = localStorage.getItem('teacherProfile');
    if (storedTeacherInfo) {
      const teacherData = JSON.parse(storedTeacherInfo);
      setTeachers([teacherData]);
    }
  }, []);

  const handleFeedbackChange = (teacherId: string, feedback: string) => {
    setFeedbackForms(prev => ({
      ...prev,
      [teacherId]: feedback
    }));
  };

  const handleSubmitFeedback = (teacherId: string) => {
    const feedback = feedbackForms[teacherId];
    if (!feedback?.trim()) {
      toast({
        title: "Error",
        description: "Please enter feedback before submitting",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the feedback to a backend
    toast({
      title: "Success",
      description: "Feedback submitted successfully",
    });

    // Clear the feedback form
    setFeedbackForms(prev => ({
      ...prev,
      [teacherId]: ""
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Welcome {studentName}, Provide Your Feedback
          </h1>

          {teachers.map((teacher, index) => (
            <div key={index} className="mb-8 space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-2">
                  {teacher.displayName}
                </h2>
                <p className="text-gray-600">Department: {teacher.department}</p>
                <p className="text-gray-600">Subjects: {teacher.subjects}</p>
                
                <div className="mt-4">
                  <Textarea
                    placeholder="Enter your feedback for this teacher..."
                    value={feedbackForms[teacher.displayName] || ""}
                    onChange={(e) => handleFeedbackChange(teacher.displayName, e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    onClick={() => handleSubmitFeedback(teacher.displayName)}
                    className="mt-2"
                  >
                    Submit Feedback
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default StudentFeedback;