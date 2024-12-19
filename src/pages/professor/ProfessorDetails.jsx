import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ProfessorServices from "../../../services/ProfessorServices";

const ProfessorDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [professor, setProfessor] = useState({});
  const [department, setDepartment] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [comments, setComments] = useState({});
  const [commentError, setCommentError] = useState("");
  const [visibleReviews, setVisibleReviews] = useState({});
  const { state } = useLocation();
  const { refreshPage, resetBtn } = state || {};

  useEffect(() => {
    const fetchProfessor = async () => {
      const response = await ProfessorServices.getProfessor(id);
      if (response) {
        setProfessor(response.professor);
        setDepartment(response.department);
        setCourses(response.course);
        setFilteredCourses(response.course);
      }
    };
    if (resetBtn) {
      setIsButtonDisabled(false);
    }
    fetchProfessor();
  }, [id, refreshPage]);

  const handleCourseFilter = (event) => {
    const selectedCourseId = event.target.value;
    setSelectedCourse(selectedCourseId);

    if (selectedCourseId) {
      const filtered = courses.filter(course => course._id === selectedCourseId);
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  };

  const handleCreateReview = () => {
    setIsButtonDisabled(true);
    navigate("review");
  };

  const handleViewInstitution = (institutionId) => {
    console.log(institutionId)
    navigate(`/institutions/${institutionId}`)
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "bg-lime-400";
    if (rating >= 3.5) return "bg-yellow-400";
    if (rating >= 2.5) return "bg-yellow-500";
    if (rating >= 1.0) return "bg-red-500";
    return "bg-gray-500";
  };

  const validateComment = (text) => {
    const regex = /^[\p{L}\p{N}\p{P}\s]+$/gu;
    if (text.length > 500) {
      return "Comment must be 500 characters or less.";
    }
    if (!regex.test(text)) {
      return "Comment contains invalid characters. Only letters, numbers, spaces, and certain punctuation are allowed.";
    }
    return "";
  };

  const handleAddComment = async (reviewId) => {
    const commentText = comments[reviewId];
    const validationError = validateComment(commentText);

    if (validationError) {
      setCommentError(validationError);
      return;
    }

    try {
      const response = await ProfessorServices.addProfessorComment(id, reviewId, commentText);

      if (response) {
        setProfessor((prevProfessor) => ({
          ...prevProfessor,
          reviews: prevProfessor.reviews.map((review) =>
            review._id === reviewId ? { ...review, comments: [...review.comments, commentText] } : review
          ),
        }));
        setComments((prevComments) => ({
          ...prevComments,
          [reviewId]: "",
        }));
        setCommentError("");
        setVisibleReviews((prevState) => ({
          ...prevState,
          [reviewId]: { ...prevState[reviewId], inputVisible: false },
        }));
      } else {
        console.error("Failed to add comment:", response?.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleCommentInput = (reviewId) => {
    setVisibleReviews((prevState) => ({
      ...prevState,
      [reviewId]: {
        ...prevState[reviewId],
        inputVisible: !prevState[reviewId]?.inputVisible,
      },
    }));
  };

  const toggleCommentsVisibility = (reviewId) => {
    setVisibleReviews((prevState) => ({
      ...prevState,
      [reviewId]: {
        ...prevState[reviewId],
        commentsVisible: !prevState[reviewId]?.commentsVisible,
      },
    }));
  };

  return (
    <>
      <div className="flex items-center justify-between mr-8 ml-8 mt-8 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            <span className="text-2xl font-bold text-gray-900">{professor.averageRating?.toFixed(2)}/5.00 </span>
            {professor.firstName} {professor.lastName}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            <button onClick={() => handleViewInstitution(professor.institution._id)}>View Institution</button>
          </p>
        </div>
        <div className="flex space-x-4">
          {user.role !== 'student' ? (
            <></>
          ) : (
            isButtonDisabled ?
              <></>
              :
              <button
                className="text-sm font-medium rounded-full py-2 px-6 mr-4 bg-indigo-500 text-white hover:bg-indigo-600"
                onClick={handleCreateReview}
              >
                Create Review
              </button>
          )}
        </div>
      </div >
      {professor.bio ? <div className="py-2 sm:grid sm:grid-cols-4 sm:px-0 ml-8">
        <dd className="text-sm text-gray-700 sm:col-span-2 sm:mt-0">
          <div className="w-full sm:text-sm text-gray-700 min-h-[150px] break-words hover:cursor-default">
            {professor.bio}
          </div>
        </dd>
      </div> : <></>}

      <Outlet />

      <h4 className="text-lg font-semibold text-gray-900 mb-4 ml-8">Reviews</h4>
      <div className="ml-8 mt-4 space-x-2 mb-6">
        <label htmlFor="courseSelect" className="text-sm font-semibold text-gray-700">Filter by Course:</label>
        <select
          id="courseSelect"
          value={selectedCourse}
          onChange={handleCourseFilter}
          className="mt-2 py-1 px-2 border border-gray-300 rounded-lg text-sm "
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      <div className="">
        {professor.reviews && professor.reviews.length > 0 ? (
          professor.reviews
            .filter((review) => {
              if (selectedCourse) {
                return review.courseId._id === selectedCourse;
              }
              return true;
            })
            .map((review) => (
              <div key={review._id} className="rounded-3xl bg-indigo-100 shadow-lg overflow-hidden p-5 py-6 hover:shadow-xl transition-all duration-300 max-w-3xl mx-auto ml-8 mb-8">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-center space-y-2">
                      <p className="text-gray-700">Quality</p>
                      <div
                        className={`text-white font-semibold py-3 px-6 rounded-xl w-20 h-20 flex items-center justify-center text-xl ${getRatingColor(Math.round(review.rating))}`}
                      >
                        {Math.round(review.rating)}
                      </div>
                    </div>

                    <div className="flex flex-col items-start space-y-2 ml-3">
                      <h3 className="font-semibold text-gray-800">{review.studentId.firstName} {review.studentId.lastName}</h3>
                      {review.courseId && (
                        <div className="font-bold text-gray-700">{review.courseId.code}</div>
                      )}
                      <p className="mt-2 text-sm text-gray-700">
                        {review.text.length > 500 ? `${review.text.slice(0, 500)}...` : review.text}
                      </p>
                    </div>
                  </div >

                  <p className="text-gray-600 text-sm font-semibold">{new Date(review.courseId.createdAt).toLocaleDateString()}</p>
                </div >

                <div className="mt-4">
                  {user && user.Id !== review.studentId._id && (
                    <div className="mt-4 space-y-4">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => toggleCommentsVisibility(review._id)}
                          className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold"
                        >
                          {visibleReviews[review._id]?.commentsVisible ? "Hide Comments" : "View All Comments"}
                        </button>
                        <button
                          onClick={() => toggleCommentInput(review._id)}
                          className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold"
                        >
                          {visibleReviews[review._id]?.inputVisible ? "Cancel" : "Add Comment"}
                        </button>
                      </div>

                      {visibleReviews[review._id]?.inputVisible && (
                        <div className="mt-4 space-y-4">
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="Add a comment"
                            rows="4"
                            value={comments[review._id] || ""}
                            onChange={(e) => setComments({ ...comments, [review._id]: e.target.value })}
                          />
                          {commentError && (
                            <p className="text-red-500 text-sm mt-2">{commentError}</p>
                          )}

                          <button
                            className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold"
                            onClick={() => handleAddComment(review._id)}
                          >
                            Add Comment
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {
                  visibleReviews[review._id]?.commentsVisible && review.comments && review.comments.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {review.comments.map((comment, index) => (
                        <div key={index} className="p-3 rounded-lg shadow-sm max-w-3xl mx-auto mb-4 border border-gray-500 bg-gray-50">
                          <div className="flex justify-between mb-2">
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className={`text-sm text-gray-700 leading-relaxed break-words ${comment.length > 500 ? "max-h-36 overflow-y-auto" : ""}`}>
                            {typeof comment === 'object' ? comment.text : comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div >
            ))
        ) : (
          <p className="text-sm text-gray-500 ml-8">No reviews available.</p>
        )}
      </div >
    </>
  );
};

export default ProfessorDetails;
