import { gql } from '@apollo/client'

export const CREATE_COMMENT = gql`
    mutation createComment($chatTitle: String!, $content: String!, $imageUrl: String) {
        createComment(chatTitle: $chatTitle, content: $content, imageUrl: $imageUrl)  {
            content
            date
            imageUrl
            hasVideo
            reports
            id
            user{
                username
                imageUrl
            }
        }
    }
`

export const REPORTED_COMMENTS = gql`
    query {
        reportedComments {
            content
            date
            imageUrl
            hasVideo
            id
            user{
                username
                imageUrl
            }
            reports
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
                reports
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
            reports
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
            reports
        }
    }
`

export const COMMENT_REPORTED = gql`
    subscription {
        commentReported {
            content
            id
            imageUrl
            hasVideo
            reports
        }
    }
`

export const REPORT_COMMENT = gql`
    mutation reportComment($commentId: String!) {
        reportComment(commentId: $commentId)  {
            id
        }
    }
`

export const UNREPORT_COMMENT = gql`
    mutation unreportComment($commentId: String!) {
        unreportComment(commentId: $commentId)  {
            id
        }
    }
`

export const ZEROREPORT_COMMENT = gql`
    mutation zeroReportComment($commentId: String!) {
        zeroReportComment(commentId: $commentId)  {
            id
        }
    }
`