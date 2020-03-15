import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import Navigationbar from './components/Navigationbar'
import SigninForm from './components/SigninForm'
import { useSelector } from 'react-redux'

function App() {
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
              <Navigationbar></Navigationbar>
              <h1>welcome</h1>
            </>
            :
            <Redirect to='/login'></Redirect>
          }
        </Route>
      </Switch>
    </div>
  )
}

export default App;
