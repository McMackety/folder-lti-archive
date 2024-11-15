import React, { PropsWithChildren, useState } from "react"
import { Typography } from "@material-ui/core";
import { OutlineComponent, OutlineChild } from "../../types/generated";

export default function PdfFolderOutlineComponent({ component }: { component: OutlineComponent }) {

    function renderChild(child: OutlineChild) {
        return (
            <PdfFolderOutlineChild key={child.id} item={child} >
                {child.children?.map((v) => (
                    renderChild(v)
                ))}
            </PdfFolderOutlineChild>
        )
    }

    return (
        <div className="bordered" style={{ padding: "10px", marginBottom: "20px" }}>
            <Typography variant="h6">{component.title}</Typography>
            {component.children?.map((v) => (
                renderChild(v)
            ))}
        </div>
    )
}

function PdfFolderOutlineChild({ item, children }: PropsWithChildren<{ item: OutlineChild }>) {

    return (
        <div>
            <ul><li>
                <Typography>{item.title}</Typography>
            </li></ul>
            {item.requiresResponse && (
                <Typography style={{ marginLeft: "50px", whiteSpace: "pre-line" }}>{item.response}</Typography>
            )}
            <div style={{ marginLeft: "50px" }}>
                {children}
            </div>
        </div>
    )
}