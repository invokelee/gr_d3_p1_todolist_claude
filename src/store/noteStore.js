import { getDB } from './db.js';
import { createTask } from './taskStore.js';

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function createNote(content) {
  const db = await getDB();
  const note = {
    id: uuid(),
    content,
    convertedToTaskId: null,
    createdAt: new Date().toISOString(),
  };
  await db.put('flashNotes', note);
  return note;
}

export async function deleteNote(id) {
  const db = await getDB();
  await db.delete('flashNotes', id);
}

export async function convertToTask(noteId, taskData) {
  const db = await getDB();
  const note = await db.get('flashNotes', noteId);
  if (!note) throw new Error(`Note ${noteId} not found`);
  const task = await createTask(taskData);
  await db.put('flashNotes', { ...note, convertedToTaskId: task.id });
  return task;
}

export async function getAllNotes() {
  const db = await getDB();
  return db.getAll('flashNotes');
}
