import { Theme, Button, createMuiTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ThemeProvider, Typography, useMediaQuery, Snackbar, CssBaseline } from "@material-ui/core";
import MuiAlert from '@material-ui/lab/Alert';
import React, { useState } from "react"
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { AssignmentPage } from "./routes/AssignmentPage";
import Home from "./routes/Home";
import ErrorMessage from "./components/ErrorMessage";
import { Submit } from "./routes/Submit";
import { ViewSubmission } from "./routes/ViewSubmission";
import UserProvider from "./components/UserProvider";
import FolderPicker from "./components/FolderPicker";
import SelectAssignmentPage from "./routes/SelectAssignmentPage";

interface MaintenanceStatus {
  maintenance: boolean,
  note: string,
  blockAll: boolean
  forceReload: boolean
}

interface NetworkErrorStatus { err: string, showHelp: boolean }

class App extends React.Component<{}, { networkError: NetworkErrorStatus | null, maintenance: MaintenanceStatus | null, dark: boolean }> {
  constructor(props: {}) {
    super(props)
    this.state = {
      networkError: null,
      maintenance: null,
      dark: false,
    }
  }

  httpLink = createHttpLink({
    uri: "https://api.oconnorfolder.nathankutzan.info/query",
    credentials: "include"
  })
  errorLink = onError(({ networkError, operation, graphQLErrors }) => {
    if (operation.operationName === "SaveAssignment") {
      if (graphQLErrors?.length && graphQLErrors.length > 0) {
        for (const gqlErr of graphQLErrors) {
          if (gqlErr.message === "Not Authorized") {
            this.setState({
              networkError: {
                err: "Your session timed out. Please reopen the folder from myLearning.",
                showHelp: false
              }
            })
            return
          }
        }
      }
      //If not an unauthorized error:
      this.setState({
        networkError: {
          err: "Failed to save assignment",
          showHelp: false
        }
      })
    } else if (networkError) {
      this.setState({
        networkError: {
          err: "A network error occurred",
          showHelp: false
        }
      })
    } else {
      this.setState({
        networkError: {
          err: "An operation error occurred",
          showHelp: false
        }
      })
    }
  })

  client = new ApolloClient({
    link: this.errorLink.concat(this.httpLink),
    cache: new InMemoryCache()
  })

  maintenanceTimer: NodeJS.Timeout | null = null

  componentDidMount() {
    this.maintenanceTimer = setInterval(this.checkMaintenance, 1000 * 60 * 1)
    this.checkMaintenance()
  }

  componentWillUnmount() {
    this.maintenanceTimer && clearInterval(this.maintenanceTimer)
  }

  checkMaintenance = () => {
    fetch(process.env.NODE_ENV === "development" ? 'https://dev-oconnor-status.macdonnell-chase.workers.dev/' : 'https://oconnor-status.macdonnell-chase.workers.dev/')
      .then(response => response.json())
      .then((data: MaintenanceStatus) => {
        if (data.maintenance === false && this.state.maintenance?.maintenance === true && this.state.maintenance?.forceReload === true) {
          window.location.reload()
        } else {
          this.setState({ maintenance: data })
        }
      })
  }

  setDarkMode = (dark: boolean) => {
    this.setState({
      dark: dark
    })
  }

  render() {

    const theme = createMuiTheme({
      palette: {
        type: this.state.dark ? "dark" : "light",
        primary: {
          light: '#757ce8',
          main: '#3f51b5',
          dark: '#002884',
          contrastText: '#fff',
        },
        secondary: {
          light: '#63ccff',
          main: '#039be5',
          dark: '#006db3',
          contrastText: '#000',
        },
      },
    })

    return (
      <RenderApp theme={theme} client={this.client} networkError={this.state.networkError} clearNetworkError={() => this.setState({ networkError: null })} maintenance={this.state.maintenance} setDarkMode={this.setDarkMode} isDarkMode={this.state.dark} />
    )
  }

}

