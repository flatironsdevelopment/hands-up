import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Fab from '@mui/material/Fab'
import styled from '@emotion/styled'

const ELEMENT_HEIGHT = 56 + 10

type Props = React.PropsWithChildren<{
  icon: React.ReactNode
}>

const Container = styled.div`
  display: flex;
  position: relative;
  width: 56px;
  height: 56px;
  margin-top: 15px;
  margin-right: 10px;
`

const ExpandableContainer = styled.div<{ height: number; isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  position: absolute;

  height: 0px;
  overflow: hidden;
  transition: all 0.7s;
  transition-timing-function: ease-in-out;
  visibility: collapse;

  ${(p) =>
    p.isOpen &&
    `
    transform: translateY(${-p.height}px);
    visibility: visible;
    height: ${p.height}px;
  `}
`

const ExpandableItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`

const ExpandableButton = styled.div`
  position: absolute;
`

export const ExpandableFab = React.forwardRef<any, Props>(
  ({ icon, children, ...props }, ref) => {
    const elements = React.Children.count(children)
    const [isOpen, setIsOpen] = useState(false)
    const height = useMemo(() => ELEMENT_HEIGHT * elements, [elements])
    const closeRef = useRef<any>()

    const cancelTimeout = useCallback(() => {
      closeRef.current && clearTimeout(closeRef.current)
      closeRef.current = null
    }, [])

    const show = useCallback(() => {
      cancelTimeout()
      setIsOpen(true)
    }, [])

    const hide = useCallback(() => {
      closeRef.current = setTimeout(() => setIsOpen(false), 500)
    }, [])

    useEffect(() => {
      return () => cancelTimeout()
    }, [])

    return (
      <Container onMouseOver={show} onMouseLeave={hide}>
        <ExpandableContainer height={height} isOpen={isOpen}>
          {React.Children.map(children, (child, index) => (
            <ExpandableItem key={`item:${index}`}>{child}</ExpandableItem>
          ))}
        </ExpandableContainer>
        <ExpandableButton>
          <Fab ref={ref} color='primary' aria-label='show' {...props}>
            {icon}
          </Fab>
        </ExpandableButton>
      </Container>
    )
  }
)
