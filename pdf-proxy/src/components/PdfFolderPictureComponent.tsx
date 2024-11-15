import { Card, CardActions, CardContent, Typography } from "@material-ui/core";
import React from "react"
import { PictureComponent, PictureItem } from "../../types/generated";

export default function PdfFolderPictureComponent({ component }: { component: PictureComponent }) {

    return (
        <div className="bordered" style={{ padding: "10px", marginBottom: "20px", alignItems: "stretch" }}>
            <Typography variant="h6">{component.title}</Typography>
            <div style={{display: "flex"}}>
                {component.pictures?.map((v, i) => (
                    <PdfFolderPictureItem key={v.id} item={v} />
                ))}
            </div>
        </div>
    )
}

function PdfFolderPictureItem({ item }: { item: PictureItem }) {
    return (
        <div className="bordered" style={{ flex: "1", margin: "20px", display: "flex", flexDirection: "column" }}>

            <div>
                {(item.pictureResponseUrl) && (
                    <div style={{ width: "100%", textAlign: "center" }}>
                        <img alt="" style={{ objectFit: "contain", maxHeight: "400px", maxWidth: "300px" }} src={(item.pictureResponseUrl) as string} />
                    </div>
                )}
            </div>

            {item.needsResponseText && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <Typography style={{ margin: "10px", whiteSpace: "pre-line" }}>{item.textResponse}</Typography>
                </div>
            )}
        </div>
    )
}