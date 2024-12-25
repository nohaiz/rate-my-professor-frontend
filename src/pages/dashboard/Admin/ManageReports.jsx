import { useEffect, useState, useRef } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import ReportForm from "./ReportForm";
import ReportServices from "../../../../services/ReportServices";

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const hasScrolled = useRef(false);

  const categories = [
    'inappropriate-review', 'offensive-language', 'irrelevant-content', 'spam',
    'misleading-information', 'harassment', 'violates-guidelines'
  ];

  const statuses = ['pending', 'resolved', 'rejected'];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await ReportServices.getAllReviewReports();
        setReports(response?.reports ? response?.reports : []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    let filteredList = [...reports];

    if (searchQuery) {
      filteredList = filteredList.filter(report =>
        report.reporterId?.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filteredList = filteredList.filter(report => report.category === selectedCategory);
    }

    if (selectedStatus) {
      filteredList = filteredList.filter(report => report.status === selectedStatus);
    }

    setFilteredReports(filteredList);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, reports]);

  const handlePagination = (page) => {
    if (page < 1 || page > Math.ceil(filteredReports.length / itemsPerPage)) return;
    setCurrentPage(page);
  };

  const currentReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-between items-center px-4">
        <button
          onClick={() => handlePagination(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-4 hover:bg-indigo-600 disabled:bg-gray-400"
        >
          Prev
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <button
          onClick={() => handlePagination(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-4 hover:bg-indigo-600 disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    );
  };

  const TextWithShowMore = ({ text, maxLength = 50 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const truncatedText = text.slice(0, maxLength);

    const handleToggle = () => {
      setIsExpanded(prevState => !prevState);
    };

    return (
      <div>
        <p>{isExpanded ? text : truncatedText}</p>
        <button onClick={handleToggle} className="text-blue-500 hover:text-blue-700">
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      </div>
    );
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await ReportServices.deleteReviewReport(reportId);
      setReports(reports.filter(report => report._id !== reportId));
      setSuccessMessage("Report deleted successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleEditReport = (report) => {
    setIsEditing(true);
    setCurrentReport(report);
  };

  const handleCloseEditForm = () => {
    setIsEditing(false);
    setCurrentReport(null);
  };

  return (
    <div className="space-y-2">
      {isEditing ? (
        <ReportForm
          onCancel={handleCloseEditForm}
          onSave={(updatedReport) => {
            setReports(reports.map(report => report._id === updatedReport._id ? updatedReport : report));
            handleCloseEditForm();
            setSuccessMessage("Report updated successfully!");
            setTimeout(() => setSuccessMessage(''), 3000);
          }}
          editEntity={currentReport}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 ml-6">
            <div className="flex flex-col space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Reports Management</h3>
              {successMessage && (
                <div className="text-green-400 text-sm font-medium ml-4">{successMessage}</div>
              )}
              <p className="text-sm text-gray-600 mt-1">
                A comprehensive list of all review reports, including their reason, category, and professor details.
              </p>
            </div>
          </div>

          <div className="mb-6 ml-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find by email address"
              className="sm:text-sm px-4 py-2 border rounded-full w-80 mb-4"
            />
          </div>

          <div className="mb-6 ml-4 flex space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="sm:text-sm px-4 py-2 border rounded-full w-80"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="sm:text-sm px-4 py-2 border rounded-full w-80"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="max-w-full">
            <div className="overflow-x-auto mt-5">
              <table className="w-full table-auto text-sm">
                <thead className="bg-white text-sm text-gray-700 font-thin">
                  <tr>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Reported By</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Professor Name</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Review</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Report Reason</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Category</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Status</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {currentReports.map((report) => {
                    const professorName = report.professorId
                      ? `${report.professorId.firstName} ${report.professorId.lastName}`
                      : "Unknown";

                    const reporterEmail = report.reporterId ? report.reporterId.email : "Unknown";
                    const reviewText = report.professorId && report.professorId.reviews?.[0]?.text || "No review";

                    return (
                      <tr key={report._id} className="border-b">
                        <td className="px-6 py-4 text-gray-900 font-semibold">{reporterEmail}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{professorName}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">
                          <TextWithShowMore text={reviewText} />
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">
                          <TextWithShowMore text={report.reportReason} />
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">
                          {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </td>
                        <td className="px-6 py-4 flex items-center space-x-4">
                          <button
                            className="text-black hover:text-gray-800 text-sm"
                            onClick={() => handleEditReport(report)}
                          >
                            <AiOutlineEdit className="mr-1" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 text-sm"
                            onClick={() => handleDeleteReport(report._id)}
                          >
                            <AiOutlineDelete className="mr-2" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ManageReports;
