
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

interface TeacherInfo {
  displayName: string;
  department: string;
  subjects: string;
  uid?: string;
}

interface FeedbackForm {
  rating: number;
  teachingQuality: string;
  effectiveMethods: boolean;
  approachable: boolean;
  explanationClarity: string;
  suggestedChanges: string;
  isSubmitting?: boolean;
}

const StudentFeedback = () => {
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [feedbackForms, setFeedbackForms] = useState<Record<string, FeedbackForm>>({});
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const studentName = sessionStorage.getItem("studentName");
  const studentId = sessionStorage.getItem("studentId");
  const collegeCode = sessionStorage.getItem("studentCollegeCode");
  
  useEffect(() => {
    // Redirect if no student information is available
    if (!studentName || !collegeCode) {
      toast({
        title: "Session Expired",
        description: "Please enter your details again.",
        variant: "destructive",
      });
      navigate("/student");
      return;
    }
    
    // Load teachers from Firebase or localStorage
    const loadTeachers = async () => {
      const registeredTeachers: TeacherInfo[] = [];
      
      try {
        // Try to get teachers from Firestore first
        const q = query(
          collection(db, "teachers"), 
          where("collegeCode", "==", collegeCode)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const teacherData = doc.data() as TeacherInfo;
          teacherData.uid = doc.id;
          registeredTeachers.push(teacherData);
        });
      } catch (error) {
        console.error("Error loading teachers from Firestore:", error);
      }
      
      // Fall back to localStorage if no teachers found in Firestore
      if (registeredTeachers.length === 0) {
        // Try to get the singular teacher profile (old format)
        const storedTeacherInfo = localStorage.getItem('teacherProfile');
        if (storedTeacherInfo) {
          const teacherData = JSON.parse(storedTeacherInfo);
          console.log("Individual teacher data loaded:", teacherData);
          registeredTeachers.push(teacherData);
        }
        
        // Try to get all teacher profiles
        const allTeachersString = localStorage.getItem('allTeachers');
        if (allTeachersString) {
          const allTeachers = JSON.parse(allTeachersString);
          console.log("All teachers data loaded:", allTeachers);
          registeredTeachers.push(...allTeachers);
        }
      }

      if (registeredTeachers.length > 0) {
        // Remove duplicates based on displayName
        const uniqueTeachers = Array.from(
          new Map(registeredTeachers.map(teacher => [teacher.displayName, teacher])).values()
        );
        console.log("Final unique teachers list:", uniqueTeachers);
        setTeachers(uniqueTeachers);
      } else {
        console.log("No teacher data found in localStorage or Firestore");
      }
    };
    
    loadTeachers();
  }, [collegeCode, navigate, studentName, toast]);

  const handleRatingChange = (teacherId: string, rating: number[]) => {
    setFeedbackForms(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId] || {
          teachingQuality: "",
          effectiveMethods: false,
          approachable: false,
          explanationClarity: "",
          suggestedChanges: ""
        },
        rating: rating[0]
      }
    }));
  };

  const handleSubmitFeedback = async (teacherId: string, teacherUid?: string) => {
    const form = feedbackForms[teacherId];
    if (!form?.rating) {
      toast({
        title: "Error",
        description: "Please provide a rating before submitting",
        variant: "destructive",
      });
      return;
    }
    
    // Update state to show loading
    setFeedbackForms(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        isSubmitting: true
      }
    }));
    
    try {
      // Save feedback to Firestore
      const feedbackData = {
        studentId: studentId || "anonymous",
        studentName: studentName,
        teacherName: teacherId,
        teacherUid: teacherUid || null,
        rating: form.rating,
        teachingQuality: form.teachingQuality || null,
        effectiveMethods: form.effectiveMethods || false,
        approachable: form.approachable || false,
        explanationClarity: form.explanationClarity || null,
        suggestedChanges: form.suggestedChanges || null,
        collegeCode: collegeCode,
        submittedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, "feedback"), feedbackData);
      
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      
      // Reset form
      setFeedbackForms(prev => ({
        ...prev,
        [teacherId]: {
          rating: 0,
          teachingQuality: "",
          effectiveMethods: false,
          approachable: false,
          explanationClarity: "",
          suggestedChanges: "",
          isSubmitting: false
        }
      }));
      setSelectedTeacher(null);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      
      // Reset loading state
      setFeedbackForms(prev => ({
        ...prev,
        [teacherId]: {
          ...prev[teacherId],
          isSubmitting: false
        }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Welcome {studentName}, please provide your feedback with a scale of 1-10
          </h1>

          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <div key={teacher.displayName} className="mb-8">
                <div 
                  className="bg-white rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTeacher(teacher.displayName)}
                >
                  <h2 className="text-xl font-semibold mb-2">
                    {teacher.displayName}
                  </h2>
                  <p className="text-gray-600">Department: {teacher.department || 'Not specified'}</p>
                  <p className="text-gray-600">Subjects: {teacher.subjects || 'Not specified'}</p>
                </div>

                {selectedTeacher === teacher.displayName && (
                  <div className="mt-4 space-y-6 p-6 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Overall Rating (1-10)</label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[feedbackForms[teacher.displayName]?.rating || 0]}
                          onValueChange={(value) => handleRatingChange(teacher.displayName, value)}
                          max={10}
                          step={1}
                          className="w-48"
                        />
                        <span className="text-lg font-semibold">
                          {feedbackForms[teacher.displayName]?.rating || 0}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">
                          How would you rate the quality of teaching in this course?
                        </label>
                        <RadioGroup
                          onValueChange={(value) => 
                            setFeedbackForms(prev => ({
                              ...prev,
                              [teacher.displayName]: {
                                ...prev[teacher.displayName] || {
                                  rating: 0,
                                  effectiveMethods: false,
                                  approachable: false,
                                  explanationClarity: "",
                                  suggestedChanges: ""
                                },
                                teachingQuality: value
                              }
                            }))
                          }
                          value={feedbackForms[teacher.displayName]?.teachingQuality}
                        >
                          {["Excellent", "Good", "Average", "Poor", "Very Poor"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`quality-${option}`} />
                              <label htmlFor={`quality-${option}`}>{option}</label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">
                          Did the instructor use effective teaching methods?
                        </label>
                        <Switch
                          checked={feedbackForms[teacher.displayName]?.effectiveMethods}
                          onCheckedChange={(checked) =>
                            setFeedbackForms(prev => ({
                              ...prev,
                              [teacher.displayName]: {
                                ...prev[teacher.displayName] || {
                                  rating: 0,
                                  teachingQuality: "",
                                  approachable: false,
                                  explanationClarity: "",
                                  suggestedChanges: ""
                                },
                                effectiveMethods: checked
                              }
                            }))
                          }
                        />
                        <span className="ml-2">
                          {feedbackForms[teacher.displayName]?.effectiveMethods ? "Yes" : "No"}
                        </span>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">
                          Was the instructor approachable and helpful?
                        </label>
                        <Switch
                          checked={feedbackForms[teacher.displayName]?.approachable}
                          onCheckedChange={(checked) =>
                            setFeedbackForms(prev => ({
                              ...prev,
                              [teacher.displayName]: {
                                ...prev[teacher.displayName] || {
                                  rating: 0,
                                  teachingQuality: "",
                                  effectiveMethods: false,
                                  explanationClarity: "",
                                  suggestedChanges: ""
                                },
                                approachable: checked
                              }
                            }))
                          }
                        />
                        <span className="ml-2">
                          {feedbackForms[teacher.displayName]?.approachable ? "Yes" : "No"}
                        </span>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">
                          My teacher explains difficult things clearly
                        </label>
                        <RadioGroup
                          onValueChange={(value) =>
                            setFeedbackForms(prev => ({
                              ...prev,
                              [teacher.displayName]: {
                                ...prev[teacher.displayName] || {
                                  rating: 0,
                                  teachingQuality: "",
                                  effectiveMethods: false,
                                  approachable: false,
                                  suggestedChanges: ""
                                },
                                explanationClarity: value
                              }
                            }))
                          }
                          value={feedbackForms[teacher.displayName]?.explanationClarity}
                        >
                          {["Never", "Rarely", "Sometimes", "Often", "Always"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`clarity-${option}`} />
                              <label htmlFor={`clarity-${option}`}>{option}</label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">
                          What is one change that you would like to see in the teaching method?
                        </label>
                        <Textarea
                          value={feedbackForms[teacher.displayName]?.suggestedChanges || ""}
                          onChange={(e) =>
                            setFeedbackForms(prev => ({
                              ...prev,
                              [teacher.displayName]: {
                                ...prev[teacher.displayName] || {
                                  rating: 0,
                                  teachingQuality: "",
                                  effectiveMethods: false,
                                  approachable: false,
                                  explanationClarity: ""
                                },
                                suggestedChanges: e.target.value
                              }
                            }))
                          }
                          className="min-h-[100px]"
                        />
                      </div>

                      <Button
                        onClick={() => handleSubmitFeedback(teacher.displayName, teacher.uid)}
                        className="w-full"
                        disabled={feedbackForms[teacher.displayName]?.isSubmitting}
                      >
                        {feedbackForms[teacher.displayName]?.isSubmitting 
                          ? "Submitting..." 
                          : "Submit Feedback"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No teachers found. Please check back later.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentFeedback;
