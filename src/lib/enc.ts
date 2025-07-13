import crypto from "crypto";

// Constants
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-char-secret-key-here!!";
const ALGORITHM = 'aes-256-cbc';
const SALT = 'salt'; // You might want to use a different salt or make it configurable

/**
 * Encrypts an API key using AES-256-CBC encryption
 * @param apiKey - The plain text API key to encrypt
 * @returns The encrypted API key in the format: iv:encryptedText
 */
export function encryptApiKey(apiKey: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, SALT, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts an encrypted API key
 * @param encryptedApiKey - The encrypted API key in the format: iv:encryptedText
 * @returns The decrypted plain text API key
 * @throws Error if decryption fails
 */
export function decryptApiKey(encryptedApiKey: string): string {
  try {
    const textParts = encryptedApiKey.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = textParts.join(':');
    const key = crypto.scryptSync(ENCRYPTION_KEY, SALT, 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt API key: ' + (error as Error).message);
  }
}

/**
 * Safely gets the decrypted API key for a user
 * @param user - User object with aiProvider and apiKey fields
 * @param targetProvider - The AI provider to check for (e.g., "gemini")
 * @returns The decrypted API key if user has the target provider configured, undefined otherwise
 * @throws Error if decryption fails
 */
export function getUserApiKey(
  user: { aiProvider: string | null; apiKey: string | null }, 
  targetProvider: string = "gemini"
): string | undefined {
  if (user.aiProvider === targetProvider && user.apiKey) {
    return decryptApiKey(user.apiKey);
  }
  return undefined;
}

/**
 * Validates that the encryption key is properly configured
 * @returns true if encryption key is valid, false otherwise
 */
export function validateEncryptionKey(): boolean {
  return ENCRYPTION_KEY.length >= 32;
}

/**
 * Generates a random encryption key (for development/setup purposes)
 * @returns A randomly generated 32-character encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}