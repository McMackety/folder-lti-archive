import React from "react"
import { Typography } from "@material-ui/core";
import { TableCell, TableComponent } from "../../types/generated";

export default function PdfFolderTableComponent({ component }: { component: TableComponent }) {

    return (
        <div className="bordered" style={{ padding: "10px", marginBottom: "20px" }}>
            <Typography variant="h6">{component.title}</Typography>
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
                                <td key={ci}><PdfFolderTableCell item={component.cells?.find((cell) => cell.row === ri && cell.column === ci)} /></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function PdfFolderTableCell({ item }: { item?: TableCell }) {

    return (
        <Typography style={{ whiteSpace: "pre-line"}}>{item?.response}</Typography>
    )
}