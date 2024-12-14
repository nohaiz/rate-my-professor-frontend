import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";
import InstituteServices from "../../../services/InstituteServices";

const InstituteList = () => {
  const [institutes, setInstitutes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalInstitutes, setTotalInstitutes] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("name");

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await InstituteServices.indexInstitutes(currentPage, 10, query);
        if (response && Array.isArray(response.institutions)) {
          setInstitutes(response.institutions);
          setTotalInstitutes(response.totalInstitution);
        } else {
          setInstitutes([]);
        }
      } catch (error) {
        setInstitutes([]);
      }
    };

    fetchInstitutes();
  }, [query, currentPage]);

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "bg-lime-400";
    if (rating >= 3.5) return "bg-yellow-400";
    if (rating >= 2.5) return "bg-red-500";
    return "bg-gray-500";
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(totalInstitutes / 10)) return;
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalInstitutes / 10);

  return (
    <div className="py-10">
      <Searchbar submittedSearch={query} />
      <div className="max-w-8x1 mx-auto px-6 mt-8">
        <div className="space-y-8">
          {institutes.length > 0 ? (
            institutes.map((institution) => (
              <div
                key={institution._id}
                className="rounded-3xl bg-indigo-100 shadow-lg overflow-hidden p-6 hover:shadow-xl transition-all duration-300 max-w-3xl mx-auto"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between mi-2">
                    <div className="flex flex-col justify-center space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {institution.name}
                      </h3>
                      <p className="text-gray-600">{institution.location}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-1 text-center">
                      <p className="text-gray-600">Quality</p>
                      <div
                        className={`text-white font-semibold py-3 px-6 rounded-xl w-20 h-20 flex items-center justify-center text-xl ${getRatingColor(
                          Math.round(institution.averageRating)
                        )}`}
                      >
                        {Math.round(institution.averageRating)}
                      </div>
                      <p className="text-gray-500 text-sm">
                        ({institution.reviewCount} ratings)
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/institutions/${institution._id}`}
                    className="text-indigo-600 bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-8 hover:bg-indigo-600 ml-auto"
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
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 hover:bg-indigo-600 disabled:bg-gray-400 text-gray-500"
                >
                  Prev
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 hover:bg-indigo-600 disabled:bg-gray-400 text-gray-500"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstituteList;
