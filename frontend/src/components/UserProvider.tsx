import { useQuery } from "@apollo/client"
import { datadogRum } from "@datadog/browser-rum"
import gql from "graphql-tag"
import { User } from "../../types/generated"
import React from "react"
import ErrorMessage from "./ErrorMessage"

export const GET_ME = gql`
query {
    me {
        oid
        name
        email
        role
    }
}
`

export interface UserProvidedProps {
    user: User
    setDarkMode: (dark: boolean) => void
    isDarkMode: boolean
}

export interface UserProviderProps {
    whenLearner: (props: UserProvidedProps) => React.ReactNode
    whenInstructor: (props: UserProvidedProps) => React.ReactNode
    setDarkMode: (dark: boolean) => void
    isDarkMode: boolean
}

export default function UserProvider({ whenLearner, whenInstructor, setDarkMode, isDarkMode }: UserProviderProps) {
    const { error: meError, data: meData } = useQuery<{ me: User }>(GET_ME)

    if (meData != null && meError == null) {
        datadogRum.setUser({
            id: meData?.me.oid,
            email: meData?.me.email,
            name: meData?.me.name
        })
    }

    if (meError) {
        return (
            <ErrorMessage error={meError.message} />
        )
    }

    if (meData == null) {
        return (<></>)
    }

    if (meData.me.role === "Instructor") {
        return (<>{whenInstructor({ user: meData.me, setDarkMode, isDarkMode })}</>)
    } else {
        return (<>{whenLearner({ user: meData.me, setDarkMode, isDarkMode })}</>)
    }
}