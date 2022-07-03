import { useContext } from 'react'
import { context } from './Alert'

export const useAlert = () => {
  return useContext(context)
}
