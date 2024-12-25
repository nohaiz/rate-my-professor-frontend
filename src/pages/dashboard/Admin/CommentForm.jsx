import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai"; 
import ProfessorServices from "../../../../services/ProfessorServices";

const CommentForm = ({ professorId, reviewId, comment, onCancel, onSave }) => {
  const [newText, setNewText] = useState(comment.text);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();

    if (newText.trim() === "") {
      setError("Comment cannot be empty");
      return;
    }

    setIsSaving(true);

    try {
      const response = await ProfessorServices.updateProfessorComment(professorId, reviewId, comment._id, { text: newText });
      onSave(newText, comment._id);
    } catch (err) {
      console.error(err);
      setError("Failed to update comment");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Edit Comment</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Modify your comment below.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-sm text-gray-900 hover:text-red-600 focus:outline-none absolute right-0"
          >
            <AiOutlineClose className="mr-6" />
          </button>
        </div>
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
                placeholder="Edit your comment"
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
    </>
  );
};

export default CommentForm;
