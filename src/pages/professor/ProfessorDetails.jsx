import { useEffect, useState } from "react"
import ProfessorServices from "../../../services/ProfessorServices"
import { useParams } from "react-router-dom"

const ProfessorDetails = () => {

  const [professor, setProfessor] = useState(null)
  const [department, setDepartment] = useState(null)
  const [course, setCourses] = useState([])
  const { id } = useParams()

  useEffect(() => {
    const fetchProfessor = async () => {
      const response = await ProfessorServices.getProfessor(id)
      console.log(response)
    }
    fetchProfessor()
  }, [])
  return (
    <>
      <h1>Hello</h1>
    </>
  )
}

export default ProfessorDetails