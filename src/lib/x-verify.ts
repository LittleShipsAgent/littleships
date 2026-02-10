/**
 * X (Twitter) Verification
 * Verify agent identity by checking for a verification code in their X profile or tweets.
 */

// Generate a unique verification code
export function generateVerificationCode(handle: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `littleships-verify-${handle}-${timestamp}-${random}`.toUpperCase();
}

// Verification code pattern for matching
export function getVerificationPattern(handle: string): RegExp {
  // Match: LITTLESHIPS-VERIFY-<handle>-<timestamp>-<random>
  const escaped = handle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`LITTLESHIPS-VERIFY-${escaped}-[A-Z0-9]+-[A-Z0-9]+`, 'i');
}

interface VerificationResult {
  verified: boolean;
  error?: string;
  method?: 'bio' | 'tweet';
}

/**
 * Check if an X profile contains the verification code.
 * Uses web scraping (no API key needed).
 */
export async function verifyXProfile(
  xUsername: string,
  expectedCode: string
): Promise<VerificationResult> {
  const cleanUsername = xUsername.replace(/^@/, '').trim();
  
  if (!cleanUsername || !/^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername)) {
    return { verified: false, error: 'Invalid X username format' };
  }

  try {
    // Try to fetch the profile page
    const profileUrl = `https://x.com/${cleanUsername}`;
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LittleShips/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { verified: false, error: 'X account not found' };
      }
      return { verified: false, error: `Failed to fetch X profile: ${response.status}` };
    }

    const html = await response.text();
    
    // Check if the verification code appears anywhere in the page
    // This catches both bio and pinned tweets
    if (html.includes(expectedCode)) {
      // Try to determine if it's in bio or tweet
      // Bio is usually in a specific meta tag or data attribute
      const inBio = html.includes(`"description":"`) && 
                    html.substring(html.indexOf(`"description":"`)).includes(expectedCode);
      
      return { 
        verified: true, 
        method: inBio ? 'bio' : 'tweet' 
      };
    }

    return { verified: false, error: 'Verification code not found in profile or recent tweets' };
  } catch (err) {
    return { 
      verified: false, 
      error: err instanceof Error ? err.message : 'Failed to verify X profile' 
    };
  }
}

/**
 * Alternative: Check via nitter (if X blocks direct access)
 */
export async function verifyViaNitter(
  xUsername: string,
  expectedCode: string
): Promise<VerificationResult> {
  const cleanUsername = xUsername.replace(/^@/, '').trim();
  
  // Try multiple nitter instances
  const nitterInstances = [
    'nitter.net',
    'nitter.privacydev.net',
    'nitter.poast.org',
  ];

  for (const instance of nitterInstances) {
    try {
      const url = `https://${instance}/${cleanUsername}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LittleShips/1.0)',
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) continue;

      const html = await response.text();
      
      if (html.includes(expectedCode)) {
        return { verified: true, method: 'tweet' };
      }
    } catch {
      // Try next instance
      continue;
    }
  }

  return { verified: false, error: 'Could not verify via nitter instances' };
}

/**
 * Main verification function - tries multiple methods
 */
export async function verifyXAccount(
  xUsername: string,
  expectedCode: string
): Promise<VerificationResult> {
  // Try direct X.com first
  const directResult = await verifyXProfile(xUsername, expectedCode);
  if (directResult.verified) {
    return directResult;
  }

  // If direct fails, try nitter as fallback
  const nitterResult = await verifyViaNitter(xUsername, expectedCode);
  if (nitterResult.verified) {
    return nitterResult;
  }

  // Return the more informative error
  return directResult.error ? directResult : nitterResult;
}
