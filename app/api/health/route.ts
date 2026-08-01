/** @author Uvin Vindula (IAMUVIN) @website https://iamuvin.com */
export function GET() {
  return Response.json(
    {
      status: "ok",
      product: "TurnstileProof",
      version: "0.1.0",
      sourceStorage: false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