function RenderApp({ theme, client, networkError, clearNetworkError, maintenance, isDarkMode, setDarkMode }: { theme: Theme, client: ApolloClient<any>, networkError: NetworkErrorStatus | null, maintenance: MaintenanceStatus | null, clearNetworkError: () => void, isDarkMode: boolean, setDarkMode: (dark: boolean) => void }) {
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'))
  const [mobileDialogOpen, setMobileDialogOpen] = useState(true)
  const [netErrDialogOpen, setNetErrDialogOpen] = useState(false)
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isDarkMode && (
        <style>
          {`
          table, th, td {
            border: 1px solid white;
            border-collapse: collapse;
          }
          `}
        </style>
      )}
      {maintenance && maintenance.maintenance && (
        <div style={{ backgroundColor: "Orange", padding: "20px" }}>
          <Typography>
            Maintenance Mode
          <Button style={{ marginLeft: "10px" }} variant="outlined" size="small" onClick={() => setMaintenanceDialogOpen(true)}>
              Learn More
          </Button>
          </Typography>
        </div>
      )}
      {(maintenance != null && maintenance.maintenance && maintenance.blockAll) ? (
        <ErrorMessage error={maintenance.note} maintenance={true} />
      ) : (
        <Router>
          <ApolloProvider client={client}>
            <Switch>
              <Route path="/assignment/:ltiId" exact>
                <UserProvider whenLearner={props => <AssignmentPage {...props} />} whenInstructor={props => <FolderPicker><AssignmentPage {...props} /></FolderPicker>} setDarkMode={setDarkMode} isDarkMode={isDarkMode} />
              </Route>
              <Route path="/selectassignment/:ltiId" exact>
                <UserProvider whenLearner={props => <></>} whenInstructor={props => <SelectAssignmentPage {...props} />} setDarkMode={setDarkMode} isDarkMode={isDarkMode} />
              </Route>
              <Route path="/submit/:ltiId" exact>
                <UserProvider whenLearner={props => <Submit {...props} />} whenInstructor={props => <ErrorMessage error="Instructors cannot submit" />} setDarkMode={setDarkMode} isDarkMode={isDarkMode} />
              </Route>
              <Route path="/submission/:id" exact>
                <ViewSubmission />
              </Route>
              <Route path="/" exact>
                <Home />
              </Route>
              <Route>
                <ErrorMessage error="Not Found" />
              </Route>
            </Switch>
            <Typography style={{ display: "flex", justifyContent: "center", margin: "20px" }} variant="overline">© 2021 Nathan Kutzan, Chase MacDonnell</Typography>
          </ApolloProvider>
        </Router>
      )}

      <Dialog open={maintenanceDialogOpen} onClose={() => setMaintenanceDialogOpen(false)}>
        <DialogTitle>Maintenance Mode</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ whiteSpace: "pre-line" }}>
            {maintenance && maintenance.note}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullScreen open={isMobile && mobileDialogOpen} onClose={() => setMobileDialogOpen(false)}>
        <DialogTitle>Desktop device recommended</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Virtual Folder works best on a desktop or laptop device. If you choose to continue on mobile, some features may not work correctly.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMobileDialogOpen(false)} color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={netErrDialogOpen} onClose={() => setNetErrDialogOpen(false)}>
        <DialogTitle>Why did I get a network error?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You get a network error when the Virtual Folder website can't contact the saving server, or the server did not respond. The most common reasons why you would get a network error are:
            <ul>
              <li>You lost connection to the internet</li>
              <li>You aren't viewing the latest version of the website</li>
              <li>Your session timed out</li>
              <li>We're making changes to Virtual Folder</li>
            </ul>
            If you're sure you are connected to the internet, then close your browser and try again in a little bit. If the issue persists, please <a href={"mailto:support@oconnor-folder.atlassian.net?subject=Network%20Error%20Issue&body=At%20what%20time%20did%20this%20issue%20occur%3F%0D%0A%0D%0ADid%20you%20notice%20anything%20else%3F"}>Let us Know</a>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNetErrDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={networkError != null} autoHideDuration={10000} onClose={clearNetworkError} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <MuiAlert elevation={6} variant="filled" severity="error"
          action={networkError?.showHelp &&
            <Button color="inherit" size="small" onClick={() => setNetErrDialogOpen(true)}>
              Find out why
            </Button>
          }
        >
          {networkError?.err}
        </MuiAlert>
      </Snackbar>
    </ThemeProvider>
  )
}

export default App;
