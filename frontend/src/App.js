import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import LoggedInPage from './components/LoggedInPage'
import SigninForm from './components/SigninForm'
import Navgationbar from './components/Navigationbar'
import { useSelector } from 'react-redux'

const App = () => {
    const token = useSelector(state => state.token)
    const mode = useSelector(state => state.mode)
    const style = {
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        zIndex: 10
    }
    if (mode === 'light') {
        document.body.style.backgroundColor = 'white'

    } else {
        document.body.style.backgroundColor = 'darkgray'
    }
    return (
        <div style={style}>
            <Navgationbar></Navgationbar>
            <Switch>
                <Route path='/signin'>
                    {token ?
                        <Redirect to='/chats'></Redirect>
                        :
                        <SigninForm></SigninForm>
                    }
                </Route>
                <Route path='/login'>
                    {token ?
                        <Redirect to='/chats'></Redirect>
                        :
                        <LoginForm></LoginForm>
                    }
                </Route>
                <Route path='/'>
                    {token ?
                        <>
                            <LoggedInPage></LoggedInPage>
                        </>
                        :
                        <Redirect to='/login'></Redirect>
                    }
                </Route>
            </Switch>
        </div>
    )
}

export default App