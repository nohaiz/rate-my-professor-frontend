import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import InstituteServices from "../../../services/InstituteServices";
import { useParams } from "react-router-dom";

const InstituteDetails = () => {
  const { id } = useParams();
  const [institute, setInstitute] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState("");

  useEffect(() => {
    const fetchInstitute = async () => {
      try {
        const response = await InstituteServices.getInstitute(id);
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
    setSelectedProfessor("");
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleProfessorChange = (event) => {
    setSelectedProfessor(event.target.value);
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

  const professors = selectedDepartment
    ? filteredDepartments.find(department => department.name === selectedDepartment)?.courses
      .flatMap(course => course.professors)
      .filter((value, index, self) =>
        index === self.findIndex((t) => (
          t._id === value._id
        )))
    : [];

  const filteredCoursesByProfessor = selectedProfessor
    ? filteredCourses.filter(course =>
      course.professors.some(professor =>
        professor._id === selectedProfessor
      )
    )
    : filteredCourses;

  return (
    <div className="flex flex-col items-start space-y-6 ml-8 mr-8 mt-8 mb-4">
      {institute && (
        <>
          <div className="flex justify-between items-start w-full">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{institute.name}</h3>
              <p className="text-sm text-gray-500">{institute.location}</p>
            </div>
          </div>

          <div className="w-full mb-8">
            <div className="mt-4 flex space-x-6">
              <div className="w-1/3">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Filter by Department:
                </label>
                <select
                  id="department"
                  className="mt-2 py-1 px-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
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
                <div className="w-1/3">
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                    Filter by Course:
                  </label>
                  <select
                    id="course"
                    className="mt-2 py-1 px-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
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

              {selectedDepartment && (
                <div className="w-1/3">
                  <label htmlFor="professor" className="block text-sm font-medium text-gray-700">
                    Filter by Professor:
                  </label>
                  <select
                    id="professor"
                    className="mt-2 py-1 px-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                    value={selectedProfessor}
                    onChange={handleProfessorChange}
                  >
                    <option value="">All Professors</option>
                    {professors.length > 0 ? (
                      professors.map(professor => (
                        <option key={professor._id} value={professor._id}>
                          {/* Make professor name a clickable link */}
                          <Link to={`/professors/${professor._id}`} className="text-indigo-600 hover:text-indigo-800">
                            {professor.firstName} {professor.lastName}
                          </Link>
                        </option>
                      ))
                    ) : (
                      <option value="">No Professors Available</option>
                    )}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col space-y-4 w-1/2">
            {filteredDepartments.length === 0 ? (
              <div className="text-center text-gray-600">No departments available.</div>
            ) : (
              filteredDepartments.map(department => (
                <div key={department._id} className="w-full p-4">
                  <div className="rounded-3xl bg-indigo-100 shadow-lg overflow-hidden p-5 py-6 hover:shadow-xl transition-all duration-300">
                    <h4 className="text-lg font-semibold text-gray-900">{department.name}</h4>
                    <ul className="mt-4 space-y-4">
                      {department.courses.length === 0 ? (
                        <div className="text-sm text-gray-600">No courses available.</div>
                      ) : (
                        department.courses
                          .filter(course => course.title.toLowerCase().includes(selectedCourse.toLowerCase()))
                          .map(course => (
                            <li key={course._id} className="text-sm text-gray-600">
                              {course.title} ({course.code}) - {course.credits} credits
                              <ul className="mt-2 text-xs text-gray-500">
                                {course.professors.length === 0 ? (
                                  <div className="text-xs text-gray-500">No professors available.</div>
                                ) : (
                                  course.professors
                                    .filter(professor => !selectedProfessor || professor._id === selectedProfessor)
                                    .map(professor => (
                                      <li key={professor._id}>
                                        {/* Make professor name a clickable link */}
                                        <Link to={`/professors/${professor._id}`} className="text-indigo-600 hover:text-indigo-800">
                                          Professor: {professor.firstName} {professor.lastName}
                                        </Link>
                                      </li>
                                    ))
                                )}
                              </ul>
                            </li>
                          ))
                      )}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {institute === null && (
        <div className="text-center text-gray-600">Institute not found.</div>
      )}
    </div>
  );
};

export default InstituteDetails;
