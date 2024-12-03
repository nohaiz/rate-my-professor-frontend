import { useEffect, useState } from "react";
import Searchbar from "../../components/Searchbar";
import ProfessorServices from "../../../services/ProfessorServices";

const Professor = () => {
  const [professors, setProfessors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProfessors, setTotalProfessors] = useState(0);
  const query = new URLSearchParams(window.location.search).get("name");

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const response = await ProfessorServices.indexProfessors(currentPage, 10, query);
        if (response && Array.isArray(response.professorsData)) {
          setProfessors(response.professorsData);
          setTotalProfessors(response.totalProfessors);
        } else {
          setProfessors([]);
        }
      } catch (error) {
        setProfessors([]);
      }
    };

    fetchProfessors();
  }, [query, currentPage]);

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "bg-lime-400";
    if (rating >= 3.5) return "bg-yellow-400";
    if (rating >= 2.5) return "bg-red-500";
    return "bg-gray-500";
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(totalProfessors / 10)) return;
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalProfessors / 10);

  return (
    <div className="py-10">
      <Searchbar submittedSearch={query} />
      <div className="max-w-8x1 mx-auto px-6 mt-8">
        <div className="space-y-8">
          {professors.length > 0 ? (
            professors.map((professor) => (
              <div
                key={professor._id}
                className="rounded-3xl bg-indigo-100 shadow-lg overflow-hidden p-6 hover:shadow-xl transition-all duration-300 max-w-3xl mx-auto"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col justify-center space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {professor.firstName} {professor.lastName}
                      </h3>
                      <p className="text-gray-600">
                        {professor.institution ? professor.institution.name : "Unknown University"}
                      </p>
                      <p className="text-gray-600">
                        {professor.department ? professor.department.name : "Unknown Department"}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-1 text-center">
                      <div
                        className={`text-white font-semibold py-3 px-6 rounded-xl w-20 h-20 flex items-center justify-center text-xl ${getRatingColor(
                          Math.round(professor.averageRating)
                        )}`}
                      >
                        {Math.round(professor.averageRating)}
                      </div>
                      <p className="text-gray-500 text-sm">
                        ({professor.reviewCount} reviews)
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/professors/${professor._id}`}
                    className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))
          ) : (
            <></>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav aria-label="Page navigation" className="inline-flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md border bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md border bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  Prev
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md border bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md border bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  Last
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Professor;
