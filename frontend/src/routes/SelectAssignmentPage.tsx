import React from "react"
import { useParams } from "react-router"
import { UserProvidedProps } from "../components/UserProvider"
import FolderPicker from "../components/FolderPicker"
import { useEffect } from 'react';


export default function SelectAssignmentPage({ }: UserProvidedProps) {
  const { ltiId } = useParams<{ ltiId: string }>()

  return (
    <div>
      <FolderPicker>
        Test
        <LtiRedirect />
      </FolderPicker>
    </div>
  )
}

function LtiRedirect() {
  const returnUrl = atob(new URLSearchParams(window.location.search).get("return") as string)

  const data = {
    "@context": "http://purl.imsglobal.org/ctx/lti/v1/ContentItem",
    "@graph": [
      {
        "@type": "LtiLinkItem",
        "@id": "https://api.oconnorfolder.nathankutzan.info/lti",
        "url": "https://api.oconnorfolder.nathankutzan.info/lti",
        "placementAdvice": {
          "presentationDocumentTarget": "window"
        }
      }
    ]
  }

  useEffect(() => {
    (document.getElementById("redirect-form") as any).submit(); 
  })

  return (
    <div style={{ display: "none" }}>
      <form action={returnUrl} method="post" id="redirect-form" encType="application/x-www-form-urlencoded">
        <input type="hidden" name="lti_message_type" value="ContentItemSelection" />
        <input type="hidden" name="lti_version" value="LTI-1p0" />
        <input type="hidden" name="content_items" value={JSON.stringify(data)} />
      </form>
    </div>
  )
}
