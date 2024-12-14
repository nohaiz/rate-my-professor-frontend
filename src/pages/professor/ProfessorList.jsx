import { useEffect, useState } from "react";
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';

import Searchbar from "../../components/Searchbar";
import ProfessorServices from "../../../services/ProfessorServices";
import ProfileService from "../../../services/ProfileService";

const ProfessorList = ({ user }) => {
  const [professors, setProfessors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProfessors, setTotalProfessors] = useState(0);
  const [bookmarkedProfessors, setBookmarkedProfessors] = useState([]);
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

  useEffect(() => {
    const userId = user.Id
    const fetchBookmarkedProfessors = async () => {
      try {
        const response = await ProfileService.getProfile(userId);

        setBookmarkedProfessors(response.bookMarkedProfessor);
      } catch (error) {
        console.error('Error fetching bookmarked professors:', error);
      }
    };

    fetchBookmarkedProfessors();
  }, [bookmarkedProfessors]);

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

  const handleBookmark = async (id) => {
    try {
      if (bookmarkedProfessors.some((professor) => professor._id === id)) {
        await ProfessorServices.removeProfessorFromBookmarks(id);
        setBookmarkedProfessors(prev => prev.filter(professorId => professorId !== id));
      } else {
        await ProfessorServices.addProfessorToBookmarks(id);
        setBookmarkedProfessors(prev => [...prev, id]);
      }
    } catch (error) {
      console.error(error);
    }
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
                className="rounded-3xl bg-indigo-100 shadow-lg overflow-hidden p-5 hover:shadow-xl transition-all duration-300 max-w-3xl mx-auto"
              >
                <div className="flex justify-end">
                  <button onClick={() => handleBookmark(professor._id)}>
                    {bookmarkedProfessors.some((professorObj) => professorObj._id === professor._id) ? (
                      <AiFillHeart className="text-red-500 text-xl" />
                    ) : (
                      <AiOutlineHeart className="text-gray-400 text-xl" />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-first">
                    <div className="flex flex-col items-center justify-center space-y-1 text-center">
                      <p className="text-gray-600">Quality</p>
                      <div
                        className={`text-white font-semibold py-3 px-6 rounded-xl w-20 h-20 flex items-center justify-center text-xl ${getRatingColor(
                          Math.round(professor.averageRating)
                        )}`}
                      >
                        {Math.round(professor.averageRating)}
                      </div>
                      <p className="text-gray-500 text-sm">({professor.reviewCount} ratings)</p>
                    </div>
                    <div className="flex flex-col justify-center space-y-1 ml-5 mt-3">
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
                  </div>
                  <div className="flex justify-between items-center">
                    <a
                      href={`/professors/${professor._id}`}
                      className="text-indigo-600 bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-8 hover:bg-indigo-600 ml-auto"
                    >
                      View Details
                    </a>
                  </div>
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

export default ProfessorList;
