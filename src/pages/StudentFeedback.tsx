import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";

interface TeacherInfo {
  displayName: string;
  department: string;
  subjects: string;
}

interface FeedbackForm {
  rating: number;
  feedback: string;
}

const StudentFeedback = () => {
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [feedbackForms, setFeedbackForms] = useState<Record<string, FeedbackForm>>({});
  const { toast } = useToast();
  const studentName = sessionStorage.getItem("studentName");

  useEffect(() => {
    const storedTeacherInfo = localStorage.getItem('teacherProfile');
    if (storedTeacherInfo) {
      const teacherData = JSON.parse(storedTeacherInfo);
      setTeachers([teacherData]);
    }
  }, []);

  const handleRatingChange = (teacherId: string, rating: number[]) => {
    setFeedbackForms(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        rating: rating[0]
      }
    }));
  };

  const handleFeedbackChange = (teacherId: string, feedback: string) => {
    setFeedbackForms(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        feedback
      }
    }));
  };

  const handleSubmitFeedback = (teacherId: string) => {
    const form = feedbackForms[teacherId];
    if (!form?.feedback?.trim()) {
      toast({
        title: "Error",
        description: "Please enter feedback before submitting",
        variant: "destructive",
      });
      return;
    }

    if (!form?.rating) {
      toast({: "Please provide a rating before submitting",
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
      [teacherId]: {
        rating: 0,
        feedback: ""
      }
    }));
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
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
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">
                  {teacher.displayName}
                </h2>
                <p className="text-gray-600">Department: {teacher.department}</p>
                <p className="text-gray-600 mb-4">Subjects: {teacher.subjects}</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating</label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[feedbackForms[teacher.displayName]?.rating || 0]}
                        onValueChange={(value) => handleRatingChange(teacher.displayName, value)}
                        max={5}
                        step={1}
                        className="w-48"
                      />
                      <div className="flex gap-1">
                        {renderStars(feedbackForms[teacher.displayName]?.rating || 0)}
                      </div>
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="Enter your feedback for this teacher..."
                    value={feedbackForms[teacher.displayName]?.feedback || ""}
                    onChange={(e) => handleFeedbackChange(teacher.displayName, e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    onClick={() => handleSubmitFeedback(teacher.displayName)}
                    className="w-full"
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