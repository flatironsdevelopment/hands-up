import React from 'react'
import styled from '@emotion/styled'
import Fab from '@mui/material/Fab'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import Tooltip from '@mui/material/Tooltip'
import { ExpandableFab } from '../ExpandableFab/ExpandableFab'
import { Reaction } from './Reaction'
import { useReactions } from './hooks'

type Props = {
  meetId: string
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background: transparent;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
`

const ALLOWED_REACTIONS = ['😍', '🤯', '😂', '🥳', '💖', '👏']

export const Reactions = ({ meetId }: Props) => {
  const { reactions, addReaction } = useReactions({ meetId: meetId })

  function renderReaction(key: string) {
    const reactionItem = reactions[key]
    return (
      <Reaction
        key={key}
        position={reactionItem.position}
        emoji={reactionItem.emoji}
      />
    )
  }

  return (
    <>
      <Tooltip title='Reactions'>
        <ExpandableFab icon={<AddReactionIcon />}>
          {ALLOWED_REACTIONS.map((reaction, index) => (
            <Fab
              onClick={() => addReaction(reaction)}
              key={`btn-reaction-${index}`}
              color='primary'
              aria-label='show'
            >
              {reaction}
            </Fab>
          ))}
        </ExpandableFab>
      </Tooltip>
      <Container>{Object.keys(reactions).map(renderReaction)}</Container>
    </>
  )
}
