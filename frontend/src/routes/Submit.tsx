import React from "react"
import { gql, useMutation, useQuery } from "@apollo/client"
import { Button, Container, Paper, Typography } from "@material-ui/core"
import { useParams } from "react-router"
import { Assignment } from "../../types/generated"
import ErrorMessage from "../components/ErrorMessage"
import FolderAssignment from "../components/FolderAssignment"
import { GET_ASSIGNMENT } from "./AssignmentPage"
import Topbar from "../components/Topbar"
import { Link } from "react-router-dom"
import { UserProvidedProps } from "../components/UserProvider"

const SUBMIT_ASSIGNMENT = gql`
mutation SubmitAssignment($ltiID: String!){
  submitAssignment(externalLtiID: $ltiID)
}
`

export function Submit({ user, setDarkMode, isDarkMode }: UserProvidedProps) {
  const { ltiId } = useParams<{ ltiId: string }>()
  const { loading: assignmentLoading, error: assignmentError, data: assignmentData } = useQuery<{ myAssignment: Assignment }>(GET_ASSIGNMENT, {
    variables: {
      litID: ltiId
    },
    fetchPolicy: "no-cache"
  })
  const [submitAssignment, { data: submitData }] = useMutation<{ submitAssignment: string }>(SUBMIT_ASSIGNMENT, {
    variables: {
      ltiID: ltiId
    }
  })

  if (assignmentError) {
    return (
      <ErrorMessage error={assignmentError.message} />
    )
  }

  if (submitData?.submitAssignment === "success") {
    return (
      <Container maxWidth="md">
      <div style={{marginTop: "50px", display: "flex", justifyContent: "center", flexDirection: "column", textAlign: "center"}}>
        <Typography variant="h2">Successfully submitted folder!</Typography>
        <Typography variant="h6">You can view your submission in <a href="https://pasco.instructure.com">myLearning</a> by going to the Grades page for the course and clicking on the folder assignment.</Typography>
      </div>
    </Container>
    )
  }

  return (
    <div>
      <Topbar username={user.name} setDarkMode={setDarkMode} isDarkMode={isDarkMode}>
        <Button variant="contained" color="secondary" component={Link} to={`/assignment/${ltiId}`}>Go Back</Button>
      </Topbar>
      <Container fixed>
        <Paper style={{ margin: "20px", padding: "20px" }}>
          <Typography variant="h5">Folder Submission</Typography>
          <Typography variant="subtitle1">Verify that the folder below has everything you wish to submit</Typography>
          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <Button variant="contained" color="secondary" component={Link} to={`/assignment/${ltiId}`}>Go Back</Button>
            <Button variant="contained" color="primary" onClick={() => submitAssignment()}>Submit</Button>
          </div>
        </Paper>
      </Container>
      {!assignmentLoading && (
        <Container maxWidth="lg">
          <FolderAssignment assignment={assignmentData!!.myAssignment} ltiId={ltiId} editing={false} />
        </Container>
      )}
    </div>
  )
}