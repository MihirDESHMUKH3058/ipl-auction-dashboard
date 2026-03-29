export const INITIAL_TEAM_BUDGET = 1000000000;
export const TEAM_SQUAD_LIMIT = 11;
export const DEFAULT_AUCTION_TIMER = 60;

export const normalizeRole = (role) => {
  if (!role) return 'Unknown';

  const normalized = String(role).trim().toLowerCase();

  if (normalized === 'wicketkeeper' || normalized === 'wicket-keeper') {
    return 'Wicket-Keeper';
  }

  if (normalized === 'all-rounder' || normalized === 'all rounder') {
    return 'All-Rounder';
  }

  if (normalized === 'batsman' || normalized === 'bowler') {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  return role;
};

export const normalizeStatus = (status) => {
  const normalized = String(status || 'available').trim().toLowerCase();

  if (normalized === 'sold') return 'sold';
  if (normalized === 'unsold') return 'unsold';
  if (normalized === 'hidden') return 'hidden';
  if (normalized === 'available') return 'available';

  return 'available';
};

export const getPlayerRating = (player) => {
  const rawRating = Number.parseInt(player?.rating, 10);
  if (Number.isFinite(rawRating)) return rawRating;

  const category = String(player?.category || '').trim();
  const exactMatch = category.match(/(\d{2})\s*\+?/);
  if (exactMatch) return Number.parseInt(exactMatch[1], 10);

  return null;
};

export const getRatingTier = (player) => {
  const rating = getPlayerRating(player);
  if (rating === null) return 'unrated';
  if (rating >= 80) return '80+';
  if (rating >= 70) return '70-79';
  if (rating >= 60) return '60-69';
  return 'below-60';
};

export const isInTier = (player, tier) => {
  if (!tier) return true;
  return getRatingTier(player) === tier;
};

export const dedupeById = (items = []) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = String(item?.id ?? item?.player_id ?? '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
