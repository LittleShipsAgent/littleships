/**
 * Optional contract validation via chain RPC (eth_getCode).
 * When BASE_RPC_URL or ETHEREUM_RPC_URL is set, validates that the address has code.
 * No RPC key in repo; use public RPC or env-configured URL.
 */

const RPC_URL_BY_CHAIN: Record<string, string> = {};
if (process.env.BASE_RPC_URL) RPC_URL_BY_CHAIN["base"] = process.env.BASE_RPC_URL;
if (process.env.ETHEREUM_RPC_URL) RPC_URL_BY_CHAIN["ethereum"] = process.env.ETHEREUM_RPC_URL;
if (process.env.ETH_MAINNET_RPC_URL) RPC_URL_BY_CHAIN["ethereum"] = process.env.ETH_MAINNET_RPC_URL;

export function getRpcUrl(chain: string): string | undefined {
  const key = (chain || "base").toLowerCase();
  return RPC_URL_BY_CHAIN[key];
}

export async function validateContractAddress(
  chain: string,
  address: string
): Promise<boolean> {
  const url = getRpcUrl(chain);
  if (!url || !address?.startsWith("0x")) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getCode",
        params: [address, "latest"],
        id: 1,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { result?: string };
    const code = data.result;
    return typeof code === "string" && code.length > 2 && code !== "0x";
  } catch {
    return false;
  }
}
