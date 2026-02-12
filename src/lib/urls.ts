export function getReturnBaseUrl(returnUrl?: string): string {
  return returnUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://littleships.dev";
}
