import React, { useState, useEffect, useMemo } from 'react';
import ProfessorServices from '../../../../services/ProfessorServices';
import ManageUsersServices from '../../../../services/ManageUsersServices';
import ReportServices from '../../../../services/ReportServices';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import { ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState('userRole');
  const [professorData, setProfessorData] = useState(null);

  const roleColors = {
    admin: '#4F46E5',
    professor: '#6B7280',
    student: '#9333EA',
  };

  const chartColors = {
    spam: '#4F46E5',
    harassment: '#6B7280',
    inappropriate: '#9333EA',
    offensiveLanguage: '#FBBF24',
    irrelevantContent: '#10B981',
    misleadingInformation: '#F472B6',
    violatesGuidelines: '#DC2626',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, reportResponse, professorResponse] = await Promise.all([
          ManageUsersServices.indexUsers({}),
          ReportServices.getAllReviewReports({}),
          ProfessorServices.indexProfessors({}),
        ]);

        const professorsStats = professorResponse.professorsData.map((professor) => {
          return {
            name: professor.firstName + ' ' + professor.lastName,
            averageRating: professor.averageRating,
            reviewCount: professor.reviewCount,
            ratingBreakdown: professor.reviews.reduce((acc, review) => {
              const rating = review.rating || 0;
              acc[rating] = (acc[rating] || 0) + 1;
              return acc;
            }, {}),
            commentsPerReview: professor.reviews.map((review) => review.comments.length),
            courses: professor.courses,
            department: professor.department[0]?.name,
          };
        });

        const userStats = {
          totalUsers: usersResponse.users.length || 0,
          usersPerRole: usersResponse.users.reduce((acc, user) => {
            if (user.adminAccount) acc['admin'] = (acc['admin'] || 0) + 1;
            else if (user.professorAccount) acc['professor'] = (acc['professor'] || 0) + 1;
            else if (user.studentAccount) acc['student'] = (acc['student'] || 0) + 1;
            return acc;
          }, {}),
        };

        const reportStats = reportResponse?.reports
          ? {
            totalReports: reportResponse.reports.length || 0,
            reportsByCategory: reportResponse.reports.reduce((acc, report) => {
              const category = report.category || 'Unknown';
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {}),
          }
          : { totalReports: 0, reportsByCategory: {} };

        setAnalytics({
          userStats,
          reportStats,
        });
        setProfessorData(professorsStats);
      } catch (err) {
        setError('Failed to fetch data for analytics');
      }
    };

    fetchData();
  }, []);

  const userRoleChartData = useMemo(() => {
    if (!analytics || !analytics.userStats) return { labels: [], datasets: [] };

    return {
      labels: ['Admin', 'Professor', 'Student'],
      datasets: [
        {
          data: [
            analytics.userStats.usersPerRole.admin || 0,
            analytics.userStats.usersPerRole.professor || 0,
            analytics.userStats.usersPerRole.student || 0,
          ],
          backgroundColor: [roleColors.admin, roleColors.professor, roleColors.student],
          borderColor: ['#fff', '#fff', '#fff'],
          borderWidth: 1,
        },
      ],
    };
  }, [analytics]);

  const reportCategoryChartData = useMemo(() => {
    if (!analytics || !analytics.reportStats) return { labels: [], datasets: [] };

    const reportCategories = analytics.reportStats.reportsByCategory || {};

    return {
      labels: [
        'Spam', 'Harassment', 'Inappropriate', 'Offensive Language',
        'Irrelevant Content', 'Misleading Information', 'Violates Guidelines'
      ],
      datasets: [
        {
          data: [
            reportCategories.spam || 0,
            reportCategories.harassment || 0,
            reportCategories['inappropriate-review'] || 0,
            reportCategories['offensive-language'] || 0,
            reportCategories['irrelevant-content'] || 0,
            reportCategories['misleading-information'] || 0,
            reportCategories['violates-guidelines'] || 0,
          ],
          backgroundColor: [
            chartColors.spam,
            chartColors.harassment,
            chartColors.inappropriate,
            chartColors.offensiveLanguage,
            chartColors.irrelevantContent,
            chartColors.misleadingInformation,
            chartColors.violatesGuidelines,
          ],
          borderColor: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
          borderWidth: 1,
        },
      ],
    };
  }, [analytics]);

  const ratingData = useMemo(() => ({
    labels: professorData?.map((professor) => professor.name),
    datasets: [{
      label: 'Ratings Breakdown',
      data: professorData?.map((professor) => professor.averageRating),
      backgroundColor: ['#4F46E5', '#6B7280', '#9333EA', '#FBBF24', '#DC2626'],
      borderColor: '#fff',
      borderWidth: 1,
    }],
  }), [professorData]);

  const commentsData = useMemo(() => ({
    labels: professorData?.map((professor, index) => professor.name),
    datasets: [{
      label: 'Comments per Review',
      data: professorData?.map((professor) => professor.commentsPerReview.length),
      backgroundColor: '#4F46E5',
      borderColor: '#fff',
      borderWidth: 1,
    }],
  }), [professorData]);

  const coursesData = useMemo(() => ({
    labels: professorData?.map((professor) => professor.courses.map(course => course.code)).flat(),
    datasets: [{
      label: 'Courses Taught',
      data: professorData?.map((professor) => professor.courses.map(course => course.credits)).flat(),
      backgroundColor: '#9333EA',
      borderColor: '#fff',
      borderWidth: 1,
    }],
  }), [professorData]);

  const chartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const professor = professorData[index];

            if (context.dataset.label === 'Courses Taught') {
              return `${professor?.name ? professor?.name : 'No professor assigned'}`;
            }

            if (context.dataset.label === 'Ratings Breakdown') {
              const rating = Object.keys(professor?.ratingBreakdown || {})[context.dataIndex];
              const ratingCount = professor?.ratingBreakdown[rating] || 0;
              return `${professor?.name ? professor?.name : 'No professor assigned'} - Rating: ${rating ? rating : ''} (${ratingCount} reviews)`;
            }

            return '';
          },
        },
      },
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15,
          color: '#000',
          font: {
            size: 14,
          },
        },
      },
    },
  };

  const handleChartChange = (event) => {
    setSelectedChart(event.target.value);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h1>
        <select onChange={handleChartChange} value={selectedChart} className="p-1 px-2 border rounded-lg text-sm focus:outline-none">
          <option value="userRole">Users by Role</option>
          <option value="reportCategory">Reports by Category</option>
          <option value="professorAnalytics">Professor Analytics</option>
        </select>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap justify-center gap-6">
          {selectedChart === 'userRole' && (
            <div className="flex flex-col items-center">
              <h2 className="text-medium font-semibold mr-10">User Role Composition</h2>
              <Pie data={userRoleChartData} options={chartOptions} height={350} width={350} />
            </div>
          )}
          {selectedChart === 'reportCategory' && (
            <div className="flex flex-col items-center">
              <h2 className="text-medium font-semibold mr-10">Reports by Category</h2>
              <Pie data={reportCategoryChartData} options={chartOptions} height={350} width={350} />
            </div>
          )}
          {selectedChart === 'professorAnalytics' && (
            <div className="flex gap-10 justify-center mt-6">
              <div className="flex flex-col items-center">
                <h2 className="text-medium font-semibold mr-10">Ratings Breakdown</h2>
                <Pie data={ratingData} options={chartOptions} height={300} width={300} />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-medium font-semibold mr-10 mb-4">Average Comments per Review</h2>
                <Bar data={commentsData} options={chartOptions} height={300} width={300} />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-medium font-semibold mr-10 mb-4">Courses Instructed</h2>
                <Bar data={coursesData} options={chartOptions} height={300} width={300} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
