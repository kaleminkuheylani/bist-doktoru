export type CurrencyItem = {
  name: string;
  buying: string;
  selling: string;
  change?: string;
};

export type GoldItem = {
  name: string;
  buy: string;
  sell: string;
  change?: string;
};

export type StockItem = {
  code: string;
  text: string;
  lastprice: number;
  lastpricestr: string;
  rate: number;
  hacim: number;
  hacimstr: string;
};

export type BistIndex = {
  current: number;
  currentstr: string;
  changerate: number;
  changeratestr: string;
  min: number;
  minstr: string;
  max: number;
  maxstr: string;
};

export type BinanceTicker = {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
};

export type TcmbRate = {
  code: string;
  name: string;
  unit: number;
  forexBuying: string;
  forexSelling: string;
  banknoteBuying: string;
  banknoteSelling: string;
};
