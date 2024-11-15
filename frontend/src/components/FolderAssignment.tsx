import { AppBar, Box, Tab, Tabs, Typography } from "@material-ui/core";
import gql from "graphql-tag";
import React, { PropsWithChildren } from "react"
import { Assignment } from "../../types/generated";
import FolderPage from "./FolderPage";

export const SAVE_ASSIGNMENT = gql`
mutation SaveAssignment(
  $aid: String!
  $listComponents: [ListComponentInput!]!
  $pictureComponents: [PictureComponentInput!]!
  $tableComponents: [TableComponentInput!]!
  $outlineComponents: [OutlineComponentInput!]!
) {
  saveAssignment(
    externalLtiID: $aid
    data: {
      listComponents: $listComponents
      pictureComponents: $pictureComponents
      tableComponents: $tableComponents
      outlineComponents: $outlineComponents
    }
  ) {
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

export default function FolderAssignment({ assignment, editing, ltiId }: { assignment: Assignment, editing: boolean, ltiId?: string }) {
    const [currentPage, setCurrentPage] = React.useState(0);

    return (
        <div>
            <Typography variant="h3">{assignment.name}</Typography>
            <AppBar className="hideprint" position="static" color="secondary">
                <Tabs value={currentPage} variant="scrollable" scrollButtons="auto" onChange={(e, n) => setCurrentPage(n)}>
                    {assignment.pages?.map((v, i) => (
                        <Tab key={v.id} label={`Page ${i + 1}`} />
                    ))}
                </Tabs>
            </AppBar>

            {assignment.pages?.map((v, i) => (
                <TabPanel key={v.id} value={currentPage} index={i}>
                    <FolderPage page={v} editing={editing} ltiId={ltiId} />
                </TabPanel>
            ))}
        </div>
    )
}

function TabPanel(props: PropsWithChildren<{
    index: any,
    value: any,
}>) {
    const { children, value, index, ...other } = props;

    return (
        <div
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}