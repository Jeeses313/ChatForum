import { gql } from '@apollo/client'

export const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
        login(username: $username, password: $password)  {
            value
            user {
                id
                username
                pinnedChats {
                    title
                }
                admin
            }
        }
    }
`

export const SIGNIN = gql`
    mutation createUser($username: String!, $password: String!) {
        createUser(username: $username, password: $password)  {
            value
            user {
                id
                username
                pinnedChats {
                    title
                }
                admin
            }
        }
    }
`

export const USER = gql`
    query user($username: String!) {
        user(username: $username)  {
            username
            imageUrl
        }
    }
`

export const SET_PROFILEPIC = gql`
mutation setUserProfilePic($imageUrl: String!) {
    setUserProfilePic(imageUrl: $imageUrl)  {
        username
        imageUrl
    }
}
`

export const DELETE_PROFILEPIC = gql`
mutation deleteUserProfilePic {
    deleteUserProfilePic {
        username
        imageUrl
    }
}
`