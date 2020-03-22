import { gql } from '@apollo/client'

export const CREATE_COMMENT = gql`
    mutation createComment($chatTitle: String!, $content: String!) {
        createComment(chatTitle: $chatTitle, content: $content)  {
            content
            date
            user{
                username
            }
        }
    }
`

export const COMMENTS = gql`
    query comments($chatTitle: String){
        comments(chatTitle: $chatTitle) {
            content
            date
            user{
                username
            }
            id
        }
    }
`

export const COMMENT_ADDED = gql`
    subscription {
        commentAdded {
            comment {
                user { 
                    username
                }
                date
                content
                id
            }
            chatTitle
        }
    }
`