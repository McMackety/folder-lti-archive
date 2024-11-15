import { ApolloClient, ApolloProvider, createHttpLink, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { ServerStyleSheets } from "@material-ui/styles";
import fetch from 'cross-fetch';
import express from "express"
import React from "react"
import ReactDOMServer from 'react-dom/server';
import { Assignment } from "../types/generated";
import PdfFolder from "./components/PdfFolder"
import puppeteer from "puppeteer"
import { GET_ASSIGNMENT, GET_SUBMISSION } from "./query";

const app = express()
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

const httpLink = createHttpLink({ uri: process.env.API_URI ?? 'https://api.oconnorfolder.nathankutzan.info/query', fetch: fetch as unknown as WindowOrWorkerGlobalScope['fetch'] });

const credentialsLink = setContext((_, { headers, cookieString }) => {
    return {
        headers: {
            ...headers,
            cookie: cookieString
        }
    }
});

const client = new ApolloClient({
    link: credentialsLink.concat(httpLink),
    cache: new InMemoryCache(),
    credentials: "include",
    defaultOptions: {
        query: {
            fetchPolicy: "no-cache",
            errorPolicy: "all"
        }
    }
})

app.get('/assignment/:id', async (req, res) => {
    const assignmentId = req.params.id
    const cookieString = req.header("Cookie")

    const response = await client.query<{ assignment: Assignment }>({
        query: GET_ASSIGNMENT,
        variables: {
            id: assignmentId
        },
        context: {
            cookieString: cookieString
        }
    })

    if (response.error != null) {
        return res.status(500).send(response.error)
    }
    if (response.errors != null) {
        return res.status(500).send(response.errors)
    }
    if (response.data.assignment == null) {
        return res.status(500).send("Invalid assignment")
    }

    const html = renderHtml(response.data.assignment, false)

    if (req.query["variant"] === "html") {
        return res.send(html)
    }

    res.contentType("application/pdf").send(await renderPdf(html))

})

app.get('/submission/:id', async (req, res) => {
    const submissionId = req.params.id

    const response = await client.query<{ submission: Assignment }>({
        query: GET_SUBMISSION,
        variables: {
            id: submissionId
        }
    })

    if (response.error != null) {
        return res.status(500).send(response.error)
    }
    if (response.errors != null) {
        return res.status(500).send(response.errors)
    }
    if (response.data.submission == null) {
        return res.status(500).send("Invalid submission")
    }

    const html = renderHtml(response.data.submission, true)

    if (req.query["variant"] === "html") {
        return res.send(html)
    }

    res.contentType("application/pdf").send(await renderPdf(html))
})

function renderHtml(assignment: Assignment, submission: boolean): string {
    const sheets = new ServerStyleSheets()

    const ihtml = ReactDOMServer.renderToString(sheets.collect(
        <ApolloProvider client={client}>
            <PdfFolder assignment={assignment} />
        </ApolloProvider>
    ))
    const css = sheets.toString()

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>
        <style id="jss-server-side">${css}</style>
        <style>body{margin:0}table,td,th{border:1px solid #000;border-collapse:collapse}@media print{.hideprint{display:none!important}.showprint{display:inherit!important}}.bordered{border-style:solid;border-width:1px;}</style>
      </head>
      <body>
        ${submission ? `<div style="font-size: 6pt;">View the interactive version at <a href="https://oconnorfolder.nathankutzan.info/submission/${assignment.id}">https://oconnorfolder.nathankutzan.info/submission/${assignment.id}</a></div>` : ""}
        <div id="root">${ihtml}</div>
        <div style="text-align: center; font-size: 6pt;">Virtual Folder © 2021 Nathan Kutzan, Chase MacDonnell</div>
      </body>
    </html>`
    return html
}

function renderPdf(html: string): Promise<Buffer> {
    return new Promise(async (resolve) => {
        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()
        await page.setContent(html)
        const pdf = await page.pdf({ format: 'letter', margin: {
            top: "1cm",
            bottom: "1cm",
            left: "1cm",
            right: "1cm"
        } })
        resolve(pdf)
        await browser.close()
    })
}

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${port}`)
})