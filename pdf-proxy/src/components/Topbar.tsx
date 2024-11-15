import { AppBar, Toolbar, Typography } from "@material-ui/core"
import React, { PropsWithChildren } from "react"

export default function Topbar(props: PropsWithChildren<{username: string | null}>) {
    return (
        <AppBar position="static" style={{ marginBottom: "20px" }}>
            <Toolbar>
                <Typography variant="h6" style={{ whiteSpace: "nowrap" }}>
                    Virtual Folder
                    </Typography>
                <Typography variant="overline" style={{ marginLeft: "5em", whiteSpace: "nowrap" }}>
                    {props.username == null ? "" : `${props.username}`}
                </Typography>
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                    {props.children}
                </div>
            </Toolbar>
        </AppBar>
    )
}