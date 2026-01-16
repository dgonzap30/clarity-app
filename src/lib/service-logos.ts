// Map known subscription services to their favicon/logo URLs
// Uses reliable CDN sources for favicons

export const SERVICE_LOGOS: Record<string, string> = {
  // Streaming
  'netflix': 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico',
  'spotify': 'https://open.spotifycdn.com/cdn/images/favicon32.b64ecc03.png',
  'apple-music': 'https://music.apple.com/assets/favicon/favicon-180.png',
  'youtube-premium': 'https://www.youtube.com/s/desktop/12d6b690/img/favicon_32x32.png',
  'youtube-music': 'https://www.youtube.com/s/desktop/12d6b690/img/favicon_32x32.png',
  'disney-plus': 'https://static-assets.bamgrid.com/product/disneyplus/favicons/favicon-32x32.png',
  'hbo-max': 'https://play.max.com/favicon.ico',
  'hulu': 'https://www.hulu.com/favicon.ico',
  'prime-video': 'https://www.amazon.com/favicon.ico',
  'peacock': 'https://www.peacocktv.com/favicon.ico',
  'paramount-plus': 'https://www.paramountplus.com/favicon.ico',
  'crunchyroll': 'https://static.crunchyroll.com/assets/v2/images/favicons/favicon-32x32.png',

  // Cloud Storage
  'icloud': 'https://www.apple.com/favicon.ico',
  'google-one': 'https://www.google.com/favicon.ico',
  'dropbox': 'https://cfl.dropboxstatic.com/static/images/favicon-vfl8lUR9B.ico',
  'onedrive': 'https://onedrive.live.com/favicon.ico',

  // Software/Productivity
  'microsoft-365': 'https://www.microsoft.com/favicon.ico',
  'adobe-cc': 'https://www.adobe.com/favicon.ico',
  'notion': 'https://www.notion.so/images/favicon.ico',
  'evernote': 'https://evernote.com/favicon.ico',
  'todoist': 'https://todoist.com/favicon.ico',
  'slack': 'https://slack.com/favicon.ico',

  // AI/Tech
  'chatgpt-plus': 'https://cdn.oaistatic.com/assets/favicon-o20kmmos.svg',
  'openai': 'https://cdn.oaistatic.com/assets/favicon-o20kmmos.svg',
  'github-copilot': 'https://github.com/favicon.ico',
  'midjourney': 'https://www.midjourney.com/favicon.ico',
  'claude-pro': 'https://claude.ai/favicon.ico',

  // Fitness
  'peloton': 'https://www.onepeloton.com/favicon.ico',
  'strava': 'https://www.strava.com/favicon.ico',
  'apple-fitness': 'https://www.apple.com/favicon.ico',
  'fitbit-premium': 'https://www.fitbit.com/favicon.ico',

  // Food Delivery
  'doordash-dashpass': 'https://www.doordash.com/favicon.ico',
  'uber-one': 'https://www.uber.com/favicon.ico',
  'grubhub-plus': 'https://www.grubhub.com/favicon.ico',

  // News/Reading
  'nyt': 'https://www.nytimes.com/favicon.ico',
  'wsj': 'https://www.wsj.com/favicon.ico',
  'medium': 'https://medium.com/favicon.ico',
  'kindle-unlimited': 'https://www.amazon.com/favicon.ico',
  'audible': 'https://www.audible.com/favicon.ico',

  // Gaming
  'xbox-game-pass': 'https://www.xbox.com/favicon.ico',
  'playstation-plus': 'https://www.playstation.com/favicon.ico',
  'nintendo-switch-online': 'https://www.nintendo.com/favicon.ico',
  'ea-play': 'https://www.ea.com/favicon.ico',

  // VPN/Security
  'nordvpn': 'https://nordvpn.com/favicon.ico',
  'expressvpn': 'https://www.expressvpn.com/favicon.ico',
  '1password': 'https://1password.com/favicon.ico',
  'lastpass': 'https://lastpass.com/favicon.ico',
  'bitwarden': 'https://bitwarden.com/favicon.ico',

  // Other
  'amazon-prime': 'https://www.amazon.com/favicon.ico',
  'costco': 'https://www.costco.com/favicon.ico',
  'walmart-plus': 'https://www.walmart.com/favicon.ico',
};

// Get logo URL for a service, returns null if not found
export function getServiceLogo(serviceId: string | undefined): string | null {
  if (!serviceId) return null;
  return SERVICE_LOGOS[serviceId] || null;
}
