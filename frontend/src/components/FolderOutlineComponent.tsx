import React, { PropsWithChildren, useState } from "react"
import { useApolloClient } from "@apollo/client";
import { Paper, TextField, Typography, useTheme } from "@material-ui/core";
import { OutlineResponse, OutlineComponent, OutlineChild } from "../../types/generated";
import { SAVE_ASSIGNMENT } from "./FolderAssignment";

export default function FolderOutlineComponent({ component, editing, ltiId }: { component: OutlineComponent, editing: boolean, ltiId?: string }) {
    const aclient = useApolloClient()
    const [responses, setResponses] = useState(() => {
        const res: OutlineResponse[] = []
        function traverseChild(child: OutlineChild) {
            res.push({
                id: child.id,
                response: child.response ?? ""
            })
            child.children?.forEach(c => traverseChild(c))
        }
        component.children?.forEach(c => traverseChild(c))
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
                pictureComponents: [],
                tableComponents: [],
                outlineComponents: [{
                    id: component.id,
                    responses: responses
                }],
            }
        }).then(() => setLastSaved(Date.now())).catch()
    }

    const onItemEdit = (id: string, response: string) => {
        const nres = [...responses]
        for (const res of nres) {
            if (res.id === id) {
                res.response = response
            }
        }
        setResponses(nres)
        saveTimer && clearTimeout(saveTimer!!)
        setSaveTimer(setTimeout(save, 2000))
    }

    function renderChild(child: OutlineChild) {
        return (
            <FolderOutlineChild key={child.id} item={child} responseState={responses.find((r) => r.id === child.id)} editing={editing} onEdit={(response: string) => onItemEdit(child.id, response)}>
                {child.children?.map((v) => (
                    renderChild(v)
                ))}
            </FolderOutlineChild>
        )
    }

    return (
        <Paper style={{ padding: "10px", marginBottom: "20px" }}>
            <Typography variant="h6">{component.title}</Typography>
            {editing && <Typography variant="overline">{`Last Saved: ${new Intl.DateTimeFormat([], { timeStyle: 'medium' }).format(new Date(lastSaved))}`}</Typography>}
            {component.children?.map((v) => (
                renderChild(v)
            ))}
        </Paper>
    )
}

let CHARACTER_LIMIT = 1500;

function FolderOutlineChild({ item, responseState, editing, onEdit, children }: PropsWithChildren<{ item: OutlineChild, responseState?: OutlineResponse, editing: boolean, onEdit?: (response: string) => void }>) {

    const theme = useTheme()

    return (
        <div>
            <ul><li>
                <Typography>{item.title}</Typography>
            </li></ul>
            {item.requiresResponse && (
                <TextField
                    style={{ width: "95%", marginLeft: "30px" }}
                    inputProps={{style: {color: theme.palette.type === "light" ? "black" : "white"}, maxLength: CHARACTER_LIMIT}}
                    helperText={`${(responseState?.response ?? item.response ?? "").length}/${CHARACTER_LIMIT}`}
                    multiline
                    value={responseState?.response ?? item.response ?? ""}
                    disabled={!editing}
                    onChange={(e) => onEdit && onEdit(e.target.value)}
                    variant="outlined" />
            )}
            <div style={{ marginLeft: "50px" }}>
                {children}
            </div>
        </div>
    )
}
