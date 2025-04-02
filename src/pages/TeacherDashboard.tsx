import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import toast from "react-hot-toast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

interface FeedbackData {
  id: string;
  rating: number;
  comment: string;
  courseId: string;
  teacherResponse?: string;
  timestamp: { seconds: number; nanoseconds: number };
  teacherUid: string;
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
      localStorage.removeItem("user");
      localStorage.removeItem("teacherProfile");
      localStorage.removeItem("profilePic");
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

  const fetchRatingsData = async (userId: string) => {
    try {
      const ratingsRef = collection(db, "feedback");
      const cleanUserId = userId.trim();
      console.log("Cleaned User ID:", cleanUserId);

      const userIdVariations = [
        cleanUserId,
        cleanUserId.toLowerCase(),
        cleanUserId.toUpperCase(),
        `${cleanUserId} `,
        `${cleanUserId.toLowerCase()} `,
        `${cleanUserId.toUpperCase()} `,
      ];

      const allDocs = await getDocs(collection(db, "feedback"));
      console.log(
        "All feedback documents:",
        allDocs.docs.map((doc) => {
          const data = doc.data();
          console.log("Document data:", data);
          return {
            id: doc.id,
            teacherUid: data.teacherUid,
            ...data,
          };
        })
      );

      const q = query(ratingsRef, where("teacherUid", "in", userIdVariations));

      toast.loading("Loading feedback data...", { id: "feedback-loading" });
      console.log(
        "Executing query with teacherUid variations:",
        userIdVariations
      );

      const querySnapshot = await getDocs(q);
      console.log("Query executed, documents found:", querySnapshot.size);

      querySnapshot.forEach((doc) => {
        console.log("Matching document:", doc.id, doc.data());
      });

      const ratingsData: FeedbackData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const normalizedRating = Math.min(Math.max(Number(data.rating), 1), 5);

        ratingsData.push({
          id: doc.id,
          ...data,
          rating: normalizedRating,
          timestamp: data.timestamp || {
            seconds: Date.now() / 1000,
            nanoseconds: 0,
          },
        } as FeedbackData);
      });

      console.log("Processed ratings data:", ratingsData);

      toast.dismiss("feedback-loading");

      if (ratingsData.length === 0) {
        if (allDocs.empty) {
          toast.error("The feedback collection is empty.");
        } else {
          toast.error(
            "No feedback found for this teacher. Please verify the teacher ID and data structure."
          );
        }
        console.log("Expected teacherUid format:", {
          provided: cleanUserId,
          lowercase: cleanUserId.toLowerCase(),
          uppercase: cleanUserId.toUpperCase(),
        });
        return;
      }

      const totalRating = ratingsData.reduce(
        (acc, curr) => acc + curr.rating,
        0
      );
      const avgRating = Number((totalRating / ratingsData.length).toFixed(1));
      setAverageRating(avgRating);

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratingsData.forEach((rating) => {
        const ratingKey = Math.min(
          Math.max(Math.round(rating.rating), 1),
          5
        ) as 1 | 2 | 3 | 4 | 5;
        distribution[ratingKey]++;
      });

      const sortedRatings = ratingsData.sort((a, b) => {
        const timestampA = a.timestamp?.seconds || 0;
        const timestampB = b.timestamp?.seconds || 0;
        return timestampB - timestampA;
      });

      setRatingDistribution(distribution);
      const recentFeedback = sortedRatings.slice(0, 2);
      console.log("Recent feedback:", recentFeedback);
      setLatestFeedback(getLatestFeedback(sortedRatings));
      setRatings(sortedRatings);
      calculateTrends(sortedRatings);

      setTrendingData((prev) => ({
        ...prev,
        responseRate: calculateResponseRate(ratingsData),
      }));

      toast.success("Data loaded successfully");
    } catch (error) {
      console.error("Error fetching ratings:", error);
      if (error instanceof Error) {
        const errorMessage = error.message.includes("permission")
          ? "Access denied. Please make sure you are logged in and have the correct permissions."
          : "Failed to load ratings data. Please try again later.";

        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });

        toast.error(errorMessage);
      }
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

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      const teacherProfile = localStorage.getItem("teacherProfile");
      const storedProfilePic = localStorage.getItem("profilePic");

      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log("User data from localStorage:", parsedUser);
        console.log("User ID to be used:", parsedUser.uid);

        if (!parsedUser.uid) {
          toast.error("User ID not found");
          return;
        }

        const parsedProfile = teacherProfile
          ? JSON.parse(teacherProfile)
          : null;
        setUser({
          ...parsedUser,
          ...parsedProfile,
          initials:
            parsedUser.displayName
              ?.split(" ")
              .map((n: string) => n[0])
              .join("") || "U",
        });

        if (storedProfilePic) {
          setProfilePic(storedProfilePic);
        }

        toast.success(`Welcome back, ${parsedUser.displayName}!`, {
          icon: "👋",
          duration: 3000,
          position: "top-center",
        });

        fetchRatingsData(parsedUser.uid);
      }
    } catch (error) {
      console.error("Error in useEffect:", error);
      toast.error("Failed to initialize dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between py-2 sm:py-4 md:h-16 md:py-0">
            <div className="flex items-center w-full md:w-auto mb-2 md:mb-0">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search reviews..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <svg
                  className="h-5 w-5 text-gray-400 absolute left-3 top-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end">
              <div className="relative mr-4">
                <svg
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.5V11a6 6 0 10-12 0v3.5c0 .538-.214 1.055-.595 1.405L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="flex items-center">
                <div className="relative group">
                  <input
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
                      className="w-10 h-10 rounded-full object-cover"
                      src={
                        profilePic ||
                        user?.photoURL ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.displayName || "User"
                        )}&background=ec4899&color=fff`
                      }
                      alt={user?.displayName || "User"}
                    />
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </label>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.displayName || "Loading..."}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.designation || "Teacher"}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 flex items-center px-3 py-2 border border-pink-500 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors text-sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              My Teaching Dashboard
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.54 1.118l-5.347-3.89a1 1 0 00-1.176 0l-5.347 3.89c-.784.57-1.838-.197-1.54-1.118l2.036-6.29a1 1 0 00-.364-1.118L2.414 11.717c-.783-.57-.381-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.29z"
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
            <div className="text-2xl font-bold text-gray-900 mb-2">
              89.5% 
            </div>
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
                      {feedback.courseId}
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
                  <span className="text-xs text-gray-400">
                    {feedback.timeAgo}
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
