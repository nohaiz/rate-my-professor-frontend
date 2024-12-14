import { AiOutlineDelete, AiOutlineClose } from "react-icons/ai";
import ProfessorServices from "../../services/ProfessorServices";

const SaveProfessors = ({ studentProfile, professorProfile, setActiveTab, setStudentProfile, setProfessorProfile }) => {
  const handleDelete = async (professorId, isStudent) => {
    try {
      await ProfessorServices.removeProfessorFromBookmarks(professorId);
      if (isStudent) {
        setStudentProfile(prevProfile => ({
          ...prevProfile,
          bookMarkedProfessor: prevProfile.bookMarkedProfessor.filter(
            professor => professor._id !== professorId
          ),
        }));
      } else {
        setProfessorProfile(prevProfile => ({
          ...prevProfile,
          bookMarkedProfessor: prevProfile.bookMarkedProfessor.filter(
            student => student._id !== professorId
          ),
        }));
      }
    } catch (error) {
      console.error("Error removing professor from bookmarks:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Saved Professors</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Here are the professors you've saved to your bookmarks.</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none"
          >
            <AiOutlineClose className="mr-2" />
          </button>
        </div>
      </div>

      {studentProfile && studentProfile.bookMarkedProfessor?.length > 0 && (
        <div>
          <ul className="space-y-4">
            {studentProfile.bookMarkedProfessor.map((professor) => (
              <li key={professor._id} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{professor.firstName} {professor.lastName}</h4>
                    <p className="text-sm text-gray-500">{professor.institution?.name || "Institution not available"}</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleDelete(professor._id, true)}
                    className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none mr-5"
                  >
                    <AiOutlineDelete className="mr-2" />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {professorProfile && professorProfile.bookMarkedProfessor?.length > 0 && (
        <div>
          <ul className="space-y-4">
            {professorProfile.bookMarkedProfessor.map((student) => (
              <li key={student._id} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</h4>
                    <p className="text-sm text-gray-500">{student.institution?.name || "Institution not available"}</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleDelete(student._id, false)}
                    className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none mr-5"
                  >
                    <AiOutlineDelete className="mr-2" />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(!studentProfile || studentProfile.bookMarkedProfessor?.length === 0) &&
        (!professorProfile || professorProfile.bookMarkedProfessor?.length === 0) && (
          <p className="text-sm text-gray-500">You have no saved professors.</p>
        )}
    </div>
  );
};

export default SaveProfessors;
