import { gql } from '@apollo/client'

export const CREATE_CHAT = gql`
    mutation createChat($chatTitle: String!) {
        createChat(chatTitle: $chatTitle)  {
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
            date
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