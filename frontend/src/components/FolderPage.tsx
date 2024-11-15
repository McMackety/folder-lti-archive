import { Paper } from "@material-ui/core"
import React from "react"
import { FolderComponent, ListComponent, OutlineComponent, Page, PictureComponent, TableComponent } from "../../types/generated"
import FolderListComponent from "./FolderListComponent"
import FolderOutlineComponent from "./FolderOutlineComponent"
import FolderPictureComponent from "./FolderPictureComponent"
import FolderTableComponent from "./FolderTableComponent"

export default function FolderPage({ page, editing, ltiId }: { page: Page, editing: boolean, ltiId?: string }) {
    return (
        <Paper elevation={2} style={{padding: "10px"}}>
            {page.components?.map((v) => (
                <RenderComponent key={v.id} component={v} editing={editing} ltiId={ltiId} />
            ))}
        </Paper>
    )
}

function RenderComponent({ component, editing, ltiId }: { component: FolderComponent, editing: boolean, ltiId?: string }) {

    const type: string = (component as any)["__typename"]

    if (type === "ListComponent") {
        return (
            <FolderListComponent component={component as ListComponent} editing={editing} ltiId={ltiId} />
        )
    }

    if (type === "OutlineComponent") {
        return (
            <FolderOutlineComponent component={component as OutlineComponent} editing={editing} ltiId={ltiId} />
        )
    }

    if (type === "TableComponent") {
        return (
            <FolderTableComponent component={component as TableComponent} editing={editing} ltiId={ltiId} />
        )
    }

    if (type === "PictureComponent") {
        return (
            <FolderPictureComponent component={component as PictureComponent} editing={editing} ltiId={ltiId} />
        )
    }

    return (
        <React.Fragment />
    )
}