import React from "react"
import { useQuery } from "@apollo/client"
import { Button, Container, Typography } from "@material-ui/core"
import gql from "graphql-tag"
import { useParams } from "react-router"
import { Assignment } from "../../types/generated"
import ErrorMessage from "../components/ErrorMessage"
import FolderAssignment from "../components/FolderAssignment"
import { Link } from "react-router-dom"
import Topbar from "../components/Topbar"
import { UserProvidedProps } from "../components/UserProvider"

export const GET_ASSIGNMENT = gql`
query AssignmentQuery($litID: String!) {
  myAssignment(externalLtiID: $litID) {
    id
    name
    pages {
      id
      components {
        id
        title
        __typename
        ... on ListComponent {
          listItems {
            id
            title
            response
          }
        }

        ... on PictureComponent {
          pictures {
            id
            pictureStaticUrl
            pictureResponseUrl
            textResponse
            needsResponseText
          }
        }

        ... on TableComponent {
          rows
          columns
          cells {
            row
            column
            response
          }
        }

        ... on OutlineComponent {
          children {
            id
            title
            requiresResponse
            response
            children {
              id
              title
              requiresResponse
              response
              children {
                id
                title
                requiresResponse
                response
              }
            }
          }
        }
      }
    }
  }
}
`

export function AssignmentPage({ user, setDarkMode, isDarkMode }: UserProvidedProps) {
  const { ltiId } = useParams<{ ltiId: string }>()
  const { loading: assignmentLoading, error: assignmentError, data: assignmentData } = useQuery<{ myAssignment: Assignment }>(GET_ASSIGNMENT, {
    variables: {
      litID: ltiId
    }
  })


  if (assignmentError) {
    return (
      <ErrorMessage error={assignmentError.message} />
    )
  }

  return (
    <div>
      {user.role === "Instructor" && (
        <div style={{ backgroundColor: "Tomato", padding: "20px" }}>
          <Typography>
            You are viewing this folder as an Instructor.
          </Typography>
        </div>
      )}
      <Topbar username={user.name} setDarkMode={setDarkMode} isDarkMode={isDarkMode} >
        {assignmentData?.myAssignment.id && <Button style={{ marginRight: "20px" }} variant="contained" color="secondary" href={`https://pdf.oconnorfolder.nathankutzan.info/assignment/${assignmentData?.myAssignment.id}`} target="blank">Download PDF</Button>}
        <Button variant="contained" disabled={user.role === "Instructor"} color="secondary" component={Link} to={`/submit/${ltiId}`}>Submit Folder</Button>
      </Topbar>
      {!assignmentLoading && (
        <Container maxWidth="lg">
          <FolderAssignment assignment={assignmentData!!.myAssignment} ltiId={ltiId} editing={true} />
        </Container>
      )}
    </div>
  )
}
