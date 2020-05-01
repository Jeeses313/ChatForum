import { gql } from '@apollo/client'

export const CREATE_CHAT = gql`
    mutation createChat($chatTitle: String!) {
        createChat(chatTitle: $chatTitle)  {
            title
        }
    }
`

export const DELETE_CHAT = gql`
    mutation deleteChat($chatId: String!) {
        deleteChat(chatId: $chatId)  {
            title
        }
    }
`

export const CHATS = gql`
    query {
        chats {
            title
            latestComment{
                content
                date
                user{
                    username
                    admin
                }
            }
            id
            date
            reports
        }
    }
`

export const CHATS_PINNED = gql`
    query {
        pinnedChats {
            title
            latestComment{
                content
                date
                user{
                    username
                    admin
                }
            }
            id
            date
            reports
        }
    }
`

export const REPORTED_CHATS = gql`
    query {
        reportedChats {
            title
            latestComment{
                content
                date
                user{
                    username
                    admin
                }
            }
            id
            date
            reports
        }
    }
`

export const CHAT = gql`
    query chat($chatTitle: String!){
        chat(chatTitle: $chatTitle) {
            comments {
                user { 
                    username
                    imageUrl
                    admin
                }
                date
                content
                imageUrl
                hasVideo
                reports
                id
            }
            title
            reports
        }
    }
`

export const PINNED_CHATS = gql`
    query {
        pinnedChats {
            title
        }
    }
`

export const CHAT_ADDED = gql`
    subscription {
        chatAdded {
            title
            latestComment {
                content
                date
                user {
                    username
                    admin
                }
            }
            date
            id
            reports
        }
    }
`

export const CHAT_REPORTED = gql`
    subscription {
        chatReported {
            title
            id
            latestComment {
                content
                date
                user {
                    username
                    admin
                }
            }
            comments{
                user { 
                    username
                    imageUrl
                    admin
                }
                date
                content
                imageUrl
                hasVideo
                reports
                id
            }
            date
            reports
        }
    }
`

export const CHAT_DELETED = gql`
    subscription {
        chatDeleted {
            title
            id
        }
    }
`

export const PIN_CHAT = gql`
    mutation pinChat($chatTitle: String!) {
        pinChat(chatTitle: $chatTitle)  {
            title
        }
    }
`

export const UNPIN_CHAT = gql`
    mutation unpinChat($chatTitle: String!) {
        unpinChat(chatTitle: $chatTitle)  {
            title
        }
    }
`

export const REPORT_CHAT = gql`
    mutation reportChat($chatTitle: String!) {
        reportChat(chatTitle: $chatTitle)  {
            title
        }
    }
`

export const UNREPORT_CHAT = gql`
    mutation unreportChat($chatTitle: String!) {
        unreportChat(chatTitle: $chatTitle)  {
            title
        }
    }
`

export const ZEROREPORT_CHAT = gql`
    mutation zeroReportChat($chatTitle: String!) {
        zeroReportChat(chatTitle: $chatTitle)  {
            title
        }
    }
`