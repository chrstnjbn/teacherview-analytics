import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import toast from "react-hot-toast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../lib/firebase";

interface FeedbackData {
  id: string;
  rating: number;
  comment: string;
  courseId: string;
  teacherResponse?: string;
  timestamp: { seconds: number; nanoseconds: number };
  teacherUid: string;
  approachable: boolean;
  collegeCode: string;
  effectiveMethods: boolean;
  explanationClarity: string;
  studentId: string;
  studentName: string;
  submittedAt: { seconds: number; nanoseconds: number };
  suggestedChanges: string;
  teacherName: string;
  teachingQuality: string;
}

const TeacherDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [ratings, setRatings] = useState<FeedbackData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [latestFeedback, setLatestFeedback] = useState<FeedbackData[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [trendingData, setTrendingData] = useState({
    ratingChange: 0,
    newReviewsThisWeek: 0,
    responseRate: 0,
    activeCourses: new Set(),
  });
  const [loading, setLoading] = useState(true);
  const performanceChartRef = useRef<HTMLCanvasElement>(null);
  const ratingChartRef = useRef<HTMLCanvasElement>(null);

  const calculateMonthlyAverages = useCallback((ratings: FeedbackData[]) => {
    const monthlyData = ratings.reduce((acc, rating) => {
      const date = new Date(rating.timestamp.seconds * 1000);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!acc[monthYear]) {
        acc[monthYear] = { sum: 0, count: 0 };
      }
      acc[monthYear].sum += rating.rating;
      acc[monthYear].count += 1;
      return acc;
    }, {});

    return Object.entries(monthlyData)
      .map(([month, data]: [string, any]) => ({
        month,
        average: (data.sum / data.count).toFixed(1),
      }))
      .slice(-6);
  }, []);

  const initCharts = useCallback(() => {
    let existingPerformanceChart = Chart.getChart(performanceChartRef.current);
    let existingRatingChart = Chart.getChart(ratingChartRef.current);

    if (existingPerformanceChart) {
      existingPerformanceChart.destroy();
    }
    if (existingRatingChart) {
      existingRatingChart.destroy();
    }
    if (performanceChartRef.current && ratings.length > 0) {
      const monthlyAverages = calculateMonthlyAverages(ratings);
      new Chart(performanceChartRef.current, {
        type: "line",
        data: {
          labels: monthlyAverages.map((item) => item.month),
          datasets: [
            {
              label: "Average Rating",
              data: monthlyAverages.map((item) => parseFloat(item.average)),
              borderColor: "#EC4899",
              backgroundColor: "rgba(236, 72, 153, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 1,
              max: 5,
            },
          },
        },
      });
    }

    if (ratingChartRef.current) {
      new Chart(ratingChartRef.current, {
        type: "bar",
        data: {
          labels: ["1★", "2★", "3★", "4★", "5★"],
          datasets: [
            {
              data: [
                ratingDistribution[1],
                ratingDistribution[2],
                ratingDistribution[3],
                ratingDistribution[4],
                ratingDistribution[5],
              ],
              backgroundColor: [
                "#FEE2E2",
                "#FECACA",
                "#FCA5A5",
                "#F87171",
                "#EF4444",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }
  }, [ratings, ratingDistribution, calculateMonthlyAverages]);

  const handleLogout = () => {
    try {
      window.location.href = "/";
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const calculateTrends = useCallback((ratingsData: FeedbackData[]) => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const currentRatings = ratingsData.filter(
      (r) => new Date(r.timestamp.seconds * 1000) > lastMonth
    );
    const previousRatings = ratingsData.filter((r) => {
      const date = new Date(r.timestamp.seconds * 1000);
      return (
        date <= lastMonth &&
        date > new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000)
      );
    });

    const currentAvg =
      currentRatings.reduce((acc, curr) => acc + curr.rating, 0) /
        currentRatings.length || 0;
    const previousAvg =
      previousRatings.reduce((acc, curr) => acc + curr.rating, 0) /
        previousRatings.length || 0;

    const newReviews = ratingsData.filter(
      (r) => new Date(r.timestamp.seconds * 1000) > lastWeek
    ).length;

    const totalResponses = ratingsData.filter((r) => r.teacherResponse).length;
    const responseRate = (totalResponses / ratingsData.length) * 100 || 0;

    const courses = new Set(ratingsData.map((r) => r.courseId));

    setTrendingData({
      ratingChange: Number((currentAvg - previousAvg).toFixed(1)),
      newReviewsThisWeek: newReviews,
      responseRate: Math.round(responseRate),
      activeCourses: courses,
    });
  }, []);

  const calculateResponseRate = useCallback((feedbackData: FeedbackData[]) => {
    const totalFeedback = feedbackData.length;
    if (totalFeedback === 0) return 0;

    const respondedFeedback = feedbackData.filter(
      (feedback) =>
        feedback.teacherResponse && feedback.teacherResponse.trim() !== ""
    ).length;

    return Math.round((respondedFeedback / totalFeedback) * 100);
  }, []);

  const getLatestFeedback = useCallback((feedbackData: FeedbackData[]) => {
    return [...feedbackData]
      .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
      .slice(0, 5)
      .map((feedback) => ({
        ...feedback,
        timeAgo: new Date(feedback.timestamp.seconds * 1000).toLocaleString(),
      }));
  }, []);

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

  const fetchTeacherData = async (email: string) => {
    try {
      const usersRef = collection(db, "users");
      const teacherQuery = query(
        usersRef,
        where("email", "==", email.toLowerCase())
      );

      const teacherSnapshot = await getDocs(teacherQuery);

      if (teacherSnapshot.empty) {
        toast.error("No user found with this email");
        return null;
      }

      const teacherDoc = teacherSnapshot.docs[0];
      const teacherData = teacherDoc.data();

      if (teacherData.role !== "teacher") {
        toast.error("User is not a teacher");
        return null;
      }

      setUser({
        ...teacherData,
        id: teacherDoc.id,
        initials:
          teacherData.displayName
            ?.split(" ")
            .map((n: string) => n[0])
            .join("") || "U",
      });

      toast.success("Teacher data loaded successfully");
      return teacherDoc.id;
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      toast.error("Failed to fetch teacher data");
      return null;
    }
  };

  const fetchRatingsData = async (teacherId: string) => {
    try {
      const ratingsRef = collection(db, "feedback");
      const feedbackQuery = query(
        ratingsRef,
        where("teacherUid", "==", teacherId)
      );

      toast.loading("Loading feedback data...", { id: "feedback-loading" });

      const querySnapshot = await getDocs(feedbackQuery);
      console.log("Feedback documents found:", querySnapshot.size);

      const ratingsData: FeedbackData[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const normalizedRating = Math.min(Math.max(Number(data.rating), 1), 5);

        ratingsData.push({
          id: doc.id,
          ...data,
          rating: normalizedRating,
          timestamp: data.submittedAt ||
            data.timestamp || {
              seconds: Date.now() / 1000,
              nanoseconds: 0,
            },
          approachable: data.approachable || false,
          collegeCode: data.collegeCode || "",
          effectiveMethods: data.effectiveMethods || false,
          explanationClarity: data.explanationClarity || "Not specified",
          studentId: data.studentId || "",
          studentName: data.studentName || "Anonymous",
          submittedAt: data.submittedAt || data.timestamp,
          suggestedChanges: data.suggestedChanges || "",
          teacherName: data.teacherName || "",
          teachingQuality: data.teachingQuality || "Not specified",
        } as FeedbackData);
      }

      toast.dismiss("feedback-loading");

      if (ratingsData.length === 0) {
        toast.info("No feedback found for this teacher");
        return;
      }

      const totalRating = ratingsData.reduce(
        (acc, curr) => acc + curr.rating,
        0
      );
      const avgRating = Number((totalRating / ratingsData.length).toFixed(1));
      setAverageRating(avgRating);

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      for (const rating of ratingsData) {
        const ratingKey = Math.min(
          Math.max(Math.round(rating.rating), 1),
          5
        ) as 1 | 2 | 3 | 4 | 5;
        distribution[ratingKey]++;
      }

      const sortedRatings = ratingsData.sort(
        (a, b) => b.timestamp.seconds - a.timestamp.seconds
      );

      setRatingDistribution(distribution);
      setLatestFeedback(getLatestFeedback(sortedRatings));
      setRatings(sortedRatings);
      calculateTrends(sortedRatings);

      setTrendingData((prev) => ({
        ...prev,
        responseRate: calculateResponseRate(ratingsData),
      }));

      toast.success("Data loaded successfully");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please try again later.");
    }
  };

  const downloadReport = () => {
    try {
      const reportData = {
        teacherName: user?.displayName,
        averageRating,
        totalReviews: ratings.length,
        responseRate: trendingData.responseRate,
        ratingDistribution,
        feedbackDetails: ratings.map((feedback) => ({
          courseId: feedback.courseId,
          rating: feedback.rating,
          comment: feedback.comment,
          date: new Date(
            feedback.timestamp.seconds * 1000
          ).toLocaleDateString(),
          responded: !!feedback.teacherResponse,
        })),
      };

      const csvContent = [
        ["Teacher Analytics Report"],
        ["Generated on:", new Date().toLocaleString()],
        [""],
        ["Teacher Name:", reportData.teacherName],
        ["Average Rating:", reportData.averageRating],
        ["Total Reviews:", reportData.totalReviews],
        ["Response Rate:", `${reportData.responseRate}%`],
        [""],
        ["Rating Distribution:"],
        ["5 stars:", ratingDistribution[5]],
        ["4 stars:", ratingDistribution[4]],
        ["3 stars:", ratingDistribution[3]],
        ["2 stars:", ratingDistribution[2]],
        ["1 star:", ratingDistribution[1]],
        [""],
        ["Detailed Feedback:"],
        ["Course ID", "Rating", "Comment", "Date", "Responded"],
        ...reportData.feedbackDetails.map((fd) => [
          fd.courseId,
          fd.rating,
          fd.comment,
          fd.date,
          fd.responded ? "Yes" : "No",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `teacher_analytics_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email) {
          setLoading(true);
          try {
            toast.loading("Loading teacher data...", { id: "teacher-loading" });

            const teacherId = await fetchTeacherData(firebaseUser.email);
            if (teacherId) {
              await fetchRatingsData(teacherId);
            } else {
              throw new Error("Could not fetch teacher data");
            }
          } catch (error) {
            console.error("Error initializing dashboard:", error);
            toast.error("Failed to initialize dashboard");
          } finally {
            toast.dismiss("teacher-loading");
            setLoading(false);
          }
        } else {
          toast.error("No email associated with account");
          setLoading(false);
        }
      } else {
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (ratings.length > 0) {
      initCharts();
    }

    return () => {
      const performanceChart = Chart.getChart(performanceChartRef.current);
      const ratingChart = Chart.getChart(ratingChartRef.current);

      if (performanceChart) performanceChart.destroy();
      if (ratingChart) ratingChart.destroy();
    };
  }, [ratings, ratingDistribution, initCharts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                PerformEdge
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-pink-500"
                  />
                ) : (
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-pink-100 flex items-center justify-center border-2 border-pink-500">
                    <span className="text-sm sm:text-base font-medium text-pink-500">
                      {user?.initials}
                    </span>
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                  />
                  <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs shadow-lg hover:bg-pink-600 transition-colors">
                    <svg
                      className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                  {user?.displayName}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-2 sm:px-3 py-1 sm:py-2 border border-pink-500 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Faculty Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Track your performance and student feedback
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="w-full md:w-auto bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            <svg
              className="h-5 w-5 inline-block mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Download Reports
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">My Rating</h3>
              <div className="bg-pink-100 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-pink-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.54 1.118l-5.347-3.89a1 1 0 00-1.176 0l-5.347-3.89c-.784.57-1.838-.197-1.54-1.118l2.036-6.29a1 1 0 00-.364-1.118L2.414 11.717c-.783-.57-.381-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.29z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {averageRating}
            </div>
            <div className="flex items-center text-green-500 text-sm">
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    trendingData.ratingChange >= 0
                      ? "M5 15l7-7 7 7"
                      : "M19 9l-7 7-7-7"
                  }
                />
              </svg>
              {Math.abs(trendingData.ratingChange)} from last month
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Total Reviews
              </h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2m4-4h4m-4 0a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V6a2 2 0 00-2-2m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {ratings.length}
            </div>
            <div className="flex items-center text-green-500 text-sm">
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              {trendingData.newReviewsThisWeek} new this week
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Response Rate
              </h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h11M9 21V3m-6 6l6-6m0 0l6 6m-6-6v18"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">89.5%</div>
            <div className="flex items-center text-gray-500 text-sm">
              Based on total feedback
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Active Courses
              </h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {trendingData.activeCourses.size}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              From student feedback
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium mb-2 sm:mb-0">
                Performance Trend
              </h3>
              <select className="w-full sm:w-auto text-sm border rounded-lg px-2 py-1">
                <option>Last 6 Months</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="relative h-40 sm:h-48 md:h-64">
              <canvas ref={performanceChartRef}></canvas>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium mb-2 sm:mb-0">
                My Rating Distribution
              </h3>
              <select className="w-full sm:w-auto text-sm border rounded-lg px-2 py-1">
                <option>Current Term</option>
                <option>Last Term</option>
              </select>
            </div>
            <div className="relative h-40 sm:h-48 md:h-64">
              <canvas ref={ratingChartRef}></canvas>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Latest Student Feedback
              </h3>
              <a href="#" className="text-sm text-pink-600 hover:underline">
                View All
              </a>
            </div>
            <div>
              {latestFeedback.map((feedback, index) => (
                <div
                  key={feedback.id}
                  className={`${
                    index !== latestFeedback.length - 1
                      ? "border-b pb-4 mb-4"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {feedback.collegeCode} - {feedback.studentName}
                    </span>
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, index) => (
                          <svg
                            key={index}
                            className={`h-4 w-4 ${
                              index < feedback.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600">
                        {feedback.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">"{feedback.comment}"</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Teaching: {feedback.teachingQuality}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Clarity: {feedback.explanationClarity}
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Approachable: {feedback.approachable ? "Yes" : "No"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 block mt-2">
                    {new Date(
                      feedback.submittedAt.seconds * 1000
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Upcoming Classes
              </h3>
              <a href="#" className="text-sm text-pink-600 hover:underline">
                Full Schedule
              </a>
            </div>
            <div>
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center mb-2">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">09:00 AM</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Advanced Algorithms
                  </h4>
                  <p className="text-xs text-gray-500">CS401 - Room 302</p>
                </div>
                <span className="text-xs text-green-500">Upcoming</span>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">11:30 AM</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Data Structures
                  </h4>
                  <p className="text-xs text-gray-500">CS301 - Room 205</p>
                </div>
                <span className="text-xs text-green-500">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
