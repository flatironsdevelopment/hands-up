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
import { HandsUpList } from './HandsUpList'
import {
  getHandsUp,
  setHandsUp,
  authenticate,
  listenDisconnect
} from '../../firebase'
import { MeetSnapshot, User } from 'types'
import { AlertState, useAlert } from '../Alert'

const useStyles = makeStyles(() => ({
  button: {
    marginTop: '15px !important',
    marginRight: '10px !important',
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

const newHandsAlert = (
  currentState: MeetSnapshot,
  newState: MeetSnapshot,
  userId: string
): AlertState => {
  const alertState = {}
  Object.keys(newState).forEach((key) => {
    const currItem = currentState[key]
    const newItem = newState[key]
    const isHandDown = !currItem || !currItem.isHandUp
    const isCurrentUser = newItem.id === userId
    const shouldShowAlert = isHandDown && !isCurrentUser && newItem.isHandUp
    if (shouldShowAlert) {
      alertState[key] = {
        message: `${newItem.name} raised his hand`,
        severity: 'info'
      }
    }
  })
  return alertState
}

export const HandsUp = ({ meetId }) => {
  const style = useStyles()

  const [isOpen, setIsOpen] = useState(false)
  const [isHandUp, setIsHandUp] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const userRef = useRef<User>()

  const [state, setState] = useState<MeetSnapshot>({})
  const currentHandsState = useRef<MeetSnapshot>({})

  const isInitializedRef = useRef<boolean>(false)
  const { showAlert, showMultipleAlerts } = useAlert()

  const authSuccess = useCallback((user: User) => {
    userRef.current = user
    listenDisconnect(meetId, user)
    showAlert({
      severity: 'success',
      message: `Welcome ${user.name}!`
    })
  }, [])

  const authError = useCallback(() => {
    userRef.current = null
    showAlert({
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
    const newHands = newHandsAlert(currentHandsState.current, state, userId)
    const newState = { ...currentHandsState.current, ...state }
    currentHandsState.current = newState
    setState(newState)
    showMultipleAlerts(newHands)
  }, [])

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      auth()
    }
    return getHandsUp(meetId, (hands) => handleNewHands(hands ? hands : {}))
  }, [meetId, handleNewHands])

  return (
    <Fragment>
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className={style.backdrop} />
      )}
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
      {isOpen && (
        <div className={style.list}>
          <HandsUpList state={state} />
        </div>
      )}
    </Fragment>
  )
}
