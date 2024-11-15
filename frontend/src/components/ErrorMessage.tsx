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

export default function ErrorMessage({ error, maintenance }: { error: string, maintenance?: boolean }) {
    if (maintenance) {
        return (
            <Container maxWidth="md">
                <div style={centerDivStyles}>
                    <Typography variant="h2">Maintenance Mode</Typography>
                    <Typography variant="h4" style={{ whiteSpace: "pre-line" }}>{error}</Typography>
                </div>
            </Container>
        )
    }
    return (
        <Container maxWidth="md">
            <div style={centerDivStyles}>
                <Typography variant="h2">Error</Typography>
                <Typography variant="h4">{error}</Typography>
                <Typography variant="h6">Access your assignments from <a href="https://pasco.instructure.com">myLearning</a> to work on your folder!</Typography>
            </div>
        </Container>
    )
}