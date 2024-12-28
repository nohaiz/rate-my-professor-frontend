import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineEdit, AiOutlineDelete, AiOutlineClose } from "react-icons/ai";

import ProfileService from "../../../../services/ProfileService";
import ProfessorProfileForm from "./ProfessorProfileForm";
import ProfessorServices from "../../../../services/ProfessorServices";
import SaveProfessors from "../../../components/SavedProfessors";
import CourseServices from "../../../../services/CourseServices";

const ProfessorProfile = ({ handleSignout, user }) => {
  const { id } = useParams();
  const [professorProfile, setProfessorProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [courses, setCourses] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [courseWithNoDept, setCourseWithNoDept] = useState([])
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const fetchProfessorProfile = async () => {
    try {
      const response = await ProfileService.getProfile(id);
      setProfessorProfile(response);
      if (response?.professorAccount?.institution?.departments) {
        const allCourses = response.professorAccount.institution.departments.reduce(
          (courses, dept) => [...courses, ...dept.courses],
          []
        );
        setCourses(allCourses);
      }
      const courseWithNoDep = await CourseServices.indexCourses();
      setCourseWithNoDept(courseWithNoDep.courses)
    } catch (error) {
      console.error("Error fetching professor profile:", error);
    }
  };

  useEffect(() => {
    fetchProfessorProfile();
  }, [id, isEditing]);

  const { professorAccount } = professorProfile || {};
  const { firstName, lastName, institution, bio } = professorAccount || {};

  const handleEdit = () => {
    setIsEditing(true);
  };

  const onCancel = () => {
    setIsEditing(false);
  };

  const handleRemoveCourse = async (courseId, DeptId) => {
    try {
      const response = await ProfessorServices.removeProfessorCourse(
        id,
        professorProfile.professorAccount.institution._id,
        DeptId,
        courseId
      );

      if (response.message) {
        const updatedCourses = courses.filter(c => c._id !== courseId);
        setCourses(updatedCourses);
        fetchProfessorProfile();
      }
    } catch (error) {
      console.error("Error removing professor's course:", error);
    }
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

  const handleEditComment = (reviewId, commentId) => {
    setProfessorProfile((prevProfile) => {
      const updatedReviews = prevProfile?.professorAccount?.reviews?.map((review) => {
        if (review._id !== reviewId) return review;

        const updatedComments = review?.comments?.map((comment) => {
          if (comment._id === commentId) {
            return { ...comment, isEditMode: !comment.isEditMode };
          }
          return comment;
        });

        return { ...review, comments: updatedComments };
      });

      return {
        ...prevProfile,
        professorAccount: {
          ...prevProfile.professorAccount,
          reviews: updatedReviews || []
        },
      };
    });
  };

  const handleSaveComment = async (reviewId, commentId, updatedCommentText) => {
    if (!updatedCommentText || updatedCommentText.length > 500) {
      setErrorMessage("Comment text is required and should be less than 500 characters.");
      return;
    }

    try {
      const updatedReviews = professorProfile?.professorAccount?.reviews?.map((review) => {
        if (review._id === reviewId) {
          const updatedComments = review.comments.map((comment) =>
            comment._id === commentId ? { ...comment, text: updatedCommentText, isEditMode: false } : comment
          );
          return { ...review, comments: updatedComments };
        }
        return review;
      });

      setProfessorProfile((prevProfile) => ({
        ...prevProfile,
        professorAccount: { ...prevProfile.professorAccount, reviews: updatedReviews },
      }));

      const professorId = professorProfile?.professorAccount?._id;

      if (professorId) {
        await ProfessorServices.updateProfessorComment(professorId, reviewId, commentId, { text: updatedCommentText });
      } else {
        setErrorMessage("Failed to find professorId for the review.");
      }

    } catch (error) {
      setErrorMessage("Failed to update comment.");
      console.error(error);
    }
  };

  const toggleComments = (reviewId) => {
    setProfessorProfile((prevProfile) => {

      const updatedReviews = prevProfile.professorAccount.reviews.map((review) => {
        if (review._id === reviewId) {
          return { ...review, showComments: !review.showComments };
        }
        return review;
      });
      const updatedProfile = {
        ...prevProfile,
        professorAccount: {
          ...prevProfile.professorAccount,
          reviews: updatedReviews,
        },
      };
      return updatedProfile;
    });
  };


  const handleDeleteComment = async (reviewId, commentId) => {
    try {
      setSuccessMessage("Comment deleted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setProfessorProfile((prevProfile) => {
        const updatedReviews = prevProfile.professorAccount.reviews.map((review) => {
          if (review._id === reviewId) {
            const updatedComments = review.comments.filter(comment => comment._id !== commentId);

            return {
              ...review,
              comments: updatedComments,
            };
          }
          return review;
        });

        return {
          ...prevProfile,
          professorAccount: {
            ...prevProfile.professorAccount,
            reviews: updatedReviews,
          },
        };
      });

      const professorId = professorProfile?.professorAccount?._id;
      if (professorId) {
        await ProfessorServices.removeProfessorComment(professorId, reviewId, commentId);
      }

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
            {tab === "profile" && "Professor Profile"}
            {tab === "savedProfessors" && "Saved Professors"}
            {tab === "ratings" && "Ratings"}
          </button>
        ))}
      </div>

      {professorProfile && (
        <>
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Professor Information</h3>
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
                <ProfessorProfileForm
                  professorProfile={professorProfile}
                  setProfessorProfile={setProfessorProfile}
                  setIsEditing={setIsEditing}
                  courses={courses}
                  fetchProfessorProfile={fetchProfessorProfile}
                />
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
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {professorProfile.email}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Institution</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {institution?.name || "Empty"}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Departments</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {institution?.departments?.length > 0 ? (
                          institution.departments.map((dept, deptIdx) => (
                            <div key={deptIdx} className="mb-2">
                              <div className="font-medium">{dept.name}</div>
                              <div className="text-sm text-gray-600 mb-2 mt-2">
                                {dept.courses?.length ? (
                                  <div className="flex flex-col space-y-2">
                                    {dept.courses.map((course, courseIdx) => (
                                      <div key={courseIdx} className="flex items-center space-x-2">
                                        <div className="text-sm text-gray-700">
                                          {course.title} ({course.code})
                                        </div>
                                        <button
                                          onClick={() => handleRemoveCourse(course._id, dept._id)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <AiOutlineDelete />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  "No courses available"
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          "Empty"
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900"></div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {courseWithNoDept
                          .filter((course) => {
                            return !courses.some((assignedCourse) => assignedCourse._id === course._id);
                          })
                          .map((course, indx) => {
                            if (course.professors.some(professor => professor._id === professorProfile.professorAccount._id)) {
                              return (
                                <>
                                  <div className="font-medium">
                                    Unassigned Department
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2 mt-2">
                                    <div className="flex items-center space-x-2">
                                      <div key={indx} className="text-sm text-gray-600">
                                        {course.title} ({course.code})
                                      </div>
                                      <button
                                        onClick={() => handleRemoveCourse(course._id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <AiOutlineDelete />
                                      </button>
                                    </div>
                                  </div>
                                </>
                              );
                            }
                            return null;
                          })}
                      </div>
                    </div>


                    <div className="py-3 sm:grid sm:grid-cols-3 sm:px-0 mt-1">
                      <dt className="text-sm font-medium text-gray-900">Biography</dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                        <div
                          className="w-full sm:text-sm border border-gray-200 p-3 rounded-md bg-gray-10 text-gray-700 min-h-[150px] break-words"
                          style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                        >
                          {bio || "Tell us about yourself..."}
                        </div>
                      </dd>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === "savedProfessors" && (
            <section className="space-y-6">
              <SaveProfessors professorProfile={professorProfile} setProfessorProfile={setProfessorProfile} setActiveTab={setActiveTab} />
            </section>
          )}

          {activeTab === "ratings" && (
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex">Professor Reviews
                  {!successMessage && (
                    <div className="text-green-400 text-sm font-medium ml-4 flex justify-center items-center">
                      {successMessage}
                    </div>
                  )}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Below are all the reviews about you, along with the comments you have added.</p>
              </div>
              {professorProfile.professorAccount.reviews && professorProfile.professorAccount.reviews.length > 0 ? (
                professorProfile.professorAccount.reviews.map((review) => (
                  <div key={review._id}>
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm font-semibold text-gray-900 mt-2">
                        <p>Feedback Provided By: {review.studentId.firstName} {review.studentId.lastName}</p>
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
                            {review.showComments && review.comments && review.comments.length > 0 ? (
                              <div className="ml-2 mt-3">
                                {review.comments
                                  .filter((comment) => comment.userId === user.Id)
                                  .map((comment) => (
                                    <div key={comment._id} className="mt-4">
                                      {comment.isEditMode ? (
                                        <form
                                          onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSaveComment(review._id, comment._id, e.target.text.value);
                                          }}
                                        >
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
                                          <button type="submit" className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-full flex ml-auto">
                                            Save
                                          </button>
                                        </form>
                                      ) : (
                                        <>
                                          <div className="text-sm text-gray-700">
                                            <div className="border-b border-gray-800 pb-1 mb-4">
                                              {comment.text}
                                            </div>
                                            <div className="flex mt-2">
                                              <button
                                                onClick={() => handleEditComment(review._id, comment._id)}
                                                className="ml-2 flex items-center text-xs text-gray-900 hover:text-indigo-600 focus:outline-none"
                                              >
                                                Edit <AiOutlineEdit className="mr-1" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteComment(review._id, comment._id)}
                                                className="ml-2 flex items-center text-red-600 text-xs hover:text-red-800"
                                              >
                                                Delete <AiOutlineDelete className="mr-1" />
                                              </button>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            ) :
                              review.showComments && review.comments.length === 0 ? (
                                <p className="text-sm text-gray-500">No comments available</p>
                              ) : null}
                          </div>

                        </div>
                      </div>
                    </>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No reviews available</p>
              )}
            </section>
          )}
        </>
      )
      }
    </div >
  );
};

export default ProfessorProfile;
