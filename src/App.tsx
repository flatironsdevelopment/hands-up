import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { useEffect, useState } from 'react'
import { HandsUp } from './components/HandsUp/HandsUp'

function App() {
  const [meetId, setMeetId] = useState<string>()
  const [isInitialized, setInitialized] = useState(false)

  useEffect(() => {
    const isOnGoogleMeet = window.location.host.indexOf('meet') > -1
    const urlParts = window.location.pathname.split('/')
    const meetId = urlParts[urlParts.length - 1]
    const safeMeetId = !!meetId ? meetId : 'testing'
    setMeetId(safeMeetId)
    setInitialized(isOnGoogleMeet ? !!meetId : true)

    console.log('Started...', { isOnGoogleMeet, meetId: safeMeetId })
  }, [])

  return isInitialized ? (
    <Fragment>
      <Helmet>
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
        />
      </Helmet>
      <HandsUp meetId={meetId} />
    </Fragment>
  ) : null
}

export default App
