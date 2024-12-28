import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InstituteServices from "../../../services/InstituteServices";
import { useParams } from "react-router-dom";

const InstituteDetails = () => {
  const { id } = useParams();
  const [institute, setInstitute] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [professors, setProfessors] = useState([]);
  const [showProfessors, setShowProfessors] = useState(false);

  useEffect(() => {
    const fetchInstitute = async () => {
      try {
        const response = await InstituteServices.getInstitute(id);

        const professorData = response.institute.departments
          .map(dept => dept.courses)
          .flat()
          .map(course => course.professors)
          .flat();

        const uniqueProfessors = professorData.filter((professor, index, self) =>
          index === self.findIndex((t) => (
            t._id === professor._id
          ))
        );

        setProfessors(uniqueProfessors);
        setInstitute(response.institute);
        setDepartments(response.institute.departments);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInstitute();
  }, [id]);

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
    setSelectedCourse("");
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleToggleProfessors = () => {
    setShowProfessors((prev) => !prev);
  };

  const handleClearFilters = () => {
    setSelectedDepartment("");
    setSelectedCourse("");
  };

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(selectedDepartment.toLowerCase())
  );

  const filteredCourses = (selectedDepartment
    ? filteredDepartments.find(department => department.name === selectedDepartment)?.courses
    : []
  ).filter(course =>
    course.title.toLowerCase().includes(selectedCourse.toLowerCase())
  );

  return (
    <div className="flex flex-col items-start space-y-6 ml-8 mr-8 mt-8 mb-4">
      {institute && (
        <>
          <div className="flex justify-between items-start w-full">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{institute.name}</h3>
              <p className="mt-1 text-sm text-gray-900 font-semibold">{institute.location}</p>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                <button onClick={handleToggleProfessors} className="text-blue-500 hover:underline">
                  {showProfessors ? "Hide Professors" : "View Professors"}
                </button>
              </p>
            </div>
          </div>

          {showProfessors ? (
            <div className="w-full">
              {professors.length === 0 ? (
                <div className="flex items-center justify-center mt-4 text-sm text-red-500">No professors available.</div>
              ) : (
                professors.map((professor) => (
                  <div key={professor._id} className="p-4">
                    <div className="rounded-3xl bg-gray-100 shadow-lg overflow-hidden p-5 hover:shadow-xl transition-all duration-300 max-w-3xl">
                      <h4 className="text-lg font-bold text-gray-900">
                        {professor.firstName} {professor.lastName}
                      </h4>

                      <div className="mt-4 text-sm text-gray-600">
                        <h5 className="text-gray-900 font-bold mb-1">Departments:</h5>
                        <div className="pl-5 space-y-1 mt-2">
                          {departments.filter(department =>
                            department.courses.some(course =>
                              course.professors.some(prof => prof._id === professor._id)
                            )
                          ).map(department => (
                            <div key={department._id} className="text-sm text-gray-600">
                              {department.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-gray-600">
                        <h5 className="text-gray-900 font-bold mb-1">Courses:</h5>
                        <div className="pl-5 space-y-1 mt-2">
                          {departments
                            .flatMap(department => department.courses)
                            .filter(course =>
                              course.professors.some(prof => prof._id === professor._id)
                            )
                            .map(course => (
                              <div key={course._id} className="text-sm text-gray-600">
                                {course.title}
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Link
                          to={`/professors/${professor._id}`}
                          className="text-indigo-600 bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-8 hover:bg-indigo-600 ml-auto"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
            : (
              <>
                <div className="w-full mb-8">
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="w-full sm:w-1/4">
                      <label htmlFor="department" className="block sm:text-sm font-medium text-gray-700 mb-2">
                        Filter by Department:
                      </label>
                      <select
                        id="department"
                        className="sm:text-sm px-3 py-2 border border-gray-300 rounded-md w-full"
                        value={selectedDepartment}
                        onChange={handleDepartmentChange}
                      >
                        <option value="">All Departments</option>
                        {departments.map(department => (
                          <option key={department._id} value={department.name}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedDepartment && (
                      <div className="w-full sm:w-1/4">
                        <label htmlFor="course" className="block sm:text-sm font-medium text-gray-700 mb-2">
                          Filter by Course:
                        </label>
                        <select
                          id="course"
                          className="sm:text-sm px-3 py-2 border border-gray-300 rounded-md w-full"
                          value={selectedCourse}
                          onChange={handleCourseChange}
                        >
                          <option value="">All Courses</option>
                          {filteredDepartments
                            .find(department => department.name === selectedDepartment)
                            ?.courses.length > 0 ? (
                            filteredDepartments
                              .find(department => department.name === selectedDepartment)
                              ?.courses.map(course => (
                                <option key={course._id} value={course.title}>
                                  {course.title || 'No Courses'}
                                </option>
                              ))
                          ) : (
                            <option value="">No Courses Available</option>
                          )}
                        </select>
                      </div>
                    )}

                    <div className="w-full sm:w-auto mt-4 sm:mt-0 flex items-end">
                      <button
                        onClick={handleClearFilters}
                        className="text-indigo-600 bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-8 hover:bg-indigo-600 w-full sm:w-auto"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {filteredDepartments.length === 0 ? (
                    <div className="text-sm text-red-500">No departments available.</div>
                  ) : (
                    filteredDepartments.map(department => (
                      <div key={department._id} className="w-full p-4 flex flex-col">
                        <div className="rounded-3xl bg-gray-100 shadow-lg overflow-hidden p-5 py-6 hover:shadow-xl transition-all duration-300 flex-1">
                          <h4 className="text-lg font-bold text-gray-900">{department.name}</h4>
                          <div className="space-y-2">
                            {department.courses.length === 0 ? (
                              <div className="text-sm text-red-500">No courses available.</div>
                            ) : (
                              department.courses
                                .filter(course => course.title.toLowerCase().includes(selectedCourse.toLowerCase()))
                                .map(course => (
                                  <div key={course._id} className="text-sm text-gray-600 mt-3">
                                    <div className="text-gray-900 font-bold mb-1">
                                      {course.code}
                                    </div>
                                    {course.title}
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </>
            )}
        </>
      )}

      {institute === null && (
        <div className="text-center text-gray-600">Institute not found.</div>
      )}
    </div>
  );
};

export default InstituteDetails;
