import { gql, useApolloClient } from "@apollo/client";
import { Button, Card, CardActions, CardContent, Paper, TextField, Typography, useTheme } from "@material-ui/core";
import React, { useRef, useState } from "react"
import { PictureComponent, PictureItem, PictureItemInput } from "../../types/generated";
import { SAVE_ASSIGNMENT } from "./FolderAssignment";

export default function FolderPictureComponent({ component, editing, ltiId }: { component: PictureComponent, editing: boolean, ltiId?: string }) {
    const aclient = useApolloClient()
    const [responses, setResponses] = useState(() => {
        const res: PictureItemInput[] = []
        component.pictures?.forEach((pic) => {
            res.push({
                id: pic.id,
                pictureResponseUrl: pic?.pictureResponseUrl ?? "",
                textResponse: pic?.textResponse ?? ""
            })
        })
        return res
    })

    const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null)
    const [lastSaved, setLastSaved] = useState(Date.now())

    const save = () => {
        if (ltiId == null) return
        aclient.mutate({
            mutation: SAVE_ASSIGNMENT,
            variables: {
                aid: ltiId,
                listComponents: [],
                pictureComponents: [{
                    id: component.id,
                    pictures: responses
                }],
                tableComponents: [],
                outlineComponents: [],
            }
        }).then(() => setLastSaved(Date.now())).catch()
    }

    const onItemEdit = (id: string, responseUrl: string | null, responseText: string | null) => {
        const nres = [...responses]
        for (const res of nres) {
            if (res.id === id) {
                res.pictureResponseUrl = responseUrl
                res.textResponse = responseText
            }
        }
        setResponses(nres)
        saveTimer && clearTimeout(saveTimer!!)
        setSaveTimer(setTimeout(save, 2000))
    }

    return (
        <Paper style={{ padding: "10px", marginBottom: "20px" }}>
            <Typography variant="h6">{component.title}</Typography>
            {editing && <Typography variant="overline">{`Last Saved: ${new Intl.DateTimeFormat([], { timeStyle: 'medium' }).format(new Date(lastSaved))}`}</Typography>}
            <div style={{ display: "flex", justifyContent: "space-evenly", flexWrap: "nowrap" }}>
                {component.pictures?.map((v, i) => (
                    <FolderPictureItem key={v.id} item={v} responseState={responses[i]} editing={editing} onEdit={(responseUrl: string | null, responseText: string | null) => onItemEdit(v.id, responseUrl, responseText)} />
                ))}
            </div>
        </Paper>
    )
}

const UPLOAD_IMAGE = gql`
mutation UploadImage($filename: String!, $base64data: String!){
  uploadImage(filename: $filename, base64data: $base64data)
}`

let CHARACTER_LIMIT = 1500;

function FolderPictureItem({ item, responseState, editing, onEdit }: { item: PictureItem, responseState?: PictureItemInput, editing: boolean, onEdit?: (responseUrl: string | null, responseText: string | null) => void }) {
    const aclient = useApolloClient()
    const fileRef = useRef<HTMLInputElement>(null)

    const theme = useTheme()

    const uploadPhoto = () => {
        if (fileRef.current == null) return
        if (fileRef.current.files == null) return
        if (fileRef.current.files.length < 1) return
        const reader = new FileReader()
        const file = fileRef.current.files[0]
        reader.addEventListener("load", function () {
            const imageString = reader.result
            aclient.mutate<{ uploadImage: string }, any>({
                mutation: UPLOAD_IMAGE,
                variables: {
                    filename: file.name,
                    base64data: imageString
                }
            }).then((result) => {
                onEdit && onEdit(result.data?.uploadImage as string | null, (responseState?.textResponse ?? item.textResponse) as string | null)
            }).catch()
        }, false)

        reader.readAsDataURL(file);
    }

    return (
        <Card style={{ flex: "1 1 0px", margin: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <input type="file" ref={fileRef} accept="image/*" style={{ display: "none" }} onChange={uploadPhoto} />


            <CardContent>
                {(responseState?.pictureResponseUrl ?? item.pictureResponseUrl) && (
                    <div style={{ width: "100%", textAlign: "center" }}>
                        <img alt="" style={{ objectFit: "contain", maxHeight: "400px", maxWidth: "100%" }} src={(responseState?.pictureResponseUrl ?? item.pictureResponseUrl) as string} />
                    </div>
                )}

                {editing && item.pictureStaticUrl == null && (
                    <Button variant="contained" style={{ marginBottom: "50px" }} onClick={() => fileRef.current?.click()}>Upload Image</Button>
                )}
            </CardContent>

            {item.needsResponseText && (
                <CardActions style={{display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
                    <TextField
                        style={{ width: "100%" }}
                        inputProps={{style: {color: theme.palette.type === "light" ? "black" : "white"}, maxLength: CHARACTER_LIMIT}}
                        helperText={`${(responseState?.textResponse ?? item.textResponse ?? "").length}/${CHARACTER_LIMIT}`}
                        multiline
                        value={responseState?.textResponse ?? item.textResponse ?? ""}
                        disabled={!editing}
                        onChange={(e) => onEdit && onEdit((responseState?.pictureResponseUrl ?? item.pictureResponseUrl) as string | null, e.target.value)}
                        variant="outlined" />
                </CardActions>
            )}
        </Card>
    )
}
