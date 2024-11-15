import gql from "graphql-tag";

export const GET_ASSIGNMENT = gql`
query AssignmentQuery($id: ID!) {
  assignment(id: $id) {
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

export const GET_SUBMISSION = gql`
query GetSubmission($id: ID!) {
  submission(id: $id) {
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