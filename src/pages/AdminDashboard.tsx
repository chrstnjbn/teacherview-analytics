import type React from "react";
import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import toast from "react-hot-toast";
import { Timestamp } from "firebase/firestore";

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

interface User {
  id: string;
  displayName: string;
  photoURL?: string;
  role?: string;
  department?: string;
}

interface Student {
  id: string;
  name: string;
  department: string;
  createdAt: Timestamp;
}

interface FeedbackData {
  id: string;
  studentId: string;
  teacherId: string;
  rating: number;
  comment?: string;
  createdAt: Timestamp;
}

interface DashboardStats {
  students: number;
  faculty: number;
  averageRating: number;
  departments: number;
  increases: {
    students: number;
    faculty: number;
    rating: number;
  };
}

interface RecentActivity {
  id: string;
  type: "feedback" | "login" | "registration" | "update";
  userId: string;
  userType: "student" | "faculty" | "admin";
  description: string;
  createdAt: Timestamp;
}

const AdminDashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const performanceChartRef = useRef<Chart | null>(null);
  const ratingChartRef = useRef<Chart | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    students: 20,
    faculty: 3,
    averageRating: 4.2,
    departments: 1,
    increases: {
      students: 8,
      faculty: 1,
      rating: 0.3,
    },
  });

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateMockPerformanceData = () => {
    const teachers = [
      { name: "Priya Iype", trend: [4.5, 4.7, 4.6, 4.8, 4.9, 4.7] },
      { name: "Alvin Dennis", trend: [4.3, 4.5, 4.4, 4.6, 4.7, 4.8] },
      { name: "Christine Jibin", trend: [4.6, 4.8, 4.7, 4.9, 4.8, 4.9] },
    ];

    const months = new Array(6)
      .fill(0)
      .map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString("default", { month: "short" });
      })
      .reverse();

    return {
      labels: months,
      datasets: teachers.map((teacher, index) => ({
        label: teacher.name,
        data: teacher.trend,
        borderColor:
          index === 0 ? "#4f46e5" : index === 1 ? "#10b981" : "#f59e0b",
        backgroundColor:
          index === 0
            ? "rgba(79, 70, 229, 0.1)"
            : index === 1
            ? "rgba(16, 185, 129, 0.1)"
            : "rgba(245, 158, 11, 0.1)",
        tension: 0.3,
        fill: true,
      })),
    };
  };

  const generateMockRatingDistribution = () => {
    return {
      labels: ["Priya Iype", "Alvin Dennis", "Christine Jibin"],
      datasets: [
        {
          data: [
            [30, 25, 10, 5, 2],
            [28, 22, 12, 4, 1],
            [32, 28, 8, 2, 1],
          ],
          backgroundColor: [
            ["#10b981", "#4f46e5", "#f59e0b", "#f97316", "#ef4444"],
            ["#10b981", "#4f46e5", "#f59e0b", "#f97316", "#ef4444"],
            ["#10b981", "#4f46e5", "#f59e0b", "#f97316", "#ef4444"],
          ],
        },
      ],
    };
  };

  const generateMockRecentActivities = () => {
    const activities: RecentActivity[] = [
      ...feedbackData.slice(0, 3).map(
        (feedback): RecentActivity => ({
          id: `activity_${feedback.id}`,
          type: "feedback",
          userId: feedback.studentId,
          userType: "student",
          description: `New feedback submitted for ${
            faculty.find((f) => f.id === feedback.teacherId)?.displayName ||
            "a teacher"
          }`,
          createdAt: feedback.createdAt,
        })
      ),
      ...faculty.slice(0, 2).map(
        (f, idx): RecentActivity => ({
          id: `activity_login_${f.id}`,
          type: "login",
          userId: f.id,
          userType: "faculty",
          description: `${f.displayName} logged into the system`,
          createdAt: Timestamp.fromDate(new Date(Date.now() - idx * 3600000)),
        })
      ),
      ...students.slice(0, 2).map(
        (s, idx): RecentActivity => ({
          id: `activity_reg_${s.id}`,
          type: "registration",
          userId: s.id,
          userType: "student",
          description: `New student ${s.name} registered from ${s.department}`,
          createdAt: s.createdAt,
        })
      ),
    ];
    return shuffleArray(activities);
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser?.role !== "admin") {
        toast.error("Unauthorized access");
        window.location.href = "/login";
        return;
      }

      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Mock data for students
      const mockStudents = Array.from({ length: 450 }, (_, i) => ({
        id: `student_${i}`,
        name: `Student ${i}`,
        department: ["CSE", "ECE", "EEE", "ME", "CE", "IT"][
          Math.floor(Math.random() * 6)
        ],
        createdAt: Timestamp.fromDate(
          new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        ),
      }));
      setStudents(mockStudents);

      const mockFaculty = [
        {
          id: "faculty_1",
          displayName: "Priya Iype",
          role: "teacher",
          department: "CSE",
        },
        {
          id: "faculty_2",
          displayName: "Alvin Dennis",
          role: "teacher",
          department: "ECE",
        },
        {
          id: "faculty_3",
          displayName: "Christine Jibin",
          role: "teacher",
          department: "IT",
        },
      ];
      setFaculty(mockFaculty);

      // Mock feedback data
      const mockFeedback = Array.from({ length: 50 }, (_, i) => ({
        id: `feedback_${i}`,
        studentId: `student_${Math.floor(Math.random() * 450)}`,
        teacherId:
          mockFaculty[Math.floor(Math.random() * mockFaculty.length)].id,
        rating: 3 + Math.random() * 2, // Ratings between 3 and 5
        comment: Math.random() > 0.5 ? "Great teaching!" : undefined,
        createdAt: Timestamp.fromDate(
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        ),
      }));
      setFeedbackData(mockFeedback);

      const mockPerformanceData = generateMockPerformanceData();
      const mockRatingDistribution = generateMockRatingDistribution();

      if (performanceChartRef.current) {
        performanceChartRef.current.data.labels = mockPerformanceData.labels;
        performanceChartRef.current.data.datasets =
          mockPerformanceData.datasets;
        performanceChartRef.current.update();
      }

      if (ratingChartRef.current) {
        ratingChartRef.current.data.labels = mockRatingDistribution.labels;
        ratingChartRef.current.data.datasets = mockRatingDistribution.datasets;
        ratingChartRef.current.update();
      }

      setLoading(false);
    } catch (error) {
      console.error("Error setting up mock data:", error);
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!students.length || !faculty.length) {
      setDashboardStats({
        students: 450,
        faculty: 32,
        averageRating: 4.2,
        departments: 6,
        increases: {
          students: Math.floor(Math.random() * 20) + 10,
          faculty: Math.floor(Math.random() * 5) + 2,
          rating: Number((Math.random() * 0.5 + 0.1).toFixed(1)),
        },
      });
    }
  }, [students, faculty]);

  useEffect(() => {
    if (feedbackData.length && faculty.length && students.length) {
      setRecentActivities(generateMockRecentActivities());
    }
  }, [feedbackData, faculty, students]);

  const processChartData = (feedback: FeedbackData[]) => {
    if (feedback.length === 0) {
      const mockData = generateMockPerformanceData();
      return {
        labels: mockData.labels,
        ratings: mockData.datasets.map((d) => d.data),
      };
    }
    const months = new Array(6)
      .fill(0)
      .map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString("default", { month: "short" });
      })
      .reverse();

    return {
      labels: months,
      ratings: months.map(() => 0),
    };
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64String = reader.result as string;
        setProfilePic(base64String);
        localStorage.setItem("profilePic", base64String);
        toast.success("Profile picture updated successfully");
      } catch (error) {
        toast.error("Failed to update profile picture");
        console.error("Profile pic update error:", error);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read image file");
    };

    reader.readAsDataURL(file);
  };

  const generateReport = async () => {
    try {
      toast.loading("Generating report...");

      const reportData = {
        totalStudents: students.length,
        totalFaculty: faculty.length,
        averageRating:
          feedbackData.length > 0
            ? (
                feedbackData.reduce((acc, curr) => acc + curr.rating, 0) /
                feedbackData.length
              ).toFixed(1)
            : "N/A",
        departmentCount: new Set(students.map((s) => s.department)).size,
        topPerformers: faculty.slice(0, 5),
        recentFeedback: feedbackData.slice(0, 10),
        generatedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `performance-report-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Report generation error:", error);
      toast.dismiss();
      toast.error("Failed to generate report");
    }
  };

  const initCharts = () => {
    const performanceCtx = document.getElementById(
      "performanceChart"
    ) as HTMLCanvasElement;
    const ratingCtx = document.getElementById(
      "ratingChart"
    ) as HTMLCanvasElement;

    if (performanceCtx && ratingCtx) {
      if (performanceChartRef.current) performanceChartRef.current.destroy();
      if (ratingChartRef.current) ratingChartRef.current.destroy();

      const mockPerformanceData = generateMockPerformanceData();
      const mockRatingData = generateMockRatingDistribution();

      performanceChartRef.current = new Chart(performanceCtx, {
        type: "line",
        data: {
          labels: mockPerformanceData.labels,
          datasets: mockPerformanceData.datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                title: (context) => `Performance - ${context[0].label}`,
                label: (context) =>
                  `${context.dataset.label}: ${context.parsed.y.toFixed(1)} ⭐`,
              },
            },
          },
          scales: {
            y: {
              min: 0,
              max: 5,
              ticks: {
                stepSize: 1,
                callback: (value) => `${value} ⭐`,
              },
            },
          },
        },
      });

      ratingChartRef.current = new Chart(ratingCtx, {
        type: "bar",
        data: {
          labels: ["5 ⭐", "4 ⭐", "3 ⭐", "2 ⭐", "1 ⭐"],
          datasets: mockRatingData.labels.map((name, idx) => ({
            label: name,
            data: mockRatingData.datasets[0].data[idx],
            backgroundColor: mockRatingData.datasets[0].backgroundColor[idx],
            borderRadius: 4,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: {
              callbacks: {
                label: (context) =>
                  `${context.dataset.label}: ${context.parsed.y} ratings`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Number of Ratings",
              },
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    initCharts();
  }, [feedbackData]);

  useEffect(() => {
    return () => {
      if (performanceChartRef.current) {
        performanceChartRef.current.destroy();
      }
      if (ratingChartRef.current) {
        ratingChartRef.current.destroy();
      }
    };
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    label: string
  ) => {
    e.preventDefault();
    setActiveNav(label.toLowerCase());
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("adminProfile");
      localStorage.removeItem("profilePic");

      toast.success("Logged out successfully");

      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <div className="sticky top-0 bg-white border-b px-4 md:px-8 py-4 z-10">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <i className="fas fa-search absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-indigo-500"
              placeholder="Search..."
            />
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <i className="fas fa-bell text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                  id="profile-pic-input"
                />
                <label
                  htmlFor="profile-pic-input"
                  className="cursor-pointer relative block"
                >
                  <img
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-600"
                    src={
                      profilePic ||
                      user?.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.displayName || "User"
                      )}&background=4f46e5&color=fff`
                    }
                    alt={user?.displayName || "User"}
                  />
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <i className="fas fa-camera text-white text-sm" />
                  </div>
                </label>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                  {user?.displayName}
                </span>
                <span className="text-xs text-gray-600">Administrator</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.displayName?.split(" ")[0]}Admin! Here's
              what's happening today.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Total Students
              </h3>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <i className="fas fa-users text-indigo-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">40</div>
            <div className="flex items-center text-green-500 text-sm">
              <i className="fas fa-arrow-up mr-1" />
              15 new
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Faculty Members
              </h3>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <i className="fas fa-chalkboard-teacher text-indigo-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">5</div>
            <div className="flex items-center text-green-500 text-sm">
              <i className="fas fa-arrow-up mr-1" />3 new additions
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Average Rating
              </h3>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <i className="fas fa-star text-indigo-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">4.5</div>
            <div className="flex items-center text-green-500 text-sm">
              <i className="fas fa-arrow-up mr-1" />
              0.3 increase
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Departments</h3>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <i className="fas fa-building text-indigo-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">2</div>
            <div className="flex items-center text-gray-500 text-sm">
              <i className="fas fa-minus mr-1" /> No change
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Faculty Performance Trend
              </h3>
              <select className="border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                <option>Last 6 Months</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="h-80">
              <canvas id="performanceChart" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Rating Distribution
              </h3>
              <select className="border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                <option>Current Term</option>
                <option>Last Term</option>
              </select>
            </div>
            <div className="h-80">
              <canvas id="ratingChart" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <a
                href="#"
                className="text-indigo-600 hover:text-indigo-700 text-sm"
              >
                View All
              </a>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-500">
                  Loading activities...
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <i
                        className={`fas ${
                          activity.type === "feedback"
                            ? "fa-comment"
                            : activity.type === "login"
                            ? "fa-sign-in-alt"
                            : activity.type === "registration"
                            ? "fa-user-plus"
                            : "fa-pen"
                        } text-indigo-600`}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-sm font-semibold text-gray-800">
                        {activity.description}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {activity.createdAt.toDate().toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent activity available
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-4">
              <button
                type="button"
                className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <i className="fas fa-user-plus mr-2" />
                <span>Add Faculty</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <i className="fas fa-file-export mr-2" aria-hidden="true" />
                <span>Export Data</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <i className="fas fa-cog mr-2" aria-hidden="true" />
                <span>Settings</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <i className="fas fa-question-circle mr-2" aria-hidden="true" />
                <span>Help</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
