import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, set, update, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAoUFNIEeEYaOR_O5e2gwzsd4i4xFMEW8s",
  authDomain: "musicmaster-scores.firebaseapp.com",
  databaseURL: "https://musicmaster-scores-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "musicmaster-scores",
  storageBucket: "musicmaster-scores.firebasestorage.app",
  messagingSenderId: "301436949941",
  appId: "1:301436949941:web:914df8bd40e1e0993cf5fc"
}

let app = null
let db = null

function getDb() {
  if (!db) {
    app = initializeApp(firebaseConfig)
    db = getDatabase(app)
  }
  return db
}

/**
 * Save players and records to Firebase using granular updates
 * to avoid overwriting other devices' changes.
 */
export async function saveToCloud(players, playerRecords) {
  try {
    const database = getDb()
    const updates = {}
    updates['gameData/players'] = players
    updates['gameData/lastUpdated'] = Date.now()
    // Write each player's records individually so we don't overwrite others
    for (const [playerId, record] of Object.entries(playerRecords)) {
      updates[`gameData/playerRecords/${playerId}`] = record
    }
    await update(ref(database), updates)
  } catch (e) {
    console.warn('[Firebase] save error:', e.message)
  }
}

/**
 * Save only a specific player's badge (most common write operation).
 * This is safer than saving everything — avoids overwriting other players' data.
 */
export async function savePlayerBadges(playerId, badges) {
  try {
    const database = getDb()
    await set(ref(database, `gameData/playerRecords/${playerId}/badges`), badges)
    await set(ref(database, 'gameData/lastUpdated'), Date.now())
  } catch (e) {
    console.warn('[Firebase] save badge error:', e.message)
  }
}

/**
 * Load players and records from Firebase (one-time read)
 */
export async function loadFromCloud() {
  try {
    const database = getDb()
    const snapshot = await get(ref(database, 'gameData'))
    if (snapshot.exists()) {
      return snapshot.val()
    }
  } catch (e) {
    console.warn('[Firebase] load error:', e.message)
  }
  return null
}

/**
 * Subscribe to real-time updates from Firebase
 */
export function subscribeToCloud(callback) {
  try {
    const database = getDb()
    const unsubscribe = onValue(ref(database, 'gameData'), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val())
      }
    })
    return unsubscribe
  } catch (e) {
    console.warn('[Firebase] subscribe error:', e.message)
    return () => {}
  }
}
