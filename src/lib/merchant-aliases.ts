/**
 * Merchant Alias System
 * Maps merchant variations to canonical names for better duplicate detection
 */

interface MerchantAliasRule {
  patterns: RegExp[];
  canonicalName: string;
}

const merchantAliases: MerchantAliasRule[] = [
  // Uber services
  {
    patterns: [/^UBER$/i, /UBER TRIP/i, /UBER EATS/i, /UBER ONE/i],
    canonicalName: 'Uber',
  },

  // Airlines
  {
    patterns: [/UNITED AIRLINES/i, /United Airlines/i],
    canonicalName: 'United Airlines',
  },
  {
    patterns: [/DELTA AIR LINES/i, /DELTA AIR/i],
    canonicalName: 'Delta Air Lines',
  },
  {
    patterns: [/AMERICAN AIRLINES/i],
    canonicalName: 'American Airlines',
  },
  {
    patterns: [/AIR FRANCE/i],
    canonicalName: 'Air France',
  },

  // DoorDash
  {
    patterns: [/DOORDASH/i, /BT\*DD/i, /DD \*DOORDASH/i, /DD \*DOORDASHDASHPASS/i],
    canonicalName: 'DoorDash',
  },

  // Amazon
  {
    patterns: [/^AMAZON$/i, /AMAZON MX MARKETPLACE/i, /AMAZON MARKEPLACE/i, /AMAZONPRIME/i],
    canonicalName: 'Amazon',
  },

  // Canteen
  {
    patterns: [/CANTEEN/i, /CTLP\*CANTEEN/i, /Canteen/i],
    canonicalName: 'Canteen',
  },

  // Google services
  {
    patterns: [/GOOGLE\*WORKSPACE/i, /GOOGLE ONE/i, /GOOGLE\*GOOGLE ONE/i],
    canonicalName: 'Google',
  },
  {
    patterns: [/YOUTUBE TV/i, /YOUTUBE VIDEOS/i, /GOOGLE\*YOUTUBE/i, /GOOGLE \*YOUTUBE/i, /GOOGLE\*YT PRIMETIME/i],
    canonicalName: 'YouTube',
  },

  // Anthropic
  {
    patterns: [/CLAUDE\.AI/i, /ANTHROPIC/i],
    canonicalName: 'Anthropic',
  },

  // OpenAI
  {
    patterns: [/OPENAI/i, /CHATGPT/i],
    canonicalName: 'OpenAI',
  },

  // UW Madison
  {
    patterns: [/TCP\*UWMADISONHSG/i, /UW MADISON/i, /UW MADISON WISC UNION/i],
    canonicalName: 'UW Madison',
  },

  // Bilt Rewards
  {
    patterns: [/BILT RENT/i, /BILT REWARDS/i],
    canonicalName: 'Bilt',
  },

  // Instacart
  {
    patterns: [/INSTACART/i, /IC\* INSTACART/i, /IC\* COSTCO/i],
    canonicalName: 'Instacart',
  },

  // Levy (stadium concessions)
  {
    patterns: [/LEVY@/i, /LEVY@ 2UWM CONC/i],
    canonicalName: 'Levy',
  },

  // Monday's
  {
    patterns: [/MONDAY'S/i, /MONDAY`S/i, /MONDAY[`']S/i],
    canonicalName: "Monday's",
  },

  // Orpheum Theater
  {
    patterns: [/ORPHEUM THEATER/i, /THE ORPHEUM THEATER/i],
    canonicalName: 'Orpheum Theater',
  },

  // Cell phone providers
  {
    patterns: [/TELEFONICA.*PEGASO/i],
    canonicalName: 'Telefonica',
  },
  {
    patterns: [/ATT MOB/i],
    canonicalName: 'AT&T',
  },
];

/**
 * Get canonical merchant name from a transaction description
 * Returns null if no alias found
 */
export function getCanonicalMerchantName(description: string): string | null {
  for (const alias of merchantAliases) {
    for (const pattern of alias.patterns) {
      if (pattern.test(description)) {
        return alias.canonicalName;
      }
    }
  }
  return null;
}

/**
 * Normalize merchant name for comparison
 * Uses aliases if available, otherwise returns cleaned description
 */
export function normalizeMerchantForComparison(description: string): string {
  const canonical = getCanonicalMerchantName(description);
  if (canonical) {
    return canonical;
  }

  // Fallback to basic normalization
  return description
    .replace(/^(BT\*DD \*DOORDASH|DD \*DOORDASH|IC\*|TST\*|PAYPAL \*|GOOGLE\*|SQSP\*|CTLP\*)\s*/i, '')
    .replace(/\s+\d{10}$/i, '')
    .replace(/\s+#\d+$/i, '')
    .replace(/\s+\d{4,}$/i, '')
    .toUpperCase()
    .trim();
}

/**
 * Check if two transaction descriptions refer to the same merchant
 */
export function isSameMerchant(description1: string, description2: string): boolean {
  const merchant1 = normalizeMerchantForComparison(description1);
  const merchant2 = normalizeMerchantForComparison(description2);

  return merchant1 === merchant2;
}
