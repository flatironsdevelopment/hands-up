// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue, onDisconnect } from 'firebase/database'
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'
import { MeetSnapshot, User } from 'types'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
}

const collection = '/hands-up'
const provider = new GoogleAuthProvider()

export const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth()
export const handsUpUserKey = 'hands-up-user'

export function getHandsUp(
  meetId: string,
  callback: (snapshot: MeetSnapshot) => void
) {
  return onValue(ref(db, `${collection}/${meetId}`), (snapshot) => {
    callback(snapshot.val())
  })
}

export function setHandsUp(meetId: string, element: User) {
  set(ref(db, `${collection}/${meetId}/users:${element.id}`), element).then()
}

export function getLocalUser(): User {
  try {
    const localUser = localStorage.getItem(handsUpUserKey)
    return localUser ? JSON.parse(localUser) : null
  } catch {
    return null
  }
}

export function setLocalUser(user: User) {
  localStorage.setItem(handsUpUserKey, JSON.stringify(user))
  return user
}

export async function devAuthenticate() {
  try {
    const result = await signInWithPopup(auth, provider)
    const { uid: id, displayName: name, photoURL: photo } = result.user
    const user = { id, name, photo } as User
    return setLocalUser(user)
  } catch (error) {
    console.error(error.message)
    return null
  }
}

export async function authenticate(): Promise<User> {
  const localUser = getLocalUser()
  if (localUser) return localUser

  if (process.env.REACT_APP_CHROME_EXTENSION) {
    return new Promise((resolve) => {
      window['chrome'].runtime.sendMessage('authenticate', (user) => {
        if (user) resolve(setLocalUser(user))
        else resolve(null)
      })
    })
  } else {
    return devAuthenticate()
  }
}

export async function listenDisconnect(meetId: string, user: User) {
  const userLastOnlineRef = ref(db, `${collection}/${meetId}/users:${user.id}`)
  onDisconnect(userLastOnlineRef).set({
    ...user,
    isHandUp: false,
    isConnected: false
  })
}
