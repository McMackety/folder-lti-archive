import { useApolloClient } from "@apollo/client";
import { Paper, TextField, Typography, useTheme } from "@material-ui/core";
import React, { useState } from "react"
import { ListComponent, ListItem, ListItemInput } from "../../types/generated";
import { SAVE_ASSIGNMENT } from "./FolderAssignment";

export default function FolderListComponent({ component, editing, ltiId }: { component: ListComponent, editing: boolean, ltiId?: string }) {
    const aclient = useApolloClient()
    const [responses, setResponses] = useState(() => {
        const res: ListItemInput[] = []
        component.listItems?.forEach((li) => {
            res.push({
                id: li.id,
                response: li.response ?? ""
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
                listComponents: [{
                    id: component.id,
                    listItems: responses
                }],
                pictureComponents: [],
                tableComponents: [],
                outlineComponents: [],
            }
        }).then(() => setLastSaved(Date.now())).catch()
    }

    const onItemEdit = (index: number, response: string) => {
        const nres = [...responses]
        nres[index].response = response
        setResponses(nres)
        saveTimer && clearTimeout(saveTimer!!)
        setSaveTimer(setTimeout(save, 2000))
    }

    return (
        <Paper style={{ padding: "10px", marginBottom: "20px" }}>
            <Typography variant="h6">{component.title}</Typography>
            {editing && <Typography variant="overline">{`Last Saved: ${new Intl.DateTimeFormat([], { timeStyle: 'medium' }).format(new Date(lastSaved))}`}</Typography>}
            {component.listItems?.map((v, i) => (
                <FolderListItem key={v.id} item={v} responseState={responses[i]} editing={editing} onEdit={(response: string) => onItemEdit(i, response)} />
            ))}
        </Paper>
    )
}

let CHARACTER_LIMIT = 1500;

function FolderListItem({ item, responseState, editing, onEdit }: { item: ListItem, responseState?: ListItemInput, editing: boolean, onEdit?: (response: string) => void }) {

    const theme = useTheme()

    return (
        <div>
            <ul><li>
                <Typography>{item.title}</Typography>
            </li></ul>
            <TextField
                style={{width: "calc(100% - 50px)", marginLeft: "30px"}}
                inputProps={{style: {color: theme.palette.type === "light" ? "black" : "white"}, maxLength: CHARACTER_LIMIT}}
                helperText={`${(responseState?.response ?? item.response ?? "").length}/${CHARACTER_LIMIT}`}
                multiline
                value={responseState?.response ?? item.response ?? ""}
                disabled={!editing}
                onChange={(e) => onEdit && onEdit(e.target.value)}
                variant="outlined" />
        </div>
    )
}
