import React from "react"
import Container from '@material-ui/core/Container';
import { Typography } from "@material-ui/core";

const centerDivStyles: React.CSSProperties = {
    marginTop: "50px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center"
}

export default function Home() {
    return (
        <Container maxWidth="md">
            <div style={centerDivStyles}>
                <Typography variant="h1">Virtual Folder</Typography>
                <Typography variant="h4">Access your assignments from <a href="https://pasco.instructure.com">myLearning</a> to work on your folder!</Typography>
            </div>
        </Container>
    )
}