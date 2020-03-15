import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, split } from '@apollo/client'
import { setContext } from 'apollo-link-context'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/link-ws'
import { BrowserRouter as Router } from "react-router-dom"
import { Provider } from 'react-redux'
import store from './store'
import { setUser } from './reducers/userReducer'
import { setToken } from './reducers/tokenReducer'
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('user-token')
    return {
        headers: {
            ...headers,
            authorization: token ? `bearer ${token}` : null
        }
    }
})


const defaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache'
    },
    query: {
        fetchPolicy: 'no-cache'
    }
}

const httpLink = new HttpLink({ uri: 'http://localhost:3001/graphql' })

const wsLink = new WebSocketLink({
    uri: `ws://localhost:3001/graphql`,
    options: { reconnect: true }
})
const splitLink = split(({ query }) => {
    const definition = getMainDefinition(query)
    return (definition.kind === 'OperationDefinition' && definition.operation === 'subscription')
},
    wsLink,
    authLink.concat(httpLink)
)

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink,
    defaultOptions: defaultOptions
})




const loggedToken = localStorage.getItem('user-token')
const loggedUser = localStorage.getItem('logged-user')
if (loggedToken) {
    console.log(`${loggedToken} 2`)
    store.dispatch(setToken(loggedToken))
}
if (loggedUser) {
    store.dispatch(setUser(JSON.parse(loggedUser)))
}
ReactDOM.render(<ApolloProvider client={client}><Provider store={store}><Router><App /></Router></Provider></ApolloProvider>, document.getElementById('root'))