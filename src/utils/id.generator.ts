import crypto from 'crypto';

export function generateId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let id = '';
  const bytes = crypto.randomBytes(6);
  
  for (let i = 0; i < 6; i++) {
    if (i === 3) {
      id += '-';
    }
    id += alphabet[bytes[i]! % alphabet.length];
  }
  return id;
}