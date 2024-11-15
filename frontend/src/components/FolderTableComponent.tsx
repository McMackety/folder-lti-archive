import React, { useState } from "react"
import { useApolloClient } from "@apollo/client";
import { Paper, TextField, Typography, useTheme } from "@material-ui/core";
import { SAVE_ASSIGNMENT } from "./FolderAssignment";
import { TableCell, TableCellInput, TableComponent } from "../../types/generated";

export default function FolderTableComponent({ component, editing, ltiId }: { component: TableComponent, editing: boolean, ltiId?: string }) {
    const aclient = useApolloClient()
    const [responses, setResponses] = useState(() => {
        const res: TableCellInput[] = []
        for (let row = 0; row < component.rows.length; row++) {
            for (let column = 0; column < component.columns.length; column++) {
                let existingCell: TableCell | null = null
                if (component.cells != null) {
                    for (const excell of component.cells) {
                        if (excell.row === row && excell.column === column) {
                            existingCell = excell
                        }
                    }
                }
                res.push({
                    row: row,
                    column: column,
                    response: existingCell?.response ?? ""
                })
            }
        }
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
                tableComponents: [{
                    id: component.id,
                    cells: responses
                }],
                outlineComponents: [],
            }
        }).then(() => setLastSaved(Date.now())).catch()
    }

    const onItemEdit = (row: number, column: number, response: string) => {
        const nres = [...responses]
        for (const cell of nres) {
            if (cell.row === row && cell.column === column) {
                cell.response = response
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
            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        <th></th>
                        {component.columns.map((c, i) => (
                            <th key={i}>{c}</th>
                        ))}
                    </tr>
                    {component.rows.map((r, ri) => (
                        <tr key={ri}>
                            <th>{r}</th>
                            {component.columns.map((c, ci) => (
                                <td key={ci}><FolderTableCell
                                    item={component.cells?.find((cell) => cell.row === ri && cell.column === ci)}
                                    responseState={responses.find((res) => res.row === ri && res.column === ci)}
                                    editing={editing}
                                    onEdit={(response: string) => onItemEdit(ri, ci, response)}
                                /></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Paper>
    )
}

let CHARACTER_LIMIT = 750;

function FolderTableCell({ item, responseState, editing, onEdit }: { item?: TableCell, responseState?: TableCellInput, editing: boolean, onEdit?: (response: string) => void }) {

    const theme = useTheme()

    return (
        <div>
            <TextField
                inputProps={{style: {color: theme.palette.type === "light" ? "black" : "white"}, maxLength: CHARACTER_LIMIT}}
                helperText={`${(responseState?.response ?? item?.response ?? "").length}/${CHARACTER_LIMIT}`}
                multiline
                rows={6}
                style={{ width: "100%", height: "100%" }}
                value={responseState?.response ?? item?.response ?? ""}
                disabled={!editing}
                onChange={(e) => onEdit && onEdit(e.target.value)}
                variant="outlined" />
        </div>
    )
}
