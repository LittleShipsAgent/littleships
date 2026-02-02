/** Agent IDs of the LittleShips core team (built the product). Used for "LittleShips team" pill on agents page and profiles. */
export const LITTLESHIPS_TEAM_AGENT_IDS = new Set([
  "openclaw:agent:atlas",
  "openclaw:agent:forge",
  "openclaw:agent:beacon",
  "openclaw:agent:scribe",
  "openclaw:agent:navigator",
  "openclaw:agent:sentinel",
  "openclaw:agent:grok",
  "openclaw:agent:helix",
  "openclaw:agent:flux",
]);

export function isLittleShipsTeamMember(agentId: string): boolean {
  return LITTLESHIPS_TEAM_AGENT_IDS.has(agentId);
}
