import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import Select from "react-select";

import ReportServices from "../../../../services/ReportServices";

const ReportForm = ({ onCancel, onSave, editEntity }) => {
  const [reportReason, setReportReason] = useState(editEntity ? editEntity.reportReason : "");
  const [status, setStatus] = useState(editEntity ? editEntity.status : "pending");
  const [selectedCategory, setSelectedCategory] = useState(
    editEntity ? { value: editEntity.category, label: editEntity.category } : null
  );
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let isValid = true;
    const newErrors = {};

    if (reportReason.trim() === "") {
      isValid = false;
      newErrors.reportReason = "Please provide a report reason.";
    } else if (reportReason.length > 500) {
      isValid = false;
      newErrors.reportReason = "Report reason must not exceed 500 characters.";
    }

    if (!selectedCategory) {
      isValid = false;
      newErrors.category = "Please select a category.";
    }

    if (!status) {
      isValid = false;
      newErrors.status = "Please select a status.";
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    const reportData = {
      reportReason,
      status,
      category: selectedCategory.value,
    };

    try {
      let response;
      if (editEntity) {
        response = await ReportServices.updateReviewReport(editEntity._id, reportData);
      } else {

      }

      if (response && response.status === 500) {
        newErrors.generalError = "An error occurred. Please try again later.";
        setErrors(newErrors);
      } else {
        onSave(response.report);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (editEntity) {
      setReportReason(editEntity.reportReason);
      setStatus(editEntity.status);
      setSelectedCategory({ value: editEntity.category, label: editEntity.category });
    }
  }, [editEntity]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {editEntity ? "Edit Report" : "Create New Report"}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {editEntity
              ? "Modify the report details below."
              : "Fill in the details to create a new report in the system."}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-gray-900 hover:text-red-600 focus:outline-none absolute right-0"
        >
          <AiOutlineClose className="mr-6" />
        </button>
      </div>

      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-4">
          <div className="space-y-5">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-900">Report Reason</label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="sm:text-sm border border-gray-300 p-2 rounded-md min-h-[200px] focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.reportReason && (
                <div className="text-xs font-medium text-red-500 mt-1">{errors.reportReason}</div>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-900">Category</label>
              <Select
                name="category"
                options={[
                  { value: 'inappropriate-review', label: 'Inappropriate Review' },
                  { value: 'offensive-language', label: 'Offensive Language' },
                  { value: 'irrelevant-content', label: 'Irrelevant Content' },
                  { value: 'spam', label: 'Spam' },
                  { value: 'misleading-information', label: 'Misleading Information' },
                  { value: 'harassment', label: 'Harassment' },
                  { value: 'violates-guidelines', label: 'Violates Guidelines' },
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select category..."
              />
              {errors.category && (
                <div className="text-xs font-medium text-red-500 mt-1">{errors.category}</div>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-900">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="sm:text-sm border border-gray-300 p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              {errors.status && (
                <div className="text-xs font-medium text-red-500 mt-1">{errors.status}</div>
              )}
            </div>

            {errors.generalError && (
              <div className="text-xs font-medium text-red-500 mt-1">{errors.generalError}</div>
            )}

            <div className="flex justify-between mt-6">
              <button
                type="submit"
                className="py-2 px-6 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
