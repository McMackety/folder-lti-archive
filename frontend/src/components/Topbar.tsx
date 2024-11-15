import { AppBar, FormControlLabel, Switch, Toolbar, Typography } from "@material-ui/core"
import React, { PropsWithChildren } from "react"

export default function Topbar(props: PropsWithChildren<{ username: string | null, setDarkMode: (dark: boolean) => void, isDarkMode: boolean }>) {
    return (
        <AppBar position="static" style={{ marginBottom: "20px" }}>
            <Toolbar>
                <Typography variant="h6" style={{ whiteSpace: "nowrap" }}>
                    Virtual Folder
                    </Typography>
                <Typography variant="overline" style={{ marginLeft: "5em", whiteSpace: "nowrap" }}>
                    {props.username == null ? "" : `${props.username}`}
                </Typography>
                <FormControlLabel style={{marginLeft: "20px", width: "100%"}} control={ <Switch color="secondary" checked={props.isDarkMode} onChange={(e) => props.setDarkMode(e.target.checked)} /> } label="Dark Mode" />
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                    {props.children}
                </div>
            </Toolbar>
        </AppBar>
    )
}