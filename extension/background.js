importScripts('external/firebase-app.js', 'external/firebase-auth.js')

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
}

firebase.initializeApp(firebaseConfig)

const provider = new firebase.auth.GoogleAuthProvider()

function getCredentials() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (!token) reject()
      else resolve(firebase.auth.GoogleAuthProvider.credential(null, token))
    })
  })
}

async function authenticate() {
  try {
    const credential = await getCredentials()
    const result = await firebase.auth().signInWithCredential(credential)
    const { uid: id, displayName: name, photoURL: photo } = result.user
    return { id, name, photo }
  } catch (error) {
    console.error(error)
    return null
  }
}

// USER AUTH METHODS
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg == 'authenticate') {
    authenticate().then(response).catch(response)
  }
  return true
})

console.log('Background initialized.')
