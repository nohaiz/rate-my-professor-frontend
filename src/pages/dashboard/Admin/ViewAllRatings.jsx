import { useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import ProfessorServices from "../../../../services/ProfessorServices";
import ReviewForm from "./ReiviewForm";
import CommentForm from "./CommentForm";

const ViewAllRatings = ({ userRatingId, setIsViewAllRatingsVisible }) => {
  const [userType, setUserType] = useState();
  const [ratings, setRatings] = useState([]);
  const [filteredRatings, setFilteredRatings] = useState([]);
  const [error, setError] = useState(null);
  const [professor, setProfessor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [editingComment, setEditingComment] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  const [expandedReviews, setExpandedReviews] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    const fetchProfessorReviews = async () => {
      try {
        const response = await ProfessorServices.getProfessorReviews(userRatingId);
        if (response && response.reviews && response.reviews.length > 0) {
          setUserType(response.userType);
          setProfessor(response.userDetails);
          setRatings(response.reviews);

          const uniqueCourses = [
            ...new Set(response.reviews.map((rating) => rating.course.courseCode)),
          ];
          setCourses(uniqueCourses);
          setFilteredRatings(response.reviews);
        } else {
          setError("No reviews found for this professor.");
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to fetch reviews.");
      }
    };

    if (userRatingId) {
      fetchProfessorReviews();
    }
  }, [userRatingId]);

  const handleCourseFilterChange = (e) => {
    const selectedCourse = e.target.value;
    setSelectedCourse(selectedCourse);

    setFilteredRatings((prevRatings) => {
      return selectedCourse === ""
        ? ratings
        : ratings.filter((rating) => rating.course.courseCode === selectedCourse);
    });
  };

  const handleToggleReview = (reviewId) => {
    setExpandedReviews((prevState) => ({
      ...prevState,
      [reviewId]: !prevState[reviewId],
    }));
  };

  const handleToggleComment = (reviewId, commentIdx) => {
    setExpandedComments((prevState) => ({
      ...prevState,
      [reviewId]: {
        ...prevState[reviewId],
        [commentIdx]: !prevState[reviewId]?.[commentIdx],
      },
    }));
  };

  const handleDeleteComment = async (professorId, reviewId, commentId) => {
    try {
      await ProfessorServices.removeProfessorComment(professorId, reviewId, commentId);

      const updatedRatings = ratings.map((rating) => {
        if (rating.reviewId === reviewId) {
          const updatedComments = rating.comments.filter((comment) => comment._id !== commentId);
          return {
            ...rating,
            comments: updatedComments,
          };
        }
        return rating;
      });

      setRatings(updatedRatings);
      setFilteredRatings(updatedRatings);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = (professorId, reviewId, comment) => {
    setEditingComment({ professorId, reviewId, comment });
  };

  const handleEditReview = (professorId, reviewId, text) => {
    setEditingReview({ professorId, reviewId, text });
  };

  const handleDeleteReview = async (professorId, reviewId) => {
    try {
      await ProfessorServices.deleteProfessorReview(professorId, reviewId);
      const updatedRatings = ratings.filter((rating) => rating.reviewId !== reviewId);
      setRatings(updatedRatings);
      setFilteredRatings(updatedRatings);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleSaveEditedComment = (updatedCommentText, commentId) => {
    const updatedRatings = ratings.map((rating) => {
      if (rating.reviewId === editingComment.reviewId) {
        const updatedComments = rating.comments.map((comment) =>
          comment._id === commentId ? { ...comment, text: updatedCommentText } : comment
        );
        return { ...rating, comments: updatedComments };
      }
      return rating;
    });

    setRatings(updatedRatings);
    setFilteredRatings(updatedRatings);
    setEditingComment(null);
  };

  const handleSaveEditedReview = (updatedReviewText) => {
    const updatedRatings = ratings.map((rating) =>
      rating.reviewId === editingReview.reviewId ? { ...rating, text: updatedReviewText } : rating
    );

    setRatings(updatedRatings);
    setFilteredRatings(updatedRatings);
    setEditingReview(null);
  };

  const renderRatings = () => {
    if (error) {
      return (
        <tr>
          <td colSpan="6" className="px-6 py-4 text-center text-red-600">
            {error}
          </td>
        </tr>
      );
    }

    if (filteredRatings.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
            No reviews found for this professor.
          </td>
        </tr>
      );
    }
    return filteredRatings.map((rating) => {
      const professorName = rating?.professor?.firstName + " " + rating?.professor?.lastName;
      const studentName = rating?.student?.firstName + " " + rating?.student?.lastName;
      const comments = rating.comments || [];

      return (
        <tr key={rating.reviewId} className="border-b">
          <td className="px-6 py-4 text-gray-900 font-semibold">
            {userType !== 'professor' ? professorName : studentName}
          </td>
          <td className="px-6 py-4 text-gray-900 font-semibold">{rating.course.courseCode}</td>
          <td className="px-6 py-4 text-gray-500 max-w-xs">
            {rating.text.length > 90 ? (
              <>
                {expandedReviews[rating.reviewId] ? (
                  <div>{rating.text}</div>
                ) : (
                  <div>{rating.text.slice(0, 90)}...</div>
                )}
                <div className="flex mt-2 space-x-3">
                  <button
                    onClick={() => handleToggleReview(rating.reviewId)}
                    className="text-blue-500 text-sm"
                  >
                    {expandedReviews[rating.reviewId] ? "Read Less" : "Read More"}
                  </button>
                  <button
                    onClick={() => handleEditReview(userType === 'student' ? rating.professor._id : professor._id, rating.reviewId, rating.text)}
                    className="flex items-center hover:text-indigo-500"
                  >
                    Edit <AiOutlineEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(userType === 'student' ? rating.professor._id : professor._id, rating.reviewId)}
                    className="flex items-center hover:text-red-500"
                  >
                    Delete <AiOutlineDelete />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>{rating.text}</div>
                <div className="flex mt-2 space-x-3">
                  <button
                    onClick={() => handleEditReview(userType === 'student' ? rating.professor._id : professor._id, rating.reviewId, rating.text)}
                    className="flex items-center hover:text-indigo-500"
                  >
                    Edit <AiOutlineEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(userType === 'student' ? rating.professor._id : professor._id, rating.reviewId)}
                    className="flex items-center hover:text-red-500"
                  >
                    Delete <AiOutlineDelete />
                  </button>
                </div>
              </>
            )}
          </td>
          <td className="px-3 py-2 text-gray-500">{rating.rating}</td>
          <td className="px-3 py-2 text-gray-500">{new Date(rating.createdAt).toLocaleDateString()}</td>
          <td className="px-6 py-4 max-w-xs">
            {comments.length > 0 ? (
              <div
                className="space-y-2 overflow-y-auto"
                style={{
                  maxHeight: '200px',
                }}
              >
                {comments.map((comment, idx) => (
                  <div key={idx} className="pt-2">
                    <p className="text-sm text-gray-600 font-semibold">{comment.user.email}</p>
                    {comment.text.length > 90 ? (
                      <>
                        <p className="text-sm text-gray-500 max-w-xs">
                          {expandedComments[rating.reviewId]?.[idx] ? (
                            <div>{comment.text}</div>
                          ) : (
                            <div>{comment.text.slice(0, 90)}...</div>
                          )}
                        </p>
                        <div className="flex mt-2 space-x-3">
                          <button
                            onClick={() => handleToggleComment(rating.reviewId, idx)}
                            className="text-blue-500 text-sm"
                          >
                            {expandedComments[rating.reviewId]?.[idx] ? "Read Less" : "Read More"}
                          </button>
                          <button
                            onClick={() => handleEditComment(userType === 'student' ? rating.professor._id : professor._id, rating.reviewId, comment)}
                            className="flex items-center hover:text-indigo-500"
                          >
                            Edit <AiOutlineEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(userType === 'student' ? rating.professor._id : professor._id, rating.reviewId, comment._id)}
                            className="flex items-center hover:text-red-500"
                          >
                            Delete <AiOutlineDelete />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="">
                        <p className="text-sm text-gray-500">{comment.text}</p>
                        <div className="flex mt-2 space-x-3">
                          <button
                            onClick={() => handleEditComment(userType === 'student' ? rating.professor._id : professor._id, rating.reviewId, comment)}
                            className="flex items-center hover:text-indigo-500"
                          >
                            Edit <AiOutlineEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(userType === 'student' ? rating.professor._id : professor._id, rating.reviewId, comment._id)}
                            className="flex items-center hover:text-red-500"
                          >
                            Delete <AiOutlineDelete />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Empty</p>
            )}
          </td>
        </tr>
      );
    });
  };

  return (
    <>
      {editingReview ? (
        <ReviewForm
          professorId={editingReview.professorId}
          reviewId={editingReview.reviewId}
          review={editingReview.text}
          onCancel={() => setEditingReview(null)}
          onSave={handleSaveEditedReview}
        />
      ) : editingComment ? (
        <CommentForm
          professorId={editingComment.professorId}
          reviewId={editingComment.reviewId}
          comment={editingComment.comment}
          onCancel={() => setEditingComment(null)}
          onSave={handleSaveEditedComment}
        />
      ) : (
        <>
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 ml-6">
              <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{professor?.firstName} {professor?.lastName ? `${professor?.lastName}'s` : ""} Ratings</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {
                    !userType ? "There are no details to show at this time." :
                      userType === 'student'
                        ? "A detailed list of all ratings given by this student, including the professor's name, course details, and student's feedback."
                        : "A detailed list of all ratings given to the professor, including student's name, course details, and the student's feedback."
                  }
                </p>
                {professor && userType === 'professor' && (
                  <div>
                    <span className="mt-2 text-sm text-gray-900 font-semibold">
                      Average Rating: {professor.averageRating ? professor.averageRating.toFixed(1) : "N/A"} ({professor.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsViewAllRatingsVisible(false)}
                className="text-black hover:text-gray-800 text-sm"
              >
                <AiOutlineClose className="mr-2" />
              </button>
            </div>

            <div className="mb-4 ml-6">
              <select
                id="courseFilter"
                className="sm:text-sm px-4 py-2 border rounded-full w-80"
                value={selectedCourse}
                onChange={handleCourseFilterChange}
              >
                <option value="">All Courses</option>
                {courses.map((course, index) => (
                  <option key={index} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto mt-5">
              <table className="w-full table-auto text-sm">
                <thead className="bg-white text-sm text-gray-700 font-thin">
                  <tr>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">
                      {userType !== 'professor' ? 'Professor' : 'Student'}
                    </th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Course Code</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Review</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Rating</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Date</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Comments</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {renderRatings()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ViewAllRatings;
