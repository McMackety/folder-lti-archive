import { useApolloClient, useQuery } from "@apollo/client";
import { Button, Container, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@material-ui/core";
import gql from "graphql-tag";
import React, { useState } from "react";
import { useParams } from "react-router";
import { Folder } from "../../types/generated";
import ErrorMessage from "./ErrorMessage";

export const LIST_FOLDERS = gql`
query {
	folders {
    fid
    name
  }
}
`

export const CURRENT_FOLDER = gql`
query Folder($externalLtiID: String!) {
	currentFolderID(externalLtiID: $externalLtiID)
}
`

export const PICK_FOLDER = gql`
mutation PickFolder($externalLtiID: String!, $folderID: ID!) {
	pickFolderForAssignment(externalLtiID: $externalLtiID, folderID: $folderID)
}
`

export default function FolderPicker({ children }: React.PropsWithChildren<{}>) {
  const { ltiId } = useParams<{ ltiId: string }>()
  const aclient = useApolloClient()
  const { error: folderError, data: folderData } = useQuery<{ folders: Folder[] }>(LIST_FOLDERS)
  const { data: currentFolderData, error: currentFolderIdError, refetch: refetchCurrentFolder } = useQuery<{ currentFolderID: string }>(CURRENT_FOLDER, {
    variables: {
      externalLtiID: ltiId
    }
  })

  const [currentFolder, setCurrentFolder] = useState("")

  if (currentFolderData?.currentFolderID != null) {
    return (<>{children}</>)
  }
  if (folderData == null) {
    return (<></>)
  }

  const onSave = () => {
    aclient.mutate({
      mutation: PICK_FOLDER,
      variables: {
        externalLtiID: ltiId,
        folderID: currentFolder
      }
    }).then(() => refetchCurrentFolder()).catch()
  }

  if (folderError) {
    return (
      <ErrorMessage error={folderError.message} />
    )
  }
  if (currentFolderIdError) {
    return (
      <ErrorMessage error={currentFolderIdError.message} />
    )
  }

  return (
    <Container fixed style={{marginTop: "50px"}}>
      <FormControl>
        <FormLabel>Pick the Folder for this Assignment:</FormLabel>
        <RadioGroup value={currentFolder} onChange={(e) => setCurrentFolder(e.target.value)}>
          {folderData?.folders.map((folder) => (
            <FormControlLabel key={folder.fid} value={folder.fid} control={<Radio />} label={folder.name} />
          ))}
        </RadioGroup>
        <Button disabled={currentFolder === ""} variant="contained" color="primary" onClick={onSave}>Save</Button>
      </FormControl>
    </Container>
  )
}