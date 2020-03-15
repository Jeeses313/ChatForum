import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import Navigationbar from './components/Navigationbar'
import Notification from './components/Notification'
import { useSelector } from 'react-redux'

function App() {
  const token = useSelector(state => state.token)
  return (
    <div>
      <Switch>
        <Route path='/login'>
          <Notification></Notification>
          <LoginForm></LoginForm>
        </Route>
        <Route path='/'>
          {token ?
            <>
              <Navigationbar></Navigationbar>
              <Notification></Notification>
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
