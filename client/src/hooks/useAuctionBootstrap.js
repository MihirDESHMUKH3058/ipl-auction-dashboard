import { useEffect } from 'react';
import { socketClient } from '../lib/socketClient';
import { usePlayerStore } from '../store/playerStore';
import { useTeamStore } from '../store/teamStore';

export const useAuctionBootstrap = () => {
  const fetchPlayers = usePlayerStore((state) => state.fetchPlayers);
  const fetchTeams = useTeamStore((state) => state.fetchTeams);

  useEffect(() => {
    socketClient.connect();
    fetchPlayers();
    fetchTeams();
  }, [fetchPlayers, fetchTeams]);
};
