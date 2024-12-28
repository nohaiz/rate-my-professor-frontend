import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineStar, AiFillStar, AiOutlineClose } from "react-icons/ai";
import Select from "react-select";
import ProfessorServices from "../../../services/ProfessorServices";

const ProfessorReviewForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [textError, setTextError] = useState("");

  useEffect(() => {
    const fetchProfessorCourses = async () => {
      try {
        const response = await ProfessorServices.getProfessor(id);
        if (response && response.course && response.course.length > 0) {
          const mappedCourses = response.course.map((course) => ({
            value: course._id,
            label: `${course.title} (${course.code})`,
          }));
          setCourses(mappedCourses);
        } else {
          setError("No courses found for this professor.");
        }
      } catch (err) {
        setError("Failed to fetch courses.");
        console.error(err);
      }
    };

    fetchProfessorCourses();
  }, [id]);

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <div
            key={value}
            onClick={() => setRating(value)}
            style={{ cursor: "pointer" }}
            className="text-yellow-400"
          >
            {rating >= value ? (
              <AiFillStar className="w-6 h-6" />
            ) : (
              <AiOutlineStar className="w-6 h-6" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleCancel = () => {
    navigate(`/professors/${id}`, {
      state: { refreshPage: false, resetBtn: true },
    });
  };

  const validateText = () => {
    if (text.trim().length === 0) {
      setTextError("Review text cannot be empty.");
      return false;
    } else if (text.length > 500) {
      setTextError("Review text cannot exceed 500 characters.");
      return false;
    }
    const textPattern = /^[\w\s.,'’“-]+$/i;
    if (!textPattern.test(text)) {
      setTextError("Review contains invalid characters.");
      return false;
    }
    setTextError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || !text || !selectedCourse) {
      setError("Please fill in all fields.");
      return;
    }

    if (!validateText()) {
      return;
    }

    const formData = {
      rating,
      text,
      courseId: selectedCourse.value,
    };

    try {
      const response = await ProfessorServices.createProfessorReview(id, formData);

      if (response.error) {
        setError(response.error);
      } else {
        setSuccessMessage("Review submitted successfully!");
        setRating(0);
        setText("");
        setSelectedCourse(null);
        setError("");
        navigate(`/professors/${id}`, {
          state: { refreshPage: true, resetBtn: true },
        });
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("There was an error submitting your review.");
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      width: "300px",
    }),
    menu: (provided) => ({
      ...provided,
      width: "300px",
    }),
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl py-2 space-y-2 ml-8 mr-8">
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <button
            className="ml-auto text-sm text-gray-900 hover:text-red-600 focus:outline-none"
            onClick={handleCancel}
          >
            <AiOutlineClose />
          </button>
        </div>
        <label
          htmlFor="reviewText"
          className="text-sm font-semibold text-gray-900 flex justify-between items-center"
        >
          <span>Add Review</span>
          <div className="flex items-center">{renderStars(rating)}</div>
        </label>
        <textarea
          id="reviewText"
          placeholder="Write your review here..."
          rows="10"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 text-sm leading-tight text-gray-900"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        {textError && <div className="text-red-500 text-xs">{textError}</div>}
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold text-gray-900">Course</label>
        <Select
          name="course"
          options={courses}
          value={selectedCourse}
          onChange={setSelectedCourse}
          className="bg-white rounded-md text-sm"
          classNamePrefix="react-select"
          placeholder="Select a course..."
          styles={{
            ...customSelectStyles,
            placeholder: (provided) => ({
              ...provided,
              fontSize: '0.875rem',
            }),
          }}
        />

        {error && <div className="text-red-500 text-xs">{error}</div>}
      </div>

      {successMessage && (
        <div className="text-green-500 text-sm">{successMessage}</div>
      )}

      <div>
        <button
          type="submit"
          className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-1 hover:bg-indigo-600 flex items-end ml-auto"
        >
          Submit Review
        </button>
      </div>
    </form>
  );
};

export default ProfessorReviewForm;
