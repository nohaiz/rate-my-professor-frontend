// Original 

import { useState, useEffect, useRef } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

import InstituteServices from "../../../../services/InstituteServices";
import DepartmentService from "../../../../services/DepartmentService";
import CourseServices from "../../../../services/CourseServices";

import InstituteForm from "./InstitueForm";
import DepartmentForm from "./DepartmentForm";
import CourseForm from "./CourseForm";

const ManageAcademics = () => {
  const [entities, setEntities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntities, setFilteredEntities] = useState([]);
  const [entityType, setEntityType] = useState("Course");
  const [entityMaxItems, setEntityMaxItems] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deptList, setDeptList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [editEntity, setEditEntity] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const hasScrolled = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationVisible, setPaginationVisible] = useState(true)

  const [searchData, setSearchData] = useState([]);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        let response;
        if (entityType === "Institute") {
          response = await InstituteServices.indexInstitutes(currentPage, itemsPerPage);
          setEntities(response.institutions || []);
          setTotalPages(response.totalInstitution || 0)
        } else if (entityType === "Department") {
          response = await DepartmentService.indexDepartments(currentPage, itemsPerPage);
          setEntities(response.departments || []);
          setTotalPages(response.totalDepartments || 0)
        } else if (entityType === "Course") {
          response = await CourseServices.indexCourses(currentPage, itemsPerPage);
          setEntities(response.courses || []);
          setTotalPages(response.totalCourses || 0)
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchEntities();
  }, [entityType, currentPage]);


  useEffect(() => {
    const fetchEntities = async () => {
      try {
        let response;
        if (entityType === "Institute") {
          response = await InstituteServices.indexInstitutes();
          setSearchData(response.institutions || []);
        } else if (entityType === "Department") {
          response = await DepartmentService.indexDepartments();
          setSearchData(response.departments || []);
        } else if (entityType === "Course") {
          response = await CourseServices.indexCourses();
          setSearchData(response.courses || []);
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
        setDeptList(response.departments || []);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await CourseServices.indexCourses();
        setCourseList(response.courses || []);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchInstitutes = async () => {
      try {
        const responseInstitute = await InstituteServices.indexInstitutes();
        setInstitutes(responseInstitute.institutions || [])
      } catch (error) {
        console.error(error)
      }
    }
    fetchCourses();
    fetchDepartments();
    fetchInstitutes();
  }, [filteredEntities]);

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
    setEditEntity(null)
    setShowForm(false);
  };

  const handleEditEntity = (entity) => {
    setEditEntity(entity);
    setShowForm(true);
  };

  const disableCreateBtn = () => {
    if (entityType === "Institute" && deptList.length === 0) {
      return true;
    } else if (entityType === "Department" && courseList.length === 0) {
      return true;
    }
    return false;
  };

  const createButtonClass = () => {
    if (disableCreateBtn()) {
      return "bg-gray-400 text-gray-500 cursor-not-allowed";
    }
    return "bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer";
  };

  const handleSaveEntity = (newEntity) => {
    if (editEntity) {
      setEntities((prevEntities) =>
        prevEntities.map((entity) =>
          entity._id === newEntity._id ? newEntity : entity
        )
      );
      setEditEntity(null);
    } else {
      setEntities((prevEntities) => [newEntity, ...prevEntities]);
    }
    setShowForm(false);
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setPaginationVisible(true)
      setFilteredEntities(entities);
    } else {
      setPaginationVisible(false)
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = searchData.filter((entity) => {
        if (entityType === "Institute") {
          return entity.name.toLowerCase().includes(lowercasedQuery);
        } else if (entityType === "Department") {
          return entity.name.toLowerCase().includes(lowercasedQuery);
        } else if (entityType === "Course") {
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const changeEntityView = (type) => {
    setCurrentPage(1)
    setEntityType(type);
    setSearchQuery("");
    setEntityMaxItems({});
  };

  const handlePagination = (page) => {
    if (page < 1 || page > Math.ceil(totalPages / 10)) return;
    setCurrentPage(page);
  };

  const handleShowMoreLess = (entityId, type) => {
    setEntityMaxItems(prevState => {
      const updatedMaxItems = { ...prevState };
      const currentMaxItems = updatedMaxItems[entityId] || 3;
      updatedMaxItems[entityId] = currentMaxItems === 3 ? 10 : 3;
      return updatedMaxItems;
    });
  };

  const renderDetailsColumn = (entity) => {
    const maxItems = entityMaxItems[entity._id] || 3;

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
        return <span>Empty</span>;
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
        return <span>Empty</span>;
      }
    }
    return <span>Empty</span>;
  };

  return (
    <>
      {showForm ? (
        <>
          {entityType === "Institute" && <InstituteForm onCancel={handleCancelForm} onSave={handleSaveEntity} deptList={deptList} editEntity={editEntity} />}
          {entityType === "Department" && <DepartmentForm onCancel={handleCancelForm} onSave={handleSaveEntity} courseList={courseList} editEntity={editEntity} institutes={institutes} />}
          {entityType === "Course" && <CourseForm onCancel={handleCancelForm} onSave={handleSaveEntity} editEntity={editEntity} />}
        </>
      ) : (
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
              disabled={disableCreateBtn()}
              className={`${createButtonClass()} text-sm font-medium rounded-full py-2 px-6`}
            >
              Create {entityType}
            </button>
          </div>

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
              onClick={() => changeEntityView("Course")}
              className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-4 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-900"
            >
              Courses
            </button>
            <button
              onClick={() => changeEntityView("Department")}
              className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-4 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-900"
            >
              Departments
            </button>
            <button
              onClick={() => changeEntityView("Institute")}
              className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6  hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-900"
            >
              Institutes
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
                  {entityType === "Course" ?
                    (<>
                      <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Code</th>
                      <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Credits</th>
                    </>
                    )
                    :
                    (
                      <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">
                        {entityType === "Institute" ? "Departments" : entityType === "Department" ? "Courses" : "Details"}
                      </th>
                    )
                  }
                  {entityType === "Department" ?
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Institution</th>
                    :
                    <></>
                  }
                  <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {filteredEntities.map((entity) => (
                  <tr key={entity._id} className="border-b">
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {entity?.title || entity?.name}
                    </td>
                    {entityType === "Institute" && (
                      <>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{entity.location}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{entity.type}</td>
                      </>
                    )}
                    {entityType === "Course" ? (
                      <>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{entity.code}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{entity.credits}</td>
                      </>
                    )
                      :
                      <td className="px-6 py-4 text-gray-500 font-semibold">{renderDetailsColumn(entity)}</td>
                    }
                    {entityType === "Department" && (
                      <td className="px-6 py-4 text-gray-500 font-semibold">
                        {institutes
                          .filter((inst) =>
                            inst.departments &&
                            inst.departments.some((dept) => dept && dept._id === entity._id)
                          )
                          .map((inst) => (
                            <div key={inst._id}>
                              <span>{inst.name}</span>
                            </div>
                          ))}
                      </td>
                    )}
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
          {paginationVisible ?
            Math.ceil(totalPages / 10) > 1 ?
              <div className="flex justify-between items-center mt-4 px-4">
                <button
                  onClick={() => handlePagination(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-4 hover:bg-indigo-600 disabled:bg-gray-400 text-gray-500"
                >
                  Prev
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Page {currentPage} of {Math.ceil(totalPages / 10)}
                  </span>
                </div>
                <button
                  onClick={() => handlePagination(currentPage + 1)}
                  disabled={currentPage === Math.ceil(totalPages / 10)}
                  className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-4 hover:bg-indigo-600 disabled:bg-gray-400 text-gray-500"
                >
                  Next
                </button>
              </div>
              :
              <></>
            :
            <></>
          }
        </div>
      )}
    </>
  );
};

export default ManageAcademics;
