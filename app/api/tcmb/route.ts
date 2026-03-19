import { NextResponse } from "next/server";

function parseTcmbXml(xml: string) {
  const currencies: {
    code: string; name: string; unit: number;
    forexBuying: string; forexSelling: string;
    banknoteBuying: string; banknoteSelling: string;
  }[] = [];
  const blocks = xml.match(/<Currency[^>]*CurrencyCode="(\w+)"[^>]*>([\s\S]*?)<\/Currency>/g) || [];
  for (const block of blocks) {
    const code  = block.match(/CurrencyCode="(\w+)"/)?.[1];
    const unit  = block.match(/<Unit>(\d+)<\/Unit>/)?.[1];
    const name  = block.match(/<Isim>([^<]+)<\/Isim>/)?.[1];
    const fBuy  = block.match(/<ForexBuying>([^<]+)<\/ForexBuying>/)?.[1];
    const fSell = block.match(/<ForexSelling>([^<]+)<\/ForexSelling>/)?.[1];
    const bnBuy  = block.match(/<BanknoteBuying>([^<]+)<\/BanknoteBuying>/)?.[1];
    const bnSell = block.match(/<BanknoteSelling>([^<]+)<\/BanknoteSelling>/)?.[1];
    if (!code || !fBuy || !fSell) continue;
    currencies.push({
      code, name: name ?? code, unit: parseInt(unit ?? "1"),
      forexBuying: fBuy, forexSelling: fSell,
      banknoteBuying: bnBuy ?? "", banknoteSelling: bnSell ?? "",
    });
  }
  return currencies;
}

export async function GET() {
  try {
    const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
      signal: AbortSignal.timeout(8_000),
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!response.ok) throw new Error(`TCMB error: ${response.status}`);
    const buf = await response.arrayBuffer();
    const xml = new TextDecoder("iso-8859-9").decode(buf);
    return NextResponse.json({ success: true, result: parseTcmbXml(xml) });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
