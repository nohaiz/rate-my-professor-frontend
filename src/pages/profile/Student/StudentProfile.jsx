import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { AiOutlineEdit, AiOutlineDelete, AiOutlineClose } from "react-icons/ai"

import ProfileService from "../../../../services/ProfileService"
import StudentProfileForm from "./StudentProfileForm"

const StudentProfile = () => {
  const { id } = useParams()
  const [studentProfile, setStudentProfile] = useState(null)
  const [isProfileVisible, setProfileVisible] = useState(true)
  const [isProfileButtonDisabled, setProfileButtonDisabled] = useState(false)
  const [isRatingsButtonDisabled, setRatingsButtonDisabled] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await ProfileService.getProfile(id)
        setStudentProfile(response)
      } catch (error) {
        console.error(error)
      }
    }
    fetchStudentProfile()
  }, [id])

  const showProfile = () => {
    setProfileVisible(true)
    setProfileButtonDisabled(true)
    setRatingsButtonDisabled(false)
  }

  const showRatings = () => {
    setProfileVisible(false)
    setProfileButtonDisabled(false)
    setRatingsButtonDisabled(true)
  }

  const { studentAccount } = studentProfile || {}
  const { firstName, lastName, institution, fieldOfStudy, GPA } = studentAccount || {}

  const handleEdit = () => {
    setIsEditing(true)
  }
  const onCancel = () => {
    setIsEditing(false)
  }

  const handleDelete = () => {
    console.log("Delete profile clicked")
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex space-x-6 border-b border-gray-300 pb-2">
        <button
          onClick={showProfile}
          disabled={isProfileButtonDisabled}
          className={`${isProfileButtonDisabled ? "text-gray-500" : "text-gray-500"
            } py-2 px-4 text-sm font-medium transition duration-200 ease-in-out hover:text-gray-900 focus:outline-none ${isProfileVisible ? "border-b-2 border-indigo-500" : ""
            }`}
        >
          Student Profile
        </button>
        <button
          onClick={showRatings}
          disabled={isRatingsButtonDisabled}
          className={`${isRatingsButtonDisabled ? "text-gray-500" : "text-gray-500"
            } py-2 px-4 text-sm font-medium transition duration-200 ease-in-out hover:text-gray-900 focus:outline-none ${!isProfileVisible ? "border-b-2 border-indigo-500" : ""
            }`}
        >
          Ratings
        </button>
      </div>

      {studentAccount && (
        <>
          {isProfileVisible ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application.</p>
                </div>
                <div className="flex space-x-4">
                  {(!isEditing ?
                    <>
                      <button
                        onClick={handleEdit}
                        className="flex items-center text-sm text-gray-900 hover:text-indigo-600 focus:outline-none"
                      >
                        <AiOutlineEdit className="mr-2" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none"
                      >
                        <AiOutlineDelete className="mr-2" />
                      </button>
                    </>
                    :
                    <button
                      onClick={onCancel}
                      className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none"
                    >
                      <AiOutlineClose className="mr-2" />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <StudentProfileForm studentProfile={studentProfile} setStudentProfile={setStudentProfile} setIsEditing={setIsEditing} />
              ) :
                <>
                  <section>
                    <div className="grid grid-cols-1 sm:grid-cols-3">
                      <div className="text-sm font-medium text-gray-900">Full Name</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {firstName} {lastName}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Email Address</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {studentProfile.email}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Institution</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {institution.name || "Not Provided"}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Field of Study</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {fieldOfStudy || "Not Provided"}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">GPA</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {GPA || "Not Available"}
                      </div>
                    </div>
                  </section>
                </>}
            </div>
          ) : (
            <section className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900">Reviews</h3>
              <p className="text-sm text-gray-700">{studentProfile.review || "No reviews available"}</p>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default StudentProfile
