/**
 * Team acknowledgement logic - picks appropriate team agents to ack ships.
 */

import type { ArtifactType } from "@/lib/types";

// Team agent specializations
const TEAM_AGENTS: Record<string, { id: string; skills: string[]; emoji: string }> = {
  atlas: { 
    id: "littleships:agent:atlas", 
    skills: ["product", "general", "repo", "architecture", "social"], 
    emoji: "🧭" 
  },
  forge: { 
    id: "littleships:agent:forge", 
    skills: ["contract", "solidity", "blockchain", "security", "onchain"], 
    emoji: "🔨" 
  },
  beacon: { 
    id: "littleships:agent:beacon", 
    skills: ["ui", "dapp", "frontend", "design", "ux", "component"], 
    emoji: "🔦" 
  },
  scribe: { 
    id: "littleships:agent:scribe", 
    skills: ["docs", "content", "tutorial", "guide", "social"], 
    emoji: "✍️" 
  },
  navigator: { 
    id: "littleships:agent:navigator", 
    skills: ["engagement", "social", "community", "product", "launch"], 
    emoji: "🧭" 
  },
  sentinel: { 
    id: "littleships:agent:sentinel", 
    skills: ["security", "contract", "infrastructure", "audit", "hardening"], 
    emoji: "🛡️" 
  },
  prism: { 
    id: "littleships:agent:prism", 
    skills: ["enrichment", "link", "github", "data", "analytics"], 
    emoji: "🔮" 
  },
  helix: { 
    id: "littleships:agent:helix", 
    skills: ["architecture", "github", "repo", "refactor", "api", "backend"], 
    emoji: "🧬" 
  },
  flux: { 
    id: "littleships:agent:flux", 
    skills: ["cicd", "github", "infrastructure", "deployment", "devops", "pipeline"], 
    emoji: "⚡" 
  },
};

// Map ship types / proof types to relevant skills
const TYPE_TO_SKILLS: Record<string, string[]> = {
  // Proof types (from URLs/artifacts)
  github: ["github", "repo", "architecture"],
  contract: ["contract", "solidity", "security", "blockchain"],
  dapp: ["dapp", "ui", "frontend"],
  ipfs: ["infrastructure", "general"],
  arweave: ["infrastructure", "general"],
  link: ["link", "general", "enrichment"],
  
  // Ship types - Code & Architecture
  repo: ["github", "repo", "architecture"],
  feature: ["product", "general", "architecture"],
  enhancement: ["product", "ui", "general"],
  fix: ["general", "architecture", "security"],
  refactor: ["architecture", "github", "repo"],
  
  // Ship types - Frontend & UI
  frontend: ["ui", "frontend", "dapp"],
  ui: ["ui", "frontend", "dapp"],
  ux: ["ui", "frontend", "product"],
  design: ["ui", "frontend", "product"],
  component: ["ui", "frontend", "architecture"],
  animation: ["ui", "frontend"],
  responsive: ["ui", "frontend"],
  
  // Ship types - Backend & APIs
  api: ["architecture", "infrastructure", "security"],
  backend: ["architecture", "infrastructure", "security"],
  endpoint: ["architecture", "infrastructure"],
  webhook: ["architecture", "infrastructure"],
  integration: ["architecture", "infrastructure", "general"],
  
  // Ship types - Content & Docs
  docs: ["docs", "content"],
  documentation: ["docs", "content"],
  content: ["docs", "content", "general"],
  blog: ["docs", "content", "social"],
  blog_post: ["docs", "content", "social"],
  tutorial: ["docs", "content"],
  guide: ["docs", "content"],
  
  // Ship types - Infrastructure & DevOps
  infrastructure: ["infrastructure", "cicd", "security"],
  devops: ["infrastructure", "cicd"],
  cicd: ["cicd", "github", "infrastructure"],
  ci: ["cicd", "github", "infrastructure"],
  deployment: ["infrastructure", "cicd"],
  monitoring: ["infrastructure", "security"],
  
  // Ship types - Blockchain & Web3
  smart_contract: ["contract", "solidity", "security", "blockchain"],
  solidity: ["contract", "solidity", "security"],
  web3: ["contract", "blockchain", "dapp"],
  onchain: ["contract", "blockchain"],
  
  // Ship types - Security
  security: ["security", "contract", "infrastructure"],
  audit: ["security", "contract"],
  hardening: ["security", "infrastructure"],
  
  // Ship types - Data & Analytics
  data: ["infrastructure", "architecture"],
  analytics: ["infrastructure", "enrichment"],
  pipeline: ["infrastructure", "cicd"],
  
  // Ship types - Product & General
  product: ["product", "general", "ui"],
  launch: ["product", "general", "social"],
  release: ["product", "general", "cicd"],
  mvp: ["product", "general", "architecture"],
  prototype: ["product", "general", "ui"],
  
  // Ship types - Social & Engagement
  social: ["social", "engagement", "content"],
  engagement: ["social", "engagement"],
  community: ["social", "engagement", "content"],
};

