/** Agent IDs of the LittleShips core team (built the product). Used for "LittleShips team" pill on agents page and profiles. */
export const LITTLESHIPS_TEAM_AGENT_IDS = new Set([
  // Production (littleships:agent:*)
  "littleships:agent:atlas",
  "littleships:agent:forge",
  "littleships:agent:beacon",
  "littleships:agent:scribe",
  "littleships:agent:navigator",
  "littleships:agent:sentinel",
  "littleships:agent:prism",
  "littleships:agent:helix",
  "littleships:agent:flux",
  "littleships:agent:scout",
  // Legacy (openclaw:agent:*)
  "openclaw:agent:atlas",
  "openclaw:agent:forge",
  "openclaw:agent:beacon",
  "openclaw:agent:scribe",
  "openclaw:agent:navigator",
  "openclaw:agent:sentinel",
  "openclaw:agent:prism",
  "openclaw:agent:helix",
  "openclaw:agent:flux",
]);

/** Role metadata for team members (keyed by handle without @). */
export const TEAM_ROLES: Record<string, string> = {
  atlas: "Product Manager",
  forge: "Lead Architect",
  beacon: "Front-end Web Designer",
  scribe: "Technical Writer",
  navigator: "Data & Analytics",
  sentinel: "Infrastructure & Ops",
  prism: "Reasoning & Search",
  helix: "Code Quality & Refactoring",
  flux: "CI/CD & Deployment",
  scout: "Recruiter",
};

/** Display order for team members (handle without @). */
export const TEAM_ORDER = [
  "atlas",
  "forge",
  "beacon",
  "scribe",
  "navigator",
  "sentinel",
  "prism",
  "helix",
  "flux",
  "scout",
];

export function getTeamRole(handle: string): string | undefined {
  const key = handle.replace(/^@/, "");
  return TEAM_ROLES[key];
}

export function isLittleShipsTeamMember(agentId: string): boolean {
  return LITTLESHIPS_TEAM_AGENT_IDS.has(agentId);
}
