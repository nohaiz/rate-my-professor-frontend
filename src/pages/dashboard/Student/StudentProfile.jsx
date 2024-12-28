import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AiOutlineEdit, AiOutlineDelete, AiOutlineClose } from "react-icons/ai";
import ProfileService from "../../../../services/ProfileService";
import StudentProfileForm from "./StudentProfileForm";
import SaveProfessors from "../../../components/SavedProfessors";
import ProfessorServices from "../../../../services/ProfessorServices";

const StudentProfile = ({ handleSignout, user }) => {
  const { id } = useParams();
  const [studentProfile, setStudentProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await ProfileService.getProfile(id);
        setStudentProfile(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudentProfile();
  }, [id, activeTab]);

  const { studentAccount } = studentProfile || {};
  const { firstName, lastName, institution, fieldOfStudy, GPA } = studentAccount || {};

  const handleEdit = () => {
    setIsEditing(true);
  };

  const onCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this profile?");
    if (confirmDelete) {
      try {
        await ProfileService.deleteProfile(id);
        alert("Profile deleted successfully.");
        handleSignout();
        navigate("/auth/sign-in");
      } catch (error) {
        console.error("Error deleting profile:", error);
        alert("There was an error deleting the profile.");
      }
    }
  };

  const handleDeleteReview = async (professorId, reviewId) => {
    try {
      const response = await ProfessorServices.deleteProfessorReview(professorId, reviewId);
      setSuccessMessage("Review deleted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setStudentProfile((prevProfile) => {
        const updatedReviews = prevProfile.studentAccount.reviews.filter(
          (review) => review._id !== reviewId
        );
        return {
          ...prevProfile,
          studentAccount: {
            ...prevProfile.studentAccount,
            reviews: updatedReviews,
          },
        };
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditReview = (reviewId) => {
    setErrorMessage("");
    setStudentProfile((prevProfile) => {
      const updatedReviews = prevProfile.studentAccount.reviews.map((review) => {
        if (review._id === reviewId) {
          return { ...review, isEditMode: !review.isEditMode };
        }
        return review;
      });
      return {
        ...prevProfile,
        studentAccount: {
          ...prevProfile.studentAccount,
          reviews: updatedReviews,
        },
      };
    });
  };

  const handleEditComment = (reviewId, commentId) => {
    setErrorMessage('')
    setStudentProfile((prevProfile) => {
      const updatedReviews = prevProfile.studentAccount.reviews.map((review) => {
        if (review._id === reviewId) {
          const updatedComments = review.professorId.reviews.map((profReview) => {
            if (profReview._id === reviewId) {
              const updatedProfComments = profReview.comments.map((comment) => {
                if (comment._id === commentId) {
                  return { ...comment, isEditMode: !comment.isEditMode };
                }
                return comment;
              });
              return {
                ...profReview,
                comments: updatedProfComments,
              };
            }
            return profReview;
          });

          return {
            ...review,
            professorId: {
              ...review.professorId,
              reviews: updatedComments,
            },
          };
        }
        return review;
      });

      return {
        ...prevProfile,
        studentAccount: {
          ...prevProfile.studentAccount,
          reviews: updatedReviews,
        },
      };
    });
  };

  const handleSaveComment = async (professorId, reviewId, commentId, updatedCommentText) => {
    if (!updatedCommentText || updatedCommentText.length > 500) {
      setErrorMessage("Comment text is required and should be less than 500 characters.");
      return;
    }

    try {
      const updatedComment = { text: updatedCommentText };

      await ProfessorServices.updateProfessorComment(professorId, reviewId, commentId, updatedComment);

      setStudentProfile((prevProfile) => {
        const updatedReviews = prevProfile.studentAccount.reviews.map((review) => {
          if (review._id === reviewId) {
            const updatedComments = review.professorId.reviews.map((profReview) => {
              if (profReview._id === reviewId) {
                const updatedProfComments = profReview.comments.map((comment) => {
                  if (comment._id === commentId) {
                    return { ...comment, text: updatedCommentText, isEditMode: false };
                  }
                  return comment;
                });
                return {
                  ...profReview,
                  comments: updatedProfComments,
                };
              }
              return profReview;
            });

            return {
              ...review,
              professorId: {
                ...review.professorId,
                reviews: updatedComments,
              },
            };
          }
          return review;
        });

        return {
          ...prevProfile,
          studentAccount: {
            ...prevProfile.studentAccount,
            reviews: updatedReviews,
          },
        };
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      setErrorMessage("Failed to update comment.");
    }
  };

  const handleSaveReview = async (reviewId, professorId, updatedReviewText, updatedRating) => {
    setErrorMessage("");
    if (!updatedReviewText) {
      setErrorMessage("Review text is required.");
      return;
    }

    if (updatedReviewText.length > 500) {
      setErrorMessage("Review text should be less than 500 characters.");
      return;
    }

    const rating = parseFloat(updatedRating);
    if (!updatedRating) {
      setErrorMessage("Rating is required.");
      return;
    }

    if (isNaN(rating) || rating < 0 || rating > 5) {
      setErrorMessage("Rating must be a number between 0 and 5.");
      return;
    }

    try {
      const updatedReview = { text: updatedReviewText, rating: updatedRating };
      await ProfessorServices.updateProfessorReview(professorId, reviewId, updatedReview);
      setStudentProfile((prevProfile) => {
        const updatedReviews = prevProfile.studentAccount.reviews.map((review) => {
          if (review._id === reviewId) {
            return { ...review, text: updatedReviewText, rating: updatedRating, isEditMode: false };
          }
          return review;
        });
        return {
          ...prevProfile,
          studentAccount: {
            ...prevProfile.studentAccount,
            reviews: updatedReviews,
          },
        };
      });
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const toggleComments = (reviewId) => {
    setStudentProfile((prevProfile) => {
      const updatedReviews = prevProfile.studentAccount.reviews.map((review) => {
        if (review._id === reviewId) {
          return { ...review, showComments: !review.showComments };
        }
        return review;
      });
      return {
        ...prevProfile,
        studentAccount: {
          ...prevProfile.studentAccount,
          reviews: updatedReviews,
        },
      };
    });
  };

  const handleDeleteComment = async (professorId, reviewId, commentId) => {
    try {
      const response = await ProfessorServices.removeProfessorComment(professorId, reviewId, commentId);

      setSuccessMessage("Comment deleted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setStudentProfile((prevProfile) => {
        const updatedReviews = prevProfile.studentAccount.reviews.map((review) => {
          if (review._id === reviewId) {
            const updatedComments = review.professorId.reviews.map((singleReview) => {
              if (singleReview._id === review._id) {
                return {
                  ...singleReview,
                  comments: singleReview.comments.filter(comment => comment._id !== commentId)
                };
              }
              return singleReview;
            });

            return {
              ...review,
              professorId: {
                ...review.professorId,
                reviews: updatedComments,
              },
            };
          }
          return review;
        });

        return {
          ...prevProfile,
          studentAccount: {
            ...prevProfile.studentAccount,
            reviews: updatedReviews,
          },
        };
      });

    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };


  return (
    <div className="p-6">
      <div className="mb-6 flex space-x-6 border-b border-gray-300 pb-2">
        {["profile", "savedProfessors", "ratings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${activeTab === tab
              ? "bg-indigo-500 text-white"
              : "bg-transparent text-gray-600"
              } rounded-full py-2 px-6 text-sm font-medium transition duration-200 ease-in-out hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            {tab === "profile" && "Student Profile"}
            {tab === "savedProfessors" && "Saved Professors"}
            {tab === "ratings" && "Ratings"}
          </button>
        ))}
      </div>


      {studentProfile && (
        <>
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details below.</p>
                </div>
                <div className="flex space-x-4">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={handleEdit}
                        className="flex items-center text-sm text-gray-900 hover:text-indigo-600 focus:outline-none"
                      >
                        <AiOutlineEdit className="mr-2" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none"
                      >
                        <AiOutlineDelete className="mr-2" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={onCancel}
                      className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none"
                    >
                      <AiOutlineClose className="mr-2" />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <StudentProfileForm studentProfile={studentProfile} setStudentProfile={setStudentProfile} setIsEditing={setIsEditing} />
              ) : (
                <>
                  <section>
                    <div className="grid grid-cols-1 sm:grid-cols-3">
                      <div className="text-sm font-medium text-gray-900">Full Name</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {firstName} {lastName}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Email Address</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">{studentProfile.email}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Institution</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">{institution?.name || "Empty"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Field of Study</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">{fieldOfStudy || "Empty"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">GPA</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">{GPA || "Empty"}</div>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === "savedProfessors" && (
            <section className="space-y-6">
              <SaveProfessors studentProfile={studentProfile} setStudentProfile={setStudentProfile} setActiveTab={setActiveTab} />
            </section>
          )}

          {activeTab === "ratings" && (
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex">Student Reviews
                  {!successMessage && (
                    <div className="text-green-400 text-sm font-medium ml-4 flex justify-center items-center">
                      {successMessage}
                    </div>
                  )}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Below are all the reviews you have written.</p>
              </div>

              {studentProfile.studentAccount.reviews && studentProfile.studentAccount.reviews.length > 0 ? (
                studentProfile.studentAccount.reviews.map((review) => (
                  <div key={review._id}>
                    <div className="flex items-baseline justify-between">
                      <div className="text-lg font-semibold text-gray-900 mt-2">
                        <p>{review.professorId.firstName} {review.professorId.lastName}</p>
                      </div>
                      <div className="flex">
                        <button
                          onClick={() => handleEditReview(review._id)}
                          className="flex items-center text-sm text-gray-900 hover:text-indigo-600 focus:outline-none"
                        >
                          {!review.isEditMode ? (
                            <>Edit Review <AiOutlineEdit className="mr-4" /></>
                          ) : (
                            <AiOutlineClose className="mr-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.professorId._id, review._id)}
                          className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none"
                        >
                          <AiOutlineDelete className="mr-2" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Course</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">{review.courseId.title}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Code</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">({review.courseId.code})</div>
                    </div>
                    {review.isEditMode ? (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveReview(review._id, review.professorId._id, e.target.text.value, e.target.rating.value);
                      }}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                          <div className="text-sm font-medium text-gray-900">Rating</div>
                          <input
                            name="rating"
                            defaultValue={review.rating}
                            type="text"
                            className="text-sm text-gray-700 sm:col-span-2 border border-gray-300 rounded-md p-2 w-2/3"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                          <div className="text-sm font-medium text-gray-900">Review</div>
                          <textarea
                            name="text"
                            defaultValue={review.text}
                            className="text-sm text-gray-700 sm:col-span-2 border border-gray-300 rounded-md p-2 w-3/4 h-32"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                          <div className="text-sm font-medium text-gray-900"></div>
                          {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
                        </div>
                        <button type="submit" className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-full flex ml-auto">Save</button>
                      </form>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                          <div className="text-sm font-medium text-gray-900">Rating</div>
                          <div className="text-sm text-gray-700 sm:col-span-2 ">{review.rating}</div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 mt-4 border-b border-gray-900 pb-5">
                          <div className="text-sm font-medium text-gray-900">Review</div>
                          <div className="text-sm text-gray-700 sm:col-span-2 w-3/4">{review.text}
                            <button
                              onClick={() => toggleComments(review._id)}
                              className="text-xs text-indigo-600 flex mt-2"
                            >
                              {review.showComments ? "Hide Comments" : "Show Comments"}
                            </button>
                            <div className={review.showComments ? "ml-2 mt-3" : ""}>
                              {review.showComments && review.professorId.reviews && review.professorId.reviews.length > 0 && review.professorId.reviews.map((singleReview) => (
                                singleReview._id === review._id ? (
                                  singleReview.comments && singleReview.comments.length > 0 ? (
                                    singleReview.comments
                                      .filter((comment) => comment.userId === user.Id)
                                      .map((comment) => (
                                        <div key={comment._id} className="mt-4">
                                          {comment.isEditMode ? (
                                            <form onSubmit={(e) => {
                                              e.preventDefault();
                                              handleSaveComment(review.professorId._id, review._id, comment._id, e.target.text.value);
                                            }}>
                                              <div className="flex flex-col items-start">
                                                <button
                                                  className="mb-2 ml-auto"
                                                  onClick={() => handleEditComment(review._id, comment._id)}
                                                >
                                                  {comment.isEditMode && <AiOutlineClose />}
                                                </button>

                                                <textarea
                                                  name="text"
                                                  defaultValue={comment.text}
                                                  className="text-sm text-gray-700 sm:col-span-2 border border-gray-300 rounded-md p-2 w-3/4 h-32"
                                                />
                                                {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

                                              </div>
                                              <button type="submit" className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-full flex ml-auto">Save</button>
                                            </form>
                                          ) : (
                                            <>
                                              <div className="text-sm text-gray-700">
                                                <div className="border-b border-gray-800 pb-1 mb-4">
                                                  {comment.text}
                                                </div>
                                                <div className="flex mt-3">
                                                  <button
                                                    onClick={() => handleEditComment(review._id, comment._id)}
                                                    className="ml-2 flex items-center text-xs text-gray-900 hover:text-indigo-600 focus:outline-none"
                                                  >
                                                    Edit <AiOutlineEdit className="mr-1" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteComment(review.professorId._id, review._id, comment._id)}
                                                    className="ml-2 flex items-center text-red-600 text-xs hover:text-red-800"
                                                  >
                                                    Delete<AiOutlineDelete className="mr-1" />
                                                  </button>
                                                </div>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      ))
                                  ) : (
                                    <p className="text-xs text-gray-600">No comments available for this review.</p>
                                  )
                                ) : null
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-700">No reviews available</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default StudentProfile;