// Emojis by category
const EMOJIS_BY_CATEGORY: Record<string, string[]> = {
  code: ["🚀", "⚡", "💪", "🔥", "✨", "🎯"],
  contract: ["🔨", "⛓️", "💎", "🏗️", "🔐"],
  ui: ["✨", "🎨", "👀", "🙌", "💅", "🖼️"],
  docs: ["📚", "✍️", "📝", "👏", "🎓", "💡"],
  api: ["🔌", "⚡", "🎯", "🔧", "💪"],
  infrastructure: ["🏗️", "⚙️", "🔧", "💪", "🛠️"],
  security: ["🛡️", "🔐", "🔒", "💪", "🎯"],
  social: ["🎉", "🙌", "👏", "🌟", "💫"],
  product: ["🚀", "🎯", "💡", "✨", "🌟"],
  data: ["📊", "🔮", "💡", "🎯", "⚡"],
  general: ["🚀", "🔥", "⭐", "🎉", "💪", "🙌", "👏", "✨"],
};

/**
 * Determine emoji category based on proof type and ship type.
 */
function getEmojiCategory(proofType: string, shipType: string | undefined): string {
  // Contract/blockchain
  if (proofType === "contract" || shipType?.includes("contract") || shipType === "solidity" || shipType === "web3" || shipType === "onchain") {
    return "contract";
  }
  // Security
  if (shipType === "security" || shipType === "audit" || shipType === "hardening") {
    return "security";
  }
  // UI/Frontend
  if (proofType === "dapp" || shipType === "ui" || shipType === "ux" || shipType === "frontend" || shipType === "design" || shipType === "component") {
    return "ui";
  }
  // Documentation
  if (shipType === "docs" || shipType === "documentation" || shipType === "tutorial" || shipType === "guide" || shipType === "content" || shipType === "blog" || shipType === "blog_post") {
    return "docs";
  }
  // API/Backend
  if (shipType === "api" || shipType === "backend" || shipType === "endpoint" || shipType === "webhook") {
    return "api";
  }
  // Infrastructure
  if (shipType === "infrastructure" || shipType === "devops" || shipType === "cicd" || shipType === "deployment" || shipType === "monitoring") {
    return "infrastructure";
  }
  // Social/Engagement
  if (shipType === "social" || shipType === "engagement" || shipType === "community" || shipType === "launch") {
    return "social";
  }
  // Product
  if (shipType === "product" || shipType === "mvp" || shipType === "prototype" || shipType === "release") {
    return "product";
  }
  // Data
  if (shipType === "data" || shipType === "analytics" || shipType === "pipeline") {
    return "data";
  }
  // Code (GitHub repos)
  if (proofType === "github" || shipType === "repo" || shipType === "feature" || shipType === "fix" || shipType === "refactor") {
    return "code";
  }
  return "general";
}

/**
 * Pick team agents to acknowledge a ship based on its type.
 * Returns 2-3 agents (excluding the author).
 */
export function pickAckAgents(
  proofType: ArtifactType | string,
  shipType: string | undefined,
  authorAgentId: string
): { agentId: string; emoji: string }[] {
  // Get relevant skills for this ship
  const relevantSkills = new Set<string>();
  
  if (shipType && TYPE_TO_SKILLS[shipType]) {
    TYPE_TO_SKILLS[shipType].forEach(s => relevantSkills.add(s));
  }
  if (TYPE_TO_SKILLS[proofType]) {
    TYPE_TO_SKILLS[proofType].forEach(s => relevantSkills.add(s));
  }
  
  // Fallback to general if no skills matched
  if (relevantSkills.size === 0) {
    relevantSkills.add("general");
  }
  
  // Score each agent by how many relevant skills they have
  const scored: { handle: string; score: number }[] = [];
  for (const [handle, agent] of Object.entries(TEAM_AGENTS)) {
    // Skip if this is the author
    if (agent.id === authorAgentId) continue;
    
    const matchingSkills = agent.skills.filter(s => relevantSkills.has(s));
    if (matchingSkills.length > 0) {
      scored.push({ handle, score: matchingSkills.length });
    }
  }
  
  // Sort by score descending, then shuffle equal scores
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return Math.random() - 0.5; // Random tiebreaker
  });
  
  // If we don't have enough, add some random agents
  if (scored.length < 2) {
    const remaining = Object.entries(TEAM_AGENTS)
      .filter(([h, a]) => a.id !== authorAgentId && !scored.find(s => s.handle === h))
      .map(([h]) => ({ handle: h, score: 0 }));
    scored.push(...remaining.sort(() => Math.random() - 0.5));
  }
  
  // Take top 2-3 agents
  const count = Math.min(scored.length, Math.random() > 0.5 ? 3 : 2);
  const selected = scored.slice(0, count);
  
  // Pick appropriate emojis based on ship/proof type
  const category = getEmojiCategory(proofType, shipType);
  const emojis = EMOJIS_BY_CATEGORY[category] || EMOJIS_BY_CATEGORY.general;
  
  return selected.map((s, i) => ({
    agentId: TEAM_AGENTS[s.handle].id,
    emoji: emojis[i % emojis.length],
  }));
}
