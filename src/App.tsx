import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { useEffect, useState } from 'react'
import { HandsUp } from './components/HandsUp/HandsUp'
import { Reactions } from './components/Reactions/Reactions'
import { AlertProvider } from './components/Alert'
import styled from '@emotion/styled'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: fixed;
  bottom: 120px;
  right: 50px;
  z-index: 1000;
`

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

  function render() {
    return (
      <Fragment>
        <Helmet>
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
          />
        </Helmet>
        <Container>
          <Reactions meetId={meetId} />
          <HandsUp meetId={meetId} />
        </Container>
      </Fragment>
    )
  }

  return <AlertProvider>{isInitialized ? render() : null}</AlertProvider>
}

export default App
