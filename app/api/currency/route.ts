import { NextResponse } from "next/server";

const COLLECTAPI_KEY = process.env.COLLECTAPI_KEY || "";

export async function GET() {
  if (!COLLECTAPI_KEY) {
    return NextResponse.json({ success: false, error: "COLLECTAPI_KEY not set" }, { status: 500 });
  }
  try {
    const res = await fetch("https://api.collectapi.com/economy/allCurrency", {
      signal: AbortSignal.timeout(10_000),
      headers: {
        authorization: `apikey ${COLLECTAPI_KEY}`,
        "content-type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`CollectAPI error: ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
