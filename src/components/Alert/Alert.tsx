import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import React, { useCallback, useMemo, useState } from 'react'
import { nanoid } from 'nanoid'

export type Alert = {
  severity: 'success' | 'error'
  message: string
}

export type AlertState = {
  [key: string]: Alert
}

export type AlertProvideValue = {
  showAlert?: (alert: Alert) => void
}

export type AlertProviderProps = React.PropsWithChildren<{}>

export const context = React.createContext<AlertProvideValue>({})

const defaultAnchor: SnackbarOrigin = { vertical: 'top', horizontal: 'right' }

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alertSate, setAlertState] = useState<AlertState>({})

  const showAlert = useCallback((alert: Alert) => {
    setAlertState((state) => ({ ...state, [nanoid()]: alert }))
  }, [])

  const removeAlert = useCallback((key: string) => {
    setAlertState((state) => {
      const newState = { ...state }
      delete newState[key]
      return newState
    })
  }, [])

  const value = useMemo<AlertProvideValue>(
    () => ({
      showAlert
    }),
    []
  )

  function renderAlert(key: string) {
    const alert = alertSate[key]
    return (
      <Snackbar
        open={!!alert}
        autoHideDuration={3000}
        onClose={() => removeAlert(key)}
        anchorOrigin={defaultAnchor}
      >
        <Alert onClose={() => removeAlert(key)} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    )
  }

  return (
    <context.Provider value={value}>
      {Object.keys(alertSate).map(renderAlert)}
      {children}
    </context.Provider>
  )
}
