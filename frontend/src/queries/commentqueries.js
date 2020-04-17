import { gql } from '@apollo/client'

export const CREATE_COMMENT = gql`
    mutation createComment($chatTitle: String!, $content: String!, $imageUrl: String) {
        createComment(chatTitle: $chatTitle, content: $content, imageUrl: $imageUrl)  {
            content
            date
            imageUrl
            hasVideo
            user{
                username
                imageUrl
            }
        }
    }
`

export const COMMENT_ADDED = gql`
    subscription {
        commentAdded {
            comment {
                user { 
                    username
                    imageUrl
                }
                date
                content
                imageUrl
                hasVideo
                id
            }
            chatTitle
        }
    }
`

export const DELETE_COMMENT = gql`
    mutation deleteComment($commentId: String!) {
        deleteComment(commentId: $commentId)  {
            content
            id
        }
    }
`

export const COMMENT_DELETED = gql`
    subscription {
        commentDeleted {
            content
            imageUrl
            id
        }
    }
`

export const EDIT_COMMENT = gql`
    mutation editComment($commentId: String!, $content: String!, $imageUrl: String) {
        editComment(
            commentId: $commentId
            content: $content
            imageUrl: $imageUrl
        ){
            content
            id
        }
    }
`

export const COMMENT_EDITED = gql`
    subscription {
        commentEdited {
            content
            id
            imageUrl
            hasVideo
        }
    }
`