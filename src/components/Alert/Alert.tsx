import { SnackbarOrigin } from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useSnackbar, SnackbarProvider } from 'notistack'

import React, { useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'

export type Alert = {
  severity: 'success' | 'error' | 'info'
  message: string
}

export type AlertState = {
  [key: string]: Alert
}

export type AlertProvideValue = {
  showAlert?: (alert: Alert) => void
  showMultipleAlerts?: (alertState: AlertState) => void
}

export type AlertProviderProps = React.PropsWithChildren<{}>

export const context = React.createContext<AlertProvideValue>({})

const defaultAnchor: SnackbarOrigin = { vertical: 'top', horizontal: 'right' }

export const AlertProviderWithContext = ({ children }: AlertProviderProps) => {
  const { enqueueSnackbar } = useSnackbar()

  const showAlert = useCallback((alert: Alert) => {
    enqueueSnackbar(alert.message, {
      key: nanoid(),
      variant: alert.severity,
      anchorOrigin: defaultAnchor
    })
  }, [])

  const showMultipleAlerts = useCallback((alertState: AlertState) => {
    Object.keys(alertState).forEach((key) => {
      const alert = alertState[key]
      enqueueSnackbar(alert.message, {
        key: key,
        variant: alert.severity,
        anchorOrigin: defaultAnchor
      })
    })
  }, [])

  const value = useMemo<AlertProvideValue>(
    () => ({
      showAlert,
      showMultipleAlerts
    }),
    []
  )

  return <context.Provider value={value}>{children}</context.Provider>
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  return (
    <SnackbarProvider maxSnack={10}>
      <AlertProviderWithContext>{children}</AlertProviderWithContext>
    </SnackbarProvider>
  )
}
