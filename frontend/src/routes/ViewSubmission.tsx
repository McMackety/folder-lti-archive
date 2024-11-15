import React from "react"
import { gql, useQuery } from "@apollo/client"
import { Container, Link } from "@material-ui/core"
import { useParams } from "react-router"
import { Assignment, Submission } from "../../types/generated"
import ErrorMessage from "../components/ErrorMessage"
import FolderAssignment from "../components/FolderAssignment"

const GET_SUBMISSION = gql`
query GetSubmission($id: ID!) {
  submission(id: $id) {
    id
    name
    pages {
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

export function ViewSubmission() {
  const { id } = useParams<{ id: string }>()
  const { loading: submissionLoading, error: submissionError, data: submissionData } = useQuery<{ submission: Submission }>(GET_SUBMISSION, {
    variables: {
      id: id
    }
  })

  if (submissionError) {
    return (
      <ErrorMessage error={submissionError.message} />
    )
  }

  if (!submissionLoading && submissionData?.submission == null) {
    return (
      <ErrorMessage error={"Submission not found"} />
    )
  }

  return (
    <div>
      {!submissionLoading && (
        <Container maxWidth="lg">
          <Link href={`https://pdf.oconnorfolder.nathankutzan.info/submission/${submissionData?.submission.id}`} target="blank">View the PDF</Link>
          <FolderAssignment assignment={submissionData!!.submission as Assignment} editing={false} />
        </Container>
      )}
    </div>
  )
}
