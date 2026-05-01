import { getDB } from './db.js';

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function createTask(data) {
  const db = await getDB();
  const task = {
    id: uuid(),
    title: '',
    description: '',
    workspace: 'personal',
    priority: 'medium',
    dueDate: null,
    dueTime: null,
    notifications: [],
    prepNotes: '',
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  };
  await db.put('tasks', task);
  return task;
}

export async function updateTask(id, data) {
  const db = await getDB();
  const existing = await db.get('tasks', id);
  if (!existing) throw new Error(`Task ${id} not found`);
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await db.put('tasks', updated);
  return updated;
}

export async function deleteTask(id) {
  const db = await getDB();
  await db.delete('tasks', id);
}

export async function completeTask(id) {
  return updateTask(id, { completed: true, completedAt: new Date().toISOString() });
}

export async function uncompleteTask(id) {
  return updateTask(id, { completed: false, completedAt: null });
}

export async function getAllTasks() {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function getTasksByWorkspace(workspace) {
  const db = await getDB();
  const all = await db.getAll('tasks');
  return all.filter(t => t.workspace === workspace);
}

export async function getTodayTasks() {
  const db = await getDB();
  const today = todayStr();
  const all = await db.getAll('tasks');
  return all.filter(t => t.dueDate === today || (!t.dueDate && !t.completed));
}

export async function getTaskById(id) {
  const db = await getDB();
  return db.get('tasks', id);
}
