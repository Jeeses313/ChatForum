import { gql } from '@apollo/client'

export const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
        login(username: $username, password: $password)  {
            value
            user {
                username
                pinnedChats {
                    title
                }
            }
        }
    }
`

export const SIGNIN = gql`
    mutation createUser($username: String!, $password: String!) {
        createUser(username: $username, password: $password)  {
            value
            user {
                username
                pinnedChats {
                    title
                }
            }
        }
    }
`