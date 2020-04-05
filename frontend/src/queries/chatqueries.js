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
                }
            }
            id
            date
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
                }
            }
            date
        }
    }
`

export const CHAT_DELETED= gql`
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