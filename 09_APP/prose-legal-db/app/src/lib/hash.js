/**
 * Hash Utilities
 * 
 * SHA-256 hashing for file integrity verification.
 * Web-compatible using Web Crypto API.
 */

/**
 * Calculate SHA-256 hash of content
 * 
 * @param {string} content - Content to hash
 * @returns {Promise<string>} Hexadecimal hash string
 */
export async function calculateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate hash of file (for file integrity)
 * 
 * @param {File} file - File object to hash
 * @returns {Promise<string>} Hexadecimal hash string
 */
export async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify file integrity by comparing hash
 * 
 * @param {string} content - Content to verify
 * @param {string} expectedHash - Expected hash value
 * @returns {Promise<boolean>} True if hash matches
 */
export async function verifyHash(content: string, expectedHash: string): Promise<boolean> {
  const actualHash = await calculateHash(content);
  return actualHash.toLowerCase() === expectedHash.toLowerCase();
}

