import { useAlert } from './components/Alert'
import { useCallback, useRef } from 'react'
import { authenticate, listenDisconnect, setHandsUp } from './firebase'
import { User } from './types'

export const useAuth = ({ meetId }: { meetId: string }) => {
  const userRef = useRef<User>()
  const { showAlert } = useAlert()

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

  return { auth, userRef }
}
