export type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: never;
};

export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export interface BlockSource {
  file: string;
  line: string;
}

export interface BlockData {
  who?: string;
  what: string;
  with: string;
}

export type BlockType = "say" | "string";

export interface BlockBase {
  type: BlockType;

  original: BlockData;
  translated?: BlockData | null;
}

export interface SayBlockMeta {
  lang: string;
  source: BlockSource;
  id: string;
  nointeract: boolean;
}

export interface StringBlockMeta {
  lang: string;
  source: BlockSource;
}

export interface SayBlock extends BlockBase {
  type: "say";
  meta: SayBlockMeta;
  pass: boolean;
}

export interface StringBlock extends BlockBase {
  type: "string";
  meta: StringBlockMeta;
}

export type Block = XOR<StringBlock, SayBlock>;
