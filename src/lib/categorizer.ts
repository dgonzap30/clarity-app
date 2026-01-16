import type { CategoryId } from '@/types';
import type {
  CustomCategorizationRule,
  LearnedPattern,
  SplitCategorizationRule,
  SplitRuleCondition,
} from '@/types/settings';
import { normalizeMerchantName, fuzzyPatternMatch, fuzzyMatch } from './fuzzy-match';

interface CategoryRule {
  patterns: (string | RegExp)[];
  category: CategoryId;
  priority: number;
}

const categoryRules: CategoryRule[] = [
  // School & Housing (highest priority for big expenses)
  {
    patterns: [
      /TCP\*UWMADISONHSG/i,
      /BILT RENT/i,
      /BILT REWARDS/i,
      /UW MADISON/i,
      /UW MADISON WISC UNION/i,
      /UNIVERSITY BOOK/i,
      /REDEFINED-A-CAPPELLA/i,
    ],
    category: 'school-housing',
    priority: 100,
  },

  // Work & AI
  {
    patterns: [
      /CLAUDE\.AI/i,
      /ANTHROPIC/i,
      /OPENAI/i,
      /CHATGPT/i,
      /SUPABASE/i,
      /VERCEL/i,
      /650 INDUSTRIES/i,
      /SQSP\*/i,
      /RUNWAY/i,
      /CODERABBIT/i,
      /WINDSURF/i,
      /PERPLEXITY/i,
      /MOBBIN/i,
      /MOONFLASH/i,
      /GOOGLE\*WORKSPACE/i,
    ],
    category: 'work-ai',
    priority: 90,
  },

  // Transportation
  {
    patterns: [
      /^UBER$/i,
      /UBER TRIP/i,
      /UBER ONE/i,
      /LYFT/i,
      /UNITED AIRLINES/i,
      /United Airlines/i,
      /DELTA AIR LINES/i,
      /DELTA AIR/i,
      /AMERICAN AIRLINES/i,
      /AIR FRANCE/i,
    ],
    category: 'transportation',
    priority: 85,
  },

  // Nightlife (bars, clubs, nightlife apps)
  {
    patterns: [
      /TST\* THE DOUBLE U/i,
      /TST\* STATE STREET BRATS/i,
      /TST\* WHISKEY JACKS/i,
      /TST\* THE KOLLEGE KLUB/i,
      /TST\* CHASERS/i,
      /TST\* RED ROCK/i,
      /TST\* MOON BAR/i,
      /TST\* FREEHOUSE PUB/i,
      /TST\* ENO VINO/i,
      /TST\* VINTAGE SPIRITS/i,
      /TST\* RED - MADISON/i,
      /LINELEAP/i,
      /SOTTO NIGHT CLUB/i,
      /DOUBLE TAP MADISON/i,
      /WHISKEY JACKS/i,
      /RILEYS WINES/i,
      /BAR 27/i,
      /PAUL'S NEIGHBORHOOD BAR/i,
      /JAYS\s+MADISON/i,
      /WANDOS/i,
      /ABARR LA EUR/i,
    ],
    category: 'nightlife',
    priority: 80,
  },

  // Entertainment (streaming, movies, music)
  {
    patterns: [
      /NETFLIX/i,
      /SPOTIFY/i,
      /HBOMAX/i,
      /HBO MAX/i,
      /DISNEY PLUS/i,
      /YOUTUBE TV/i,
      /YOUTUBE VIDEOS/i,
      /GOOGLE\*YOUTUBE/i,
      /GOOGLE \*YOUTUBE/i,
      /GOOGLE\*YT PRIMETIME/i,
      /GOOGLE ONE/i,
      /GOOGLE\*GOOGLE ONE/i,
      /SPLICE/i,
      /SOUNDCLOUD/i,
      /MUSICVERTER/i,
      /KINDLE/i,
      /AMC THEATRE/i,
      /ORPHEUM THEATER/i,
      /THE ORPHEUM THEATER/i,
      /MILLENNIUMSIPOS\*CINEMA/i,
      /PARAMNTPLUS/i,
      /AMAZONPRIME/i,
      /TOUCHTUNES/i,
      /GOOGLE \*TV/i,
    ],
    category: 'entertainment',
    priority: 75,
  },

  // Health & Sports
  {
    patterns: [
      /GOLF MADISON/i,
      /WHOOP/i,
      /MYLAB BOX/i,
    ],
    category: 'health-sports',
    priority: 70,
  },

  // Groceries & Supplies
  {
    patterns: [
      /COSTCO/i,
      /IC\* COSTCO/i,
      /INSTACART/i,
      /IC\* INSTACART/i,
      /SUPERAMA/i,
      /TARGET/i,
      /STOP N SHOP/i,
      /WALMART/i,
      /HEB/i,
      /SAM'S CLUB/i,
      /TRADER JOE/i,
      /WHOLE FOODS/i,
    ],
    category: 'groceries-supplies',
    priority: 65,
  },

  // Eating Out & Delivery
  {
    patterns: [
      // Delivery services
      /UBER EATS/i,
      /DOORDASH/i,
      /BT\*DD/i,
      /DD \*DOORDASH/i,
      /DD \*DOORDASHDASHPASS/i,
      /RAPPI/i,
      /GRUBHUB/i,
      // Fast food
      /CHIPOTLE/i,
      /QDOBA/i,
      /TACO BELL/i,
      /RAISING CANES/i,
      /JIMMY JOHNS/i,
      /DOMINO'S/i,
      // Coffee shops
      /STARBUCKS/i,
      /BARRIQUES/i,
      // Restaurants
      /GANDHI/i,
      /JAPONEZ/i,
      /ASIAN KITCHEN/i,
      /IANSPIZZA/i,
      /PAULS PEL'MENI/i,
      /FRESH MADISON/i,
      /MONDAY[`']S/i,
      /TST\* THE STUFFED OLIVE/i,
      /Bassett Street Brunch/i,
      /ZAZA SNACKS/i,
      /PARADIES-MADTOWN/i,
      /CANTEEN/i,
      /CTLP\*CANTEEN/i,
      /LEVY@/i,
    ],
    category: 'eating-out-delivery',
    priority: 60,
  },

  // Shopping & Retail
  {
    patterns: [
      /NORDSTROM/i,
      /MASSIMO DUTTI/i,
      /ZARA/i,
      /H&M/i,
      /MACY'S/i,
      /GAP/i,
    ],
    category: 'shopping-retail',
    priority: 55,
  },

  // Personal (electronics, misc - catch-all for personal expenses)
  {
    patterns: [
      /AMAZON/i,
      /AMAZON MX MARKETPLACE/i,
      /AMAZON MARKEPLACE/i,
      /APPLE\.COM/i,
      /PAYPAL \*APPLE/i,
      /PAYPAL \*MICROSOFT/i,
      /PAYPAL \*NESPRESSO/i,
      /TELEFONICA.*PEGASO/i,
      /ATT MOB/i,
    ],
    category: 'personal',
    priority: 50,
  },
];

/**
 * Evaluates a split rule condition
 */
function evaluateSplitCondition(
  condition: SplitRuleCondition,
  amount: number,
  date?: Date,
  description?: string
): boolean {
  switch (condition.type) {
    case 'amount':
      const amountValue = typeof condition.value === 'number' ? condition.value : parseFloat(condition.value);
      switch (condition.operator) {
        case 'gt':
          return amount > amountValue;
        case 'lt':
          return amount < amountValue;
        case 'eq':
          return Math.abs(amount - amountValue) < 0.01; // Floating point tolerance
        case 'between':
          if (condition.valueEnd !== undefined) {
            return amount >= amountValue && amount <= condition.valueEnd;
          }
          return false;
        default:
          return false;
      }

    case 'time':
      if (!date) return false;
      const hour = date.getHours();
      const timeValue = typeof condition.value === 'number' ? condition.value : parseInt(condition.value, 10);
      switch (condition.operator) {
        case 'gt':
          return hour > timeValue;
        case 'lt':
          return hour < timeValue;
        case 'eq':
          return hour === timeValue;
        case 'between':
          if (condition.valueEnd !== undefined) {
            return hour >= timeValue && hour <= condition.valueEnd;
          }
          return false;
        default:
          return false;
      }

    case 'dayOfWeek':
      if (!date) return false;
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const dayValue = typeof condition.value === 'number' ? condition.value : parseInt(condition.value, 10);
      switch (condition.operator) {
        case 'eq':
          return dayOfWeek === dayValue;
        case 'between':
          if (condition.valueEnd !== undefined) {
            return dayOfWeek >= dayValue && dayOfWeek <= condition.valueEnd;
          }
          return false;
        default:
          return false;
      }

    case 'description':
      if (!description) return false;
      const searchValue = String(condition.value).toLowerCase();
      const descLower = description.toLowerCase();
      switch (condition.operator) {
        case 'contains':
          return descLower.includes(searchValue);
        case 'eq':
          return descLower === searchValue;
        default:
          return false;
      }

    default:
      return false;
  }
}

/**
 * Check if a split rule matches (context-dependent categorization)
 */
function checkSplitRules(
  description: string,
  merchant: string,
  amount: number,
  date: Date | undefined,
  splitRules: SplitCategorizationRule[]
): CategoryId | null {
  for (const rule of splitRules) {
    // Check if merchant pattern matches
    let merchantMatches = false;

    if (rule.isRegex) {
      try {
        const regex = new RegExp(rule.merchantPattern, 'i');
        merchantMatches = regex.test(description) || regex.test(merchant);
      } catch {
        // Invalid regex, skip
        continue;
      }
    } else {
      const pattern = rule.merchantPattern.toUpperCase();
      const descUpper = description.toUpperCase();
      const merchantUpper = merchant.toUpperCase();
      merchantMatches = descUpper.includes(pattern) || merchantUpper.includes(pattern);
    }

    if (!merchantMatches) continue;

    // Check conditions to find specific category
    for (const conditionRule of rule.conditions) {
      if (evaluateSplitCondition(conditionRule.condition, amount, date, description)) {
        return conditionRule.categoryId;
      }
    }

    // If merchant matches but no conditions match, use default category
    return rule.defaultCategoryId;
  }

  return null;
}

/**
 * Check if a learned pattern matches the description
 * Enhanced with fuzzy matching
 */
function checkLearnedPatterns(
  description: string,
  merchant: string,
  learnedPatterns: LearnedPattern[]
): CategoryId | null {
  const normalizedMerchant = normalizeMerchantName(merchant);
  const normalizedDescription = description.toLowerCase();

  for (const pattern of learnedPatterns) {
    // Only use patterns with confidence > 0.7
    if (pattern.confidence < 0.7) continue;

    const normalizedPattern = normalizeMerchantName(pattern.merchantPattern);

    // Try exact match first (case-insensitive)
    if (
      normalizedMerchant.includes(normalizedPattern) ||
      normalizedDescription.includes(normalizedPattern)
    ) {
      return pattern.categoryId;
    }

    // Try fuzzy match for high-confidence patterns
    if (pattern.confidence >= 0.8) {
      const merchantSimilarity = fuzzyMatch(normalizedPattern, normalizedMerchant, {
        normalizeFirst: false, // Already normalized
      });
      const descSimilarity = fuzzyMatch(normalizedPattern, normalizedDescription, {
        normalizeFirst: false,
      });

      // Use fuzzy match if similarity is high enough
      if (merchantSimilarity >= 0.85 || descSimilarity >= 0.85) {
        return pattern.categoryId;
      }
    }
  }

  return null;
}

/**
 * Check if a custom rule matches the description
 * Enhanced with advanced matching options
 */
function checkCustomRules(
  description: string,
  amount: number,
  customRules: CustomCategorizationRule[]
): CategoryId | null {
  // Sort by priority (highest first)
  const sortedRules = [...customRules].sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    // Check amount filters first (quick rejection)
    if (rule.minAmount !== undefined && amount < rule.minAmount) continue;
    if (rule.maxAmount !== undefined && amount > rule.maxAmount) continue;

    // Check exclude patterns
    if (rule.excludePatterns && rule.excludePatterns.length > 0) {
      const shouldExclude = rule.excludePatterns.some((excludePattern) => {
        const descCheck = rule.caseSensitive
          ? description
          : description.toLowerCase();
        const patternCheck = rule.caseSensitive
          ? excludePattern
          : excludePattern.toLowerCase();
        return descCheck.includes(patternCheck);
      });

      if (shouldExclude) continue;
    }

    // Check main pattern
    let matches = false;

    if (rule.isRegex) {
      // Regex matching
      try {
        const flags = rule.caseSensitive ? '' : 'i';
        const regex = new RegExp(rule.pattern, flags);
        matches = regex.test(description);
      } catch {
        // Invalid regex, skip
        continue;
      }
    } else {
      // String matching with matchType
      const descCheck = rule.caseSensitive ? description : description.toLowerCase();
      const patternCheck = rule.caseSensitive ? rule.pattern : rule.pattern.toLowerCase();

      switch (rule.matchType) {
        case 'exact':
          matches = descCheck === patternCheck;
          break;

        case 'startsWith':
          matches = descCheck.startsWith(patternCheck);
          break;

        case 'endsWith':
          matches = descCheck.endsWith(patternCheck);
          break;

        case 'fuzzy':
          matches = fuzzyPatternMatch(description, rule.pattern, 0.75);
          break;

        case 'contains':
        default:
          matches = descCheck.includes(patternCheck);
          break;
      }
    }

    if (matches) {
      return rule.categoryId;
    }
  }

  return null;
}

/**
 * Check built-in rules
 */
function checkBuiltInRules(description: string): CategoryId {
  const sortedRules = [...categoryRules].sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    for (const pattern of rule.patterns) {
      if (typeof pattern === 'string') {
        if (description.toUpperCase().includes(pattern.toUpperCase())) {
          return rule.category;
        }
      } else {
        if (pattern.test(description)) {
          return rule.category;
        }
      }
    }
  }

  return 'uncategorized';
}

/**
 * Categorize a transaction using:
 * 1. Split rules (context-dependent - highest priority)
 * 2. Learned patterns (user corrections)
 * 3. Custom user rules
 * 4. Built-in rules
 */
export function categorizeTransaction(
  description: string,
  customRules: CustomCategorizationRule[] = [],
  learnedPatterns: LearnedPattern[] = [],
  splitRules: SplitCategorizationRule[] = [],
  amount = 0,
  date?: Date
): CategoryId {
  const merchant = extractMerchantName(description);

  // 1. Check split rules first (context-dependent categorization)
  if (splitRules.length > 0) {
    const splitMatch = checkSplitRules(description, merchant, amount, date, splitRules);
    if (splitMatch) {
      return splitMatch;
    }
  }

  // 2. Check learned patterns (user corrections take precedence)
  const learnedMatch = checkLearnedPatterns(description, merchant, learnedPatterns);
  if (learnedMatch) {
    return learnedMatch;
  }

  // 3. Check custom user rules
  const customMatch = checkCustomRules(description, amount, customRules);
  if (customMatch) {
    return customMatch;
  }

  // 4. Fall back to built-in rules
  return checkBuiltInRules(description);
}

/**
 * Legacy function for backward compatibility (without custom rules/patterns)
 */
export function categorizeTransactionSimple(description: string): CategoryId {
  return checkBuiltInRules(description);
}

export function extractMerchantName(description: string): string {
  let merchant = description
    .replace(/^BT\*DD \*DOORDASH /i, '')
    .replace(/^DD \*DOORDASH/i, 'DOORDASH')
    .replace(/^IC\* /i, '')
    .replace(/^TST\* /i, '')
    .replace(/^PAYPAL \*/i, '')
    .replace(/^GOOGLE\*/i, 'GOOGLE ')
    .replace(/^SQSP\* /i, 'SQUARESPACE ')
    .replace(/^CTLP\*/i, '');

  merchant = merchant
    .replace(/\s+(MADISON|SAN FRANCISCO|NEW YORK|MEXICO CITY|CIUDAD DE MEX|HOUSTON|BOSTON|SINGAPORE|LONDON|PALO ALTO|CUPERTINO|BELLEVILLE|MIDDLETON|CHARLOTTE|ATLANTA|NEWPORT BEACH|MOUNTAIN VIEW|WALNUT CREEK|COVINA|LOS ANGELES).*$/i, '');

  merchant = merchant
    .replace(/\s+\d{10}$/i, '')
    .replace(/\s+#\d+$/i, '')
    .replace(/\s+\d{4,}$/i, '');

  return merchant.trim();
}

export function extractLocation(description: string): string {
  // Exclude non-location patterns
  if (/AMZN\.COM\/BILL/i.test(description)) {
    return '';
  }

  const locationPattern = /(MADISON|SAN FRANCISCO|NEW YORK|MEXICO CITY|MEXICO D\.F\.|CD MEXICO|CIUDAD DE MEX|HOUSTON|BOSTON|SINGAPORE|LONDON|PALO ALTO|CUPERTINO|BELLEVILLE|MIDDLETON|CHARLOTTE|ATLANTA|NEWPORT BEACH|MOUNTAIN VIEW|WALNUT CREEK|COVINA|LOS ANGELES|SCHAUMBURG)/i;

  const match = description.match(locationPattern);
  if (match) {
    const location = match[1];

    // Normalize Mexico City variations
    if (/MEXICO D\.F\.|CD MEXICO/i.test(location)) {
      return 'MEXICO CITY';
    }

    return location;
  }

  return '';
}
