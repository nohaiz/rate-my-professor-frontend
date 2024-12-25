import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import ProfessorServices from "../../../../services/ProfessorServices";

const ReviewForm = ({ professorId, reviewId, review, onCancel, onSave }) => {
  const [newText, setNewText] = useState(review);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();

    if (newText.trim() === "") {
      setError("Review cannot be empty");
      return;
    }

    setIsSaving(true);
    setError(""); 

    try {
      await ProfessorServices.updateProfessorReview(professorId, reviewId, { text: newText });

      onSave(newText);
    } catch (err) {
      console.error(err);
      setError("Failed to update the review");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewText(review); 
    onCancel(); 
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Edit Review</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Modify your review below.
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="text-sm text-gray-900 hover:text-red-600 focus:outline-none absolute right-0"
        >
          <AiOutlineClose className="mr-6" />
        </button>
      </div>

      <div className="flex items-center justify-center">
        <form onSubmit={handleSave} className="w-full max-w-md space-y-4 p-4">
          <div className="space-y-5">
            <div className="flex flex-col space-y-2">
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                rows={4}
                className="sm:text-sm border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Edit your review"
              />
              {error && (
                <div className="text-xs font-medium text-red-500 mt-1">{error}</div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="py-2 px-6 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
