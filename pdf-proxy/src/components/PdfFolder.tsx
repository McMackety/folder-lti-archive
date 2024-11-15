import { Typography } from "@material-ui/core";
import React from "react"
import { Assignment } from "../../types/generated";
import PdfFolderPage from "./PdfFolderPage";

export default function PdfFolder({ assignment }: { assignment: Assignment }) {

    return (
        <div>
            <Typography variant="h3">{assignment.name}</Typography>

            {assignment.pages?.map((v, i) => (
                <PdfFolderPage key={v.id} page={v} />
            ))}
        </div>
    )
}