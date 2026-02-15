'use client';

import { pullUserFromCloud } from './sync';
import { loadUser, saveUser } from './storage';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  createdAt: string;
}

const USERS_KEY = 'lumeiq_users';
const SESSION_KEY = 'lumeiq_session';

function getUsers(): AuthUser[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Simple hash for local-only auth (not meant to be secure — it's on-device)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + str.length;
}

export function getPasswordHash(password: string): string {
  return simpleHash(password);
}

export function signup(email: string, password: string, name: string): { user: Omit<AuthUser, 'passwordHash'>; error?: never } | { error: string; user?: never } {
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'An account with this email already exists' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  const newUser: AuthUser = {
    id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    email: email.toLowerCase().trim(),
    name: name.trim() || null,
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  setSession(newUser);

  const { passwordHash: _, ...safe } = newUser;
  return { user: safe };
}

export async function login(email: string, password: string): Promise<{ user: Omit<AuthUser, 'passwordHash'>; error?: never } | { error: string; user?: never }> {
  const users = getUsers();
  const found = users.find(u => u.email === email.toLowerCase().trim());
  const hash = simpleHash(password);

  if (found) {
    if (found.passwordHash !== hash) {
      return { error: 'Incorrect password' };
    }
    setSession(found);
    const { passwordHash: _, ...safe } = found;
    return { user: safe };
  }

  // Not found locally — try pulling from cloud
  const cloudUser = await pullUserFromCloud(email.toLowerCase().trim(), hash);
  if (cloudUser) {
    saveUser(cloudUser);
    const authUser: AuthUser = {
      id: cloudUser.id,
      email: email.toLowerCase().trim(),
      name: null,
      passwordHash: hash,
      createdAt: cloudUser.createdAt.toISOString(),
    };
    const localUsers = getUsers();
    localUsers.push(authUser);
    saveUsers(localUsers);
    setSession(authUser);
    const { passwordHash: _, ...safe } = authUser;
    return { user: safe };
  }

  return { error: 'No account found with this email' };
}

export function getSession(): Omit<AuthUser, 'passwordHash'> | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getSessionWithHash(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  const found = users.find(u => u.id === session.id);
  return found || null;
}

function setSession(user: AuthUser) {
  const { passwordHash: _, ...safe } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
