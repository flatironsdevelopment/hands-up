import {
  ref,
  set,
  push,
  onChildAdded,
  query,
  orderByChild,
  startAfter,
  child,
  get
} from 'firebase/database'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useState } from 'react'
import { db } from '../../firebase'

const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min * 1) + min)

const randomPosAndNeg = (min, max) => {
  let signal = Math.floor(Math.random() * 2) === 1 ? 1 : -1
  return randomNumber(min, max) * signal
}

const getPosition = () => ({
  size: randomNumber(2, 5),
  left: randomNumber(0, 100),
  firstPoint: randomPosAndNeg(0, 100),
  secondPoint: randomPosAndNeg(0, 100)
})

export type PositionProps = ReturnType<typeof getPosition>

export type ReactionItem = {
  id: string
  emoji: string
  position: PositionProps
  createdAt: number
}

export type ReactionsSnapshot = {
  [key: string]: ReactionItem
}

export const buildReaction = (emoji: string) =>
  ({
    position: getPosition(),
    emoji,
    id: nanoid(),
    createdAt: new Date().getTime()
  } as ReactionItem)

const collection = '/reactions'
const allowedReactionsCollection = '/allowed-reactions'

export function listenReactions(
  meetId: string,
  callback: (reaction: ReactionItem) => void
) {
  const reactionsQuery = query(
    ref(db, `${collection}/${meetId}`),
    orderByChild('createdAt'),
    startAfter(new Date().getTime())
  )
  onChildAdded(reactionsQuery, (data) => callback(data.val()))
}

export async function getAllowedReactions(): Promise<string[]> {
  const dbRef = ref(db)
  const snapshot = await get(child(dbRef, allowedReactionsCollection))
  if (snapshot.exists()) {
    return snapshot.val()
  } else {
    return []
  }
}

export function addNewReaction(meetId: string, element: ReactionItem) {
  const reactions = ref(db, `${collection}/${meetId}`)
  set(push(reactions), element).then()
}

const ALLOWED_REACTIONS = ['😍', '🤯', '😂', '🥳', '💖', '👏', '😅', '💯']

export const useReactions = ({ meetId }: { meetId: string }) => {
  const [reactions, setReactions] = useState<ReactionsSnapshot>({})
  const [allowedReactions, setAllowedReactions] =
    useState<string[]>(ALLOWED_REACTIONS)

  const addReaction = useCallback(
    (emoji: string) => {
      const qty = randomNumber(1, 30)
      new Array(qty).fill(null).forEach((_, index) => {
        setTimeout(
          () => addNewReaction(meetId, buildReaction(emoji)),
          index * 100
        )
      })
    },
    [meetId]
  )

  useEffect(() => {
    console.log('Listening to reactions')
    return listenReactions(meetId, (reaction: ReactionItem) => {
      setReactions((reactions) => ({ ...reactions, [reaction.id]: reaction }))
    })
  }, [meetId])

  useEffect(() => {
    getAllowedReactions().then((allowedReactions) => {
      console.log({ allowedReactions })
      if (allowedReactions && allowedReactions.length > 0) {
        setAllowedReactions(allowedReactions)
      }
    })
  }, [])

  return { allowedReactions, reactions, addReaction }
}
