import { useState, useEffect } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useRef } from 'react';

import InstituteServices from "../../../../services/InstituteServices";
import DepartmentService from "../../../../services/DepartmentService";
import CourseServices from "../../../../services/CourseServices";

import InstituteForm from "./InstitueForm";
import DepartmentForm from "./DepartmentForm";
import CourseForm from "./CourseForm";

const ManageAcademics = () => {
  const [entities, setEntities] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [filteredEntities, setFilteredEntities] = useState([]); // State for filtered entities
  const [entityType, setEntityType] = useState("Institute");
  const [entityMaxItems, setEntityMaxItems] = useState({}); // Track maxItems for each entity
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
  const [showForm, setShowForm] = useState(false)
  const [deptList, setDeptList] = useState([])
  const [courseList, setCourseList] = useState([])
  const [editEntity, setEditEntity] = useState(null)
  const hasScrolled = useRef(false); // Track if the scroll has been triggered

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        let response;
        if (entityType === "Institute") {
          response = await InstituteServices.indexInstitutes();
          setEntities(response.institutions);
        } else if (entityType === "Department") {
          response = await DepartmentService.indexDepartments();
          setEntities(response.departments);
        } else if (entityType === "Course") {
          response = await CourseServices.indexCourses();
          setEntities(response.courses);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchEntities();
  }, [entityType]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await DepartmentService.indexDepartments();
        setDeptList(response.departments);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await CourseServices.indexCourses()
        setCourseList(response.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (successMessage && !hasScrolled.current) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      hasScrolled.current = true;
    }
  }, [successMessage]);

  const handleDeleteEntity = async (entityId) => {
    try {
      let response;
      if (entityType === "Institute") {
        response = await InstituteServices.deleteInstitute(entityId);
      } else if (entityType === "Department") {
        response = await DepartmentService.deleteDepartment(entityId);
      } else if (entityType === "Course") {
        response = await CourseServices.deleteCourse(entityId);
      }
      setSuccessMessage(`${entityType} successfully deleted!`);

      setEntities((prevEntities) => prevEntities.filter((entity) => entity._id !== entityId));

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };
  const handleCreateClick = () => {
    setShowForm(true);
  };
  const handleCancelForm = () => {
    setShowForm(false);
  };
  const handleSaveEntity = (newEntity) => {
    console.log(newEntity)
    if (editEntity) {
      console.log(newEntity, 2)
      setEntities((prevEntities) =>
        prevEntities.map((entity) =>
          entity._id === newEntity._id ? newEntity : entity
        )
      );
      setEditEntity(null)
    } else {
      console.log(newEntity, 3)
      setEntities((prevEntities) => [newEntity, ...prevEntities]);
    }
    setShowForm(false);
  };


  const handleEditEntity = (entity) => {
    setEditEntity(entity)
    setShowForm(true);
  }


  // Filter entities based on the search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEntities(entities); // Show all entities if no search query
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = entities.filter((entity) => {
        if (entityType === "Institute") {
          return entity.name.toLowerCase().includes(lowercasedQuery);
        } else if (entityType === "Department") {
          return entity.name.toLowerCase().includes(lowercasedQuery);
        } else if (entityType === "Course") {
          // For courses, check the title and possibly other fields like code
          return (
            entity.title.toLowerCase().includes(lowercasedQuery) ||
            (entity.code && entity.code.toLowerCase().includes(lowercasedQuery))
          );
        }
        return false;
      });
      setFilteredEntities(filtered);
    }
  }, [searchQuery, entities, entityType]);

  // Handle the search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Change the entity view (Institute, Department, Course)
  const changeEntityView = (type) => {
    setEntityType(type);
    setSearchQuery(""); // Reset the search when changing entity view
    setEntityMaxItems({}); // Reset maxItems for all entities
  };

  // Handle Show More / Show Less for each entity
  const handleShowMoreLess = (entityId, entityType) => {
    setEntityMaxItems((prevMaxItems) => {
      const currentMax = prevMaxItems[entityId] || 3; // Default to 3 if no value is set
      const entity = entities.find((e) => e._id === entityId); // Find the specific entity
      const newMax = currentMax === 3 ? (entityType === "Department" ? entity.departments.length : entity.courses.length) : 3;

      return {
        ...prevMaxItems,
        [entityId]: newMax,
      };
    });
  };

  // Render details based on the entity type
  // Modify renderDetailsColumn to handle empty departments or courses
  const renderDetailsColumn = (entity) => {
    const maxItems = entityMaxItems[entity._id] || 3; // Default to 3 if not set for this entity

    if (entityType === "Institute") {
      if (entity.departments && entity.departments.length > 0) {
        return (
          <div>
            {entity.departments.slice(0, maxItems).map((dept) => (
              <div key={dept._id} className="mb-2">{dept.name}</div>
            ))}
            {entity.departments.length > 3 && (
              <button
                onClick={() => handleShowMoreLess(entity._id, "Department")}
                className="text-blue-500 mt-2"
              >
                {maxItems === 3 ? "Show More" : "Show Less"}
              </button>
            )}
          </div>
        );
      } else {
        return <span>No associated departments</span>;
      }
    } else if (entityType === "Department") {
      if (entity.courses && entity.courses.length > 0) {
        return (
          <div>
            {entity.courses.slice(0, maxItems).map((course) => (
              <div key={course._id} className="mb-2">{course.title}</div>
            ))}
            {entity.courses.length > 3 && (
              <button
                onClick={() => handleShowMoreLess(entity._id, "Course")}
                className="text-blue-500 mt-2"
              >
                {maxItems === 3 ? "Show More" : "Show Less"}
              </button>
            )}
          </div>
        );
      } else {
        return <span>No associated courses</span>;
      }
    } else if (entityType === "Course") {
      return (
        <div>
          <span>Code: {entity.code}</span><br />
          <span>Credits: {entity.credits}</span>
        </div>
      );
    }
    return <span>-</span>;
  };


  return (
    <>
      {showForm ?
        <>
          {entityType === "Institute" && <InstituteForm onCancel={handleCancelForm} onSave={handleSaveEntity} deptList={deptList} editEntity={editEntity} />}
          {entityType === "Department" && <DepartmentForm onCancel={handleCancelForm} onSave={handleSaveEntity} courseList={courseList} editEntity={editEntity} />}
          {entityType === "Course" && <CourseForm onCancel={handleCancelForm} onSave={handleSaveEntity} editEntity={editEntity}/>}
        </> :
        (
          <div className="space-y-5">
            <div className="flex justify-between items-center mb-6 ml-6">
              <div className="flex flex-col space-y-2">
                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                  Manage Academics
                  {successMessage && (
                    <div className=" text-green-400 text-sm font-medium ml-4 flex justify-center items-center">
                      {successMessage}
                    </div>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and view Institutes, Departments, and Courses.
                </p>
              </div>
              <button
                onClick={handleCreateClick}
                className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 hover:bg-indigo-600"
              >
                Create {entityType}
              </button>
            </div>

            {/* Search Box */}
            <div className="mb-6 ml-4">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={`Search ${entityType}s...`}
                className="sm:text-sm/6 px-4 py-2 border rounded-full w-80"
              />
            </div>

            <div className="flex flex-wrap gap-2 ml-4">
              <button
                onClick={() => changeEntityView("Institute")}
                className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-4 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-900"
              >
                Institutes
              </button>
              <button
                onClick={() => changeEntityView("Department")}
                className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-4 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-900"
              >
                Departments
              </button>
              <button
                onClick={() => changeEntityView("Course")}
                className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-900"
              >
                Courses
              </button>
            </div>
            <div className="overflow-x-auto mt-5">
              <table className="w-full table-auto text-sm">
                <thead className="bg-white text-sm text-gray-700 font-thin">
                  <tr>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">
                      {entityType === "Institute" ? "Institute Name" : entityType === "Department" ? "Department Name" : "Course Title"}
                    </th>
                    {entityType === "Institute" && (
                      <>
                        <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Location</th>
                        <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Institute Type</th>
                      </>
                    )}
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">
                      {entityType === "Institute" ? "Departments" : entityType === "Department" ? "Courses" : "Details"}
                    </th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="text-gray-700">
                  {filteredEntities.map((entity) => (
                    <tr key={entity._id} className="border-b">
                      <td className="px-6 py-4 text-gray-900 font-semibold">
                        {entityType === "Course" ? entity.title : entity.name}
                      </td>
                      {entityType === "Institute" && (
                        <>
                          <td className="px-6 py-4 text-gray-500 font-semibold">{entity.location}</td>
                          <td className="px-6 py-4 text-gray-500 font-semibold">{entity.type}</td>
                        </>
                      )}
                      <td className="px-6 py-4 text-gray-500 font-semibold">{renderDetailsColumn(entity)}</td>
                      <td className="px-6 py-4">
                        <button
                          className="text-black hover:text-gray-800 text-sm"
                          onClick={() => handleEditEntity(entity)}
                        >
                          <AiOutlineEdit className="mr-2" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 text-sm ml-4"
                          onClick={() => handleDeleteEntity(entity._id)}
                        >
                          <AiOutlineDelete className="mr-2" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        )}
    </>
  );
};

export default ManageAcademics;
