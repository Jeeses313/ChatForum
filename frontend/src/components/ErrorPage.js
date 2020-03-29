import React from 'react'
import { useRouteMatch } from 'react-router-dom'

const ErrorPage = () => {
    const match = useRouteMatch('/error/:errormessage')
    const errormessage = match ? match.params.errormessage : null

    return (
        <h2>{errormessage}</h2>
    )
}

export default ErrorPage