import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";
import InstituteServices from "../../../services/InstituteServices";

const Institute = () => {
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

  useEffect(() => {
    const pageFromUrl = new URLSearchParams(location.search).get("page");
    const totalPages = Math.ceil(totalInstitutes / 10);
    let page = pageFromUrl ? Math.max(1, parseInt(pageFromUrl)) : 1;

    // Prevent the page from exceeding totalPages
    if (page > totalPages) {
      page = totalPages;
    }

    // Set the currentPage to the valid page
    setCurrentPage(page);

    // If the page in the URL is invalid, redirect to the last valid page
    if (page !== parseInt(pageFromUrl)) {
      navigate(`?page=${page}`);
    }
  }, [location.search, totalInstitutes, navigate]);

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "bg-lime-400";
    if (rating >= 3.5) return "bg-yellow-400";
    if (rating >= 2.5) return "bg-red-500";
    return "bg-gray-500";
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`?page=${page}`);
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
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col justify-center space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {institution.name}
                      </h3>
                      <p className="text-gray-600">{institution.location}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-1 text-center">
                      <div
                        className={`text-white font-semibold py-3 px-6 rounded-xl w-20 h-20 flex items-center justify-center text-xl ${getRatingColor(
                          Math.round(institution.averageRating)
                        )}`}
                      >
                        {Math.round(institution.averageRating)}
                      </div>
                      <p className="text-gray-500 text-sm">
                        ({institution.reviewCount} reviews)
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/institutions/${institution._id}`}
                    className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p>No institutions found</p>
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

export default Institute;
