import type React from "react";
import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import toast from "react-hot-toast";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

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

const AdminDashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const performanceChartRef = useRef<Chart | null>(null);
  const ratingChartRef = useRef<Chart | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

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
      { name: "Dr. Priya Mathew", trend: [4.5, 4.7, 4.6, 4.8, 4.9, 4.7] },
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
      labels: ["Dr. Priya Mathew", "Alvin Dennis", "Christine Jibin"],
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

      const studentsRef = collection(db, "students");
      const studentSnap = await getDocs(studentsRef);
      const studentsData = studentSnap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Student)
      );
      setStudents(studentsData);

      const usersRef = collection(db, "users");
      const teachersQuery = query(usersRef, where("role", "==", "teacher"));
      const teachersSnap = await getDocs(teachersQuery);
      const teachersData = teachersSnap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as User)
      );
      setFaculty(teachersData);

      const feedbackRef = collection(db, "feedback");
      const feedbackQuery = query(
        feedbackRef,
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const feedbackSnap = await getDocs(feedbackQuery);
      const feedbackList = feedbackSnap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as FeedbackData)
      );
      setFeedbackData(feedbackList);

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

      if (!feedbackData.length) {
        const mockActivity = [
          {
            id: "1",
            teacherId: faculty[0]?.id || "mock1",
            rating: 4.5,
            createdAt: Timestamp.fromDate(new Date()),
          },
          {
            id: "2",
            teacherId: faculty[1]?.id || "mock2",
            rating: 5.0,
            createdAt: Timestamp.fromDate(
              new Date(Date.now() - 24 * 60 * 60 * 1000)
            ),
          },
          {
            id: "3",
            teacherId: faculty[2]?.id || "mock3",
            rating: 4.8,
            createdAt: Timestamp.fromDate(
              new Date(Date.now() - 48 * 60 * 60 * 1000)
            ),
          },
          {
            id: "4",
            teacherId: "christine_id",
            rating: 4.9,
            createdAt: Timestamp.fromDate(new Date()),
          },
        ] as FeedbackData[];
        setFeedbackData(mockActivity);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch dashboard data");
      setLoading(false);
    }
  };

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

  const navItems: NavItem[] = [
    { icon: "fas fa-home", label: "Dashboard", href: "#" },
    { icon: "fas fa-chart-line", label: "Analytics", href: "#" },
    { icon: "fas fa-graduation-cap", label: "Students", href: "#" },
    { icon: "fas fa-chalkboard-teacher", label: "Faculty", href: "#" },
    { icon: "fas fa-book", label: "Courses", href: "#" },
    { icon: "fas fa-cog", label: "Settings", href: "#" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-lg bg-white shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span
            className={`block w-full h-0.5 bg-gray-600 transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "rotate-45 translate-y-2.5" : ""
            }`}
          />
          <span
            className={`block w-full h-0.5 bg-gray-600 transition-opacity duration-300 ease-in-out ${
              isSidebarOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-full h-0.5 bg-gray-600 transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`
          fixed inset-0 bg-gray-900/50 z-40 md:hidden
          transition-opacity duration-300 ease-in-out
          ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`
          fixed md:static inset-y-0 left-0 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }
          md:translate-x-0 transition-transform duration-300 ease-in-out
          w-64 bg-white shadow-xl z-40 flex flex-col h-full
        `}
      >
        <div className="p-6 border-b">
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
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-600"
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
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 truncate">
                {user?.displayName || "Loading..."}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || "Administrator"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.label)}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg
                  transition-colors duration-150 ease-in-out
                  ${
                    activeNav === item.label.toLowerCase()
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <i className={`${item.icon} w-5 h-5`} />
                <span className="ml-3">{item.label}</span>
              </a>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 ease-in-out group"
          >
            <i className="fas fa-sign-out-alt w-5 h-5 group-hover:text-red-600" />
            <span className="ml-3 group-hover:text-red-600">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-indigo-500"
                placeholder="Search..."
              />
            </div>
            <div className="flex items-center justify-between md:space-x-4">
              <div className="relative">
                <i className="fas fa-bell text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </div>
              <div className="flex items-center">
                <img
                  className="w-10 h-10 rounded-full"
                  src={
                    profilePic ||
                    user?.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.displayName || "Admin"
                    )}&background=4f46e5&color=fff`
                  }
                  alt={user?.displayName || "User"}
                />
                <div className="ml-3">
                  <div className="text-sm font-semibold text-gray-800">
                    {user?.displayName || "Loading..."}
                  </div>
                  <div className="text-xs text-gray-600">
                    {user?.role || "Administrator"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.displayName?.split(" ")[0] || "Admin"}!
                Here's what's happening today.
              </p>
            </div>
            <button
              type="button"
              onClick={generateReport}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Generate Report
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
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {loading ? "..." : students.length}
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <i className="fas fa-arrow-up mr-1" />
                {loading ? "..." : `${students.length} total`}
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
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {loading ? "..." : faculty.length}
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <i className="fas fa-arrow-up mr-1" />{" "}
                {loading ? "..." : "4 new additions"}
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
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {loading
                  ? "..."
                  : feedbackData.length > 0
                  ? (
                      feedbackData.reduce((acc, curr) => acc + curr.rating, 0) /
                      feedbackData.length
                    ).toFixed(1)
                  : "4.2"}
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <i className="fas fa-arrow-up mr-1" />{" "}
                {loading
                  ? "..."
                  : feedbackData.length > 0
                  ? "0.3 increase"
                  : "No data"}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-600 text-sm font-medium">
                  Departments
                </h3>
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <i className="fas fa-building text-indigo-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {loading
                  ? "..."
                  : new Set(students.map((s) => s.department)).size}
              </div>
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
                ) : feedbackData.length > 0 ? (
                  shuffleArray(feedbackData).slice(0, 5).map((feedback) => {
                    const teacher = faculty.find(
                      (t) => t.id === feedback.teacherId
                    );
                    const feedbackDate = feedback.createdAt?.toDate() || new Date();
                    const timeAgo = Math.floor((Date.now() - feedbackDate.getTime()) / (1000 * 60));
                    
                    let timeString = '';
                    if (timeAgo < 60) {
                      timeString = `${timeAgo} minutes ago`;
                    } else if (timeAgo < 1440) {
                      timeString = `${Math.floor(timeAgo / 60)} hours ago`;
                    } else {
                      timeString = feedbackDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }

                    return (
                      <div
                        key={feedback.id}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="bg-indigo-100 p-3 rounded-lg">
                          <i className="fas fa-comment text-indigo-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-semibold text-gray-800">
                            New Feedback for {" "}
                            {teacher?.displayName ||
                              (feedback.teacherId === "christine_id"
                                ? "Christine Jibin"
                                : feedback.teacherId === "mock2"
                                ? "Alvin Dennis"
                                : "Dr. Priya Mathew")}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, index) => (
                                <i
                                  key={index}
                                  className={`fas fa-star text-xs ${
                                    index < feedback.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">
                              {feedback.rating.toFixed(1)} rating
                            </p>
                            {feedback.comment && (
                              <span className="text-xs text-gray-500 italic">
                                "{feedback.comment}"
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {timeString}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No recent feedback available
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
                  <i
                    className="fas fa-question-circle mr-2"
                    aria-hidden="true"
                  />
                  <span>Help</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
