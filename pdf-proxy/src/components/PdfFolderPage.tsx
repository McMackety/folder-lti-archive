import React from "react"
import { FolderComponent, ListComponent, OutlineComponent, Page, PictureComponent, TableComponent } from "../../types/generated"
import PdfFolderListComponent from "./PdfFolderListComponent"
import PdfFolderOutlineComponent from "./PdfFolderOutlineComponent"
import PdfFolderPictureComponent from "./PdfFolderPictureComponent"
import PdfFolderTableComponent from "./PdfFolderTableComponent"

export default function PdfFolderPage({ page }: { page: Page }) {
    return (
        <div className="bordered" style={{padding: "10px"}}>
            {page.components?.map((v) => (
                <RenderComponent key={v.id} component={v} />
            ))}
        </div>
    )
}

function RenderComponent({ component }: { component: FolderComponent }) {

    const type: string = (component as any)["__typename"]

    if (type === "ListComponent") {
        return (
            <PdfFolderListComponent component={component as ListComponent} />
        )
    }

    if (type === "OutlineComponent") {
        return (
            <PdfFolderOutlineComponent component={component as OutlineComponent} />
        )
    }

    if (type === "TableComponent") {
        return (
            <PdfFolderTableComponent component={component as TableComponent} />
        )
    }

    if (type === "PictureComponent") {
        return (
            <PdfFolderPictureComponent component={component as PictureComponent} />
        )
    }

    return (
        <React.Fragment />
    )
}