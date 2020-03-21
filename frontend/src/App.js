import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import LoggedInPage from './components/LoggedInPage'
import SigninForm from './components/SigninForm'
import { useSelector } from 'react-redux'

const App = () => {
    const token = useSelector(state => state.token)
    return (
        <div>
            <Switch>
                <Route path='/signin'>
                    {token ?
                        <Redirect to='/login'></Redirect>
                        :
                        <SigninForm></SigninForm>
                    }
                </Route>
                <Route path='/login'>
                    {token ?
                        <Redirect to='/login'></Redirect>
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