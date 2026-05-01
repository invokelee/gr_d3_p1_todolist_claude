/* IndexedDB wrapper using idb (loaded via CDN as window.idb) */

const DB_NAME = 'flowo-db';
const DB_VERSION = 1;

let dbPromise = null;

export function initDB() {
  if (!dbPromise) {
    dbPromise = window.idb.openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tasks')) {
          const tasks = db.createObjectStore('tasks', { keyPath: 'id' });
          tasks.createIndex('dueDate',   'dueDate',   { unique: false });
          tasks.createIndex('workspace', 'workspace', { unique: false });
          tasks.createIndex('completed', 'completed', { unique: false });
        }

        if (!db.objectStoreNames.contains('flashNotes')) {
          db.createObjectStore('flashNotes', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function getDB() {
  if (!dbPromise) await initDB();
  return dbPromise;
}
