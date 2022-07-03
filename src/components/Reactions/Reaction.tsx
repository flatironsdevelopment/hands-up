import React from 'react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { PositionProps } from './hooks'

const floatAnimation = (p: PositionProps) => keyframes`
  0 {
    bottom: 0%;
    transform: translateX(0);
  }

  50% {
    transform: translateX(${p.firstPoint}px);
  }

  100% {
    transform: translateX(${p.secondPoint}px);
    bottom: 110%;
  }
`
const ReactionEmoji = styled.div<PositionProps>`
  position: absolute;
  bottom: -5%;
  left: ${(p) => p.left}%;
  z-index: 9999;
  font-size: ${(p) => p.size}rem;
  animation: ${floatAnimation} ${(p) => (p.size < 3 ? 3 : 4)}s ease-in forwards;
`

export type ReactionProps = {
  emoji: string
  position: PositionProps
}

export const Reaction = ({ emoji, position }: ReactionProps) => {
  return <ReactionEmoji {...position}>{emoji}</ReactionEmoji>
}
