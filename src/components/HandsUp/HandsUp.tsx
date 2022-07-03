import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import ListIcon from '@mui/icons-material/List'
import PanToolIcon from '@mui/icons-material/PanTool'
import CloseIcon from '@mui/icons-material/Close'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import { makeStyles } from '@mui/styles'
import { HandsUpList } from '../HandsUpList/HandsUpList'
import {
  getHandsUp,
  setHandsUp,
  authenticate,
  listenDisconnect
} from '../../firebase'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { MeetSnapshot, User } from 'types'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'fixed',
    bottom: 120,
    right: 30,
    zIndex: 1000
  },
  button: {
    marginTop: 15,
    marginRight: 10,
    zIndex: 1
  },
  list: {
    position: 'fixed',
    bottom: 200,
    right: 30,
    zIndex: 1000
  },
  backdrop: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    background: 'transparent',
    zIndex: 0
  }
}))

const checkNewHands = (
  currentState: MeetSnapshot,
  newState: MeetSnapshot,
  userId: string
) => {
  const news = {}
  Object.keys(newState).forEach((newKey) => {
    const isHandDown = !currentState[newKey] || !currentState[newKey].isHandUp
    const showAlert =
      isHandDown && newState[newKey].id !== userId && newState[newKey].isHandUp
    if (showAlert) news[newKey] = newState[newKey]
  })
  return news
}

export const HandsUp = ({ meetId }) => {
  const style = useStyles()

  const [isOpen, setIsOpen] = useState(false)
  const [isHandUp, setIsHandUp] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const userRef = useRef<User>()

  const [state, setState] = useState<MeetSnapshot>({})
  const [newHandsUpAlert, setNewHandsUpAlert] = useState<MeetSnapshot>({})

  const [alertSate, setAlertState] = useState<{
    severity: 'success' | 'error'
    message: string
  }>(null)
  const currentHandsState = useRef<MeetSnapshot>({})
  const isInitializedRef = useRef<boolean>(false)

  const authSuccess = useCallback((user: User) => {
    userRef.current = user
    listenDisconnect(meetId, user)
    setAlertState({
      severity: 'success',
      message: `Welcome ${user.name}!`
    })
  }, [])

  const authError = useCallback(() => {
    userRef.current = null
    setAlertState({
      severity: 'error',
      message: 'Fail to authenticate.'
    })
  }, [])

  const auth = useCallback(async () => {
    if (userRef.current) return userRef.current

    const user = await authenticate()

    if (!user) {
      authError()
      return
    }

    if (user && !user.isConnected) {
      setHandsUp(meetId, { ...user, isConnected: true })
    }

    authSuccess(user)
    return user
  }, [authSuccess, authError])

  const raiseHand = useCallback(async () => {
    let user = await auth()
    if (!user) return
    const newIsHandsUp = !isHandUp
    setIsHandUp(newIsHandsUp)
    setHandsUp(meetId, {
      ...user,
      isHandUp: newIsHandsUp,
      isConnected: true,
      raisedAt: newIsHandsUp ? new Date().getTime() : null
    })
  }, [meetId, isHandUp, auth])

  const handleNewHands = useCallback((state) => {
    const userId = userRef.current?.id
    const newHands = checkNewHands(currentHandsState.current, state, userId)
    setNewHandsUpAlert((hands) => ({ ...hands, ...newHands }))
    setState(state)
    currentHandsState.current = { ...currentHandsState.current, ...state }
  }, [])

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      auth()
    }
    return getHandsUp(meetId, (hands) => handleNewHands(hands ? hands : {}))
  }, [meetId, handleNewHands])

  function renderNewHandUpAlert(key) {
    const state = newHandsUpAlert[key]
    const close = () => {
      const newState = { ...newHandsUpAlert }
      delete newState[key]
      setNewHandsUpAlert(newState)
    }
    return (
      <Snackbar
        key={key}
        open={!!state}
        onClose={close}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={close} severity={'info'}>
          {state.name} raised his hand
        </Alert>
      </Snackbar>
    )
  }

  function renderAlert() {
    return (
      <Snackbar
        open={!!alertSate}
        autoHideDuration={3000}
        onClose={() => setAlertState(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {alertSate ? (
          <Alert
            onClose={() => setAlertState(null)}
            severity={alertSate.severity}
          >
            {alertSate.message}
          </Alert>
        ) : null}
      </Snackbar>
    )
  }

  return (
    <Fragment>
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className={style.backdrop} />
      )}
      <div className={style.root}>
        <Tooltip
          open={isHandUp || isTooltipOpen}
          title={isHandUp ? 'Lower hand' : 'Raise hand'}
          onClose={() => setIsTooltipOpen(false)}
          onOpen={() => setIsTooltipOpen(true)}
        >
          <Fab
            className={style.button}
            color='primary'
            aria-label='hands up'
            onClick={raiseHand}
          >
            {isHandUp ? <CloseIcon /> : <PanToolIcon />}
          </Fab>
        </Tooltip>
        <Tooltip title='Raised hands'>
          <Fab
            className={style.button}
            color='primary'
            aria-label='show'
            onClick={() => setIsOpen(!isOpen)}
          >
            <ListIcon />
          </Fab>
        </Tooltip>
      </div>
      <div className={style.list}>
        {isOpen && <HandsUpList state={state} />}
      </div>
      {Object.keys(newHandsUpAlert).map(renderNewHandUpAlert)}
      {renderAlert()}
    </Fragment>
  )
}
