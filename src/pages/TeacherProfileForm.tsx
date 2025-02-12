
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  department: z.string().min(1, "Department is required"),
  subjects: z.string().min(1, "Subjects are required"),
  courses: z.string().min(1, "Completed courses are required"),
  researchPapers: z.string().optional(),
});

const TeacherProfileForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  
  const profileData = localStorage.getItem('teacherProfile');
  const existingProfile = profileData ? JSON.parse(profileData) : null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherId: existingProfile?.teacherId || "",
      department: existingProfile?.department || "",
      subjects: existingProfile?.subjects || "",
      courses: existingProfile?.courses || "",
      researchPapers: existingProfile?.researchPapers || "",
    },
  });

  useEffect(() => {
    // If profile exists and we're not in edit mode, redirect to dashboard
    if (existingProfile && !isEditing) {
      navigate("/teacher/dashboard");
    }
  }, [existingProfile, isEditing, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Create the profile data
      const updatedProfile = {
        ...existingProfile,
        ...values,
        displayName: user?.displayName || 'Teacher',
      };

      // Store individual teacher profile
      localStorage.setItem('teacherProfile', JSON.stringify(updatedProfile));
      
      // Update in all teachers array
      const existingTeachersString = localStorage.getItem('allTeachers');
      const existingTeachers = existingTeachersString ? JSON.parse(existingTeachersString) : [];
      
      const teacherIndex = existingTeachers.findIndex(
        (t: any) => t.email === user?.email
      );
      
      if (teacherIndex >= 0) {
        existingTeachers[teacherIndex] = updatedProfile;
      } else {
        existingTeachers.push(updatedProfile);
      }
      
      localStorage.setItem('allTeachers', JSON.stringify(existingTeachers));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
      navigate("/teacher/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = () => {
    const currentCourses = form.getValues('courses');
    form.setValue('courses', currentCourses ? `${currentCourses}\n` : '');
    setIsEditing(true);
  };

  if (!isEditing && existingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Details
              </h1>
              <div className="space-x-2">
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
                <Button onClick={handleAddCourse} variant="outline">
                  Add Course
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Teacher ID</h3>
                <p>{existingProfile.teacherId}</p>
              </div>
              <div>
                <h3 className="font-semibold">Department</h3>
                <p>{existingProfile.department}</p>
              </div>
              <div>
                <h3 className="font-semibold">Subjects</h3>
                <p className="whitespace-pre-line">{existingProfile.subjects}</p>
              </div>
              <div>
                <h3 className="font-semibold">Courses</h3>
                <p className="whitespace-pre-line">{existingProfile.courses}</p>
              </div>
              {existingProfile.researchPapers && (
                <div>
                  <h3 className="font-semibold">Research Papers</h3>
                  <p className="whitespace-pre-line">{existingProfile.researchPapers}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEditing ? 'Edit Profile' : 'Complete Your Profile'}
          </h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your teacher ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjects & Classes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List the subjects you teach and their respective classes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completed Courses</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List any additional courses or certifications you've completed"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="researchPapers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Papers (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List any research papers you've published"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
                {isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileForm;
