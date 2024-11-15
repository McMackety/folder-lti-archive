import { Typography } from "@material-ui/core";
import React from "react"
import { ListComponent, ListItem } from "../../types/generated";

export default function PdfFolderListComponent({ component }: { component: ListComponent }) {

    return (
        <div className="bordered" style={{ padding: "10px", marginBottom: "20px" }}>
            <Typography variant="h6">{component.title}</Typography>
            {component.listItems?.map((v, i) => (
                <PdfFolderListItem key={v.id} item={v} />
            ))}
        </div>
    )
}

function PdfFolderListItem({ item }: { item: ListItem }) {

    return (
        <div>
            <ul><li>
                <Typography>{item.title}</Typography>
            </li></ul>
            <Typography style={{ marginLeft: "60px", whiteSpace: "pre-line"}}>{item.response}</Typography>
        </div>
    )
}