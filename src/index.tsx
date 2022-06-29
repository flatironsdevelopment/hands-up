import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

export function showHandsUp() {
  const isOnMeet = window.location.host.indexOf('meet') > -1
  let target = document.getElementById('root')

  if (isOnMeet) {
    target = document.createElement('div')
    target.setAttribute('id', 'hands-up')
    document.body.appendChild(target)
  }

  const root = ReactDOM.createRoot(target)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
