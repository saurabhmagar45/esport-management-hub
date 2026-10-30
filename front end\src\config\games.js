/**
 * Game Registry Configuration
 * Extensible configuration matrix allowing new competitive titles (Valorant, CS2, CODM)
 * to be added seamlessly without rewriting core tournament or team logic.
 */

export const SUPPORTED_GAMES = {
  BGMI: {
    id: 'bgmi',
    name: 'Battlegrounds Mobile India',
    shortName: 'BGMI',
    publisher: 'Krafton',
    color: '#f59e0b',
    accentClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    formats: ['solo', 'duo', 'squad'],
    defaultFormat: 'squad',
    teamSizes: {
      solo: 1,
      duo: 2,
      squad: 4
    },
    maps: ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Nusa'],
    idFieldLabel: 'BGMI Character ID (10 digits)',
    ignFieldLabel: 'In-Game Name (IGN)',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'
  },
  'Free Fire': {
    id: 'freefire',
    name: 'Free Fire (MAX)',
    shortName: 'Free Fire',
    publisher: 'Garena',
    color: '#f97316',
    accentClass: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    formats: ['squad', 'duo', 'solo', 'clash_squad'],
    defaultFormat: 'squad',
    teamSizes: {
      solo: 1,
      duo: 2,
      squad: 4,
      clash_squad: 4
    },
    maps: ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'NexTerra'],
    idFieldLabel: 'Free Fire UID (8-10 digits)',
    ignFieldLabel: 'Free Fire IGN',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200'
  },
  // Architecture Ready for Upcoming Expansions
  Valorant: {
    id: 'valorant',
    name: 'VALORANT',
    shortName: 'Valorant',
    publisher: 'Riot Games',
    color: '#f43f5e',
    accentClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    formats: ['5v5'],
    defaultFormat: '5v5',
    teamSizes: {
      '5v5': 5
    },
    maps: ['Ascent', 'Bind', 'Haven', 'Split', 'Sunset', 'Lotus'],
    idFieldLabel: 'Riot ID & Tagline (e.g. Player#IND)',
    ignFieldLabel: 'Riot IGN',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
    status: 'coming_soon'
  }
};

export const getGameConfig = (gameName) => {
  if (!gameName) return SUPPORTED_GAMES.BGMI;
  if (SUPPORTED_GAMES[gameName]) return SUPPORTED_GAMES[gameName];
  const foundKey = Object.keys(SUPPORTED_GAMES).find(
    k => k.toLowerCase() === gameName.toLowerCase()
  );
  return foundKey ? SUPPORTED_GAMES[foundKey] : SUPPORTED_GAMES.BGMI;
};
