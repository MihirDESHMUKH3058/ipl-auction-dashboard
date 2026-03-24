import React from 'react';
import './TeamRosters.css';

const TEAMS = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'SRH', 'RR', 'PBKS', 'LSG', 'GT'];

export default function TeamRosters({ players, auctionRecords }) {

  // Group players by the team that bought them
  const teamsData = TEAMS.map(teamName => {
    const boughtPlayerIds = Object.keys(auctionRecords).filter(
      id => auctionRecords[id].team === teamName
    );
    
    const roster = boughtPlayerIds.map(id => {
      const p = players.find(player => player.id.toString() === id);
      return {
        ...p,
        finalPrice: auctionRecords[id].finalPrice
      };
    }).filter(p => p.name); // ensure we found them

    // Sum up total spent (rough estimate from string)
    let totalSpentLakhs = 0;
    roster.forEach(p => {
      const numStr = p.finalPrice.replace(/[^0-9]/g, '');
      totalSpentLakhs += (parseInt(numStr, 10) / 100000);
    });

    return {
      name: teamName,
      roster,
      totalSpentLakhs
    };
  });

  return (
    <div className="rosters-container">
      <h2 className="rosters-title">Live Team Rosters</h2>
      <div className="teams-grid">
        {teamsData.map(team => (
          <div key={team.name} className="team-roster-card" style={{'--team-color': `var(--${team.name.toLowerCase()})`}}>
            <div className="team-header">
              <h3>{team.name}</h3>
              <div className="team-stats">
                <span>{team.roster.length} Players</span>
                {team.roster.length > 0 && <span>Spent: {team.totalSpentLakhs}L</span>}
              </div>
            </div>
            <div className="team-list">
              {team.roster.length === 0 ? (
                <div className="empty-roster">No players bought yet.</div>
              ) : (
                team.roster.map(player => (
                  <div key={player.id} className="roster-player">
                    <div className="roster-player-info">
                      <span className="roster-name">{player.name}</span>
                      <span className="roster-role">{player.role} • {player.overseas === 'Overseas' ? '✈️' : '🇮🇳'}</span>
                    </div>
                    <span className="roster-price">{player.finalPrice}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
