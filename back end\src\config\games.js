/**
 * Server-Side Game Registry
 */

export const SUPPORTED_GAMES = {
  BGMI: {
    name: 'BGMI',
    fullName: 'Battlegrounds Mobile India',
    formats: ['solo', 'duo', 'squad'],
    allowedTeamSizes: [1, 2, 4],
    maxTeamsAllowed: 64
  },
  'Free Fire': {
    name: 'Free Fire',
    fullName: 'Free Fire (MAX)',
    formats: ['solo', 'duo', 'squad', 'clash_squad'],
    allowedTeamSizes: [1, 2, 4],
    maxTeamsAllowed: 64
  }
};

export function isValidGame(game) {
  return Object.keys(SUPPORTED_GAMES).some(k => k.toLowerCase() === (game || '').toLowerCase());
}
