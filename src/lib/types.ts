export interface Searchable {
  py?: string;
  pyi?: string;
  search?: string;
}

export interface Species extends Searchable {
  slug: string;
  dex: number | null;
  constant: string;
  name: string;
  nameEn: string;
  types: string[];
  typesRaw: string[];
  stats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  bst: number;
  abilities: { constant: string; name: string }[];
  hiddenAbilities: string[];
  innates: string[];
  sprite: string;
  description: string;
  category: string;
  isForm: boolean;
}

export interface Move extends Searchable {
  slug: string;
  constant: string;
  name: string;
  nameEn: string;
  type: string;
  typeRaw: string;
  category: string;
  categoryRaw: string;
  power: number;
  accuracy: number;
  pp: number;
  priority: number;
  description: string;
  target?: string;
  tags?: string[];
  effects?: { text: string; chance: number }[];
}

export interface Ability extends Searchable {
  slug: string;
  constant: string;
  name: string;
  nameEn: string;
  description: string;
}

export interface ItemLocation {
  map: string;
  mapZh: string;
  source: string;
}

export interface Item extends Searchable {
  slug: string;
  id: number;
  constant: string;
  name: string;
  nameEn: string;
  description: string;
  pocket: string;
  pocketRaw: string;
  icon: string | null;
  locations: ItemLocation[];
}

export interface Machine extends Searchable {
  slug: string;
  kind: "TM" | "HM" | string;
  number: number;
  label: string;
  name: string;
  moveName: string;
  moveSlug: string;
  type: string;
  typeRaw: string;
  category: string;
  power: number;
  accuracy: number;
  pp: number;
  locations: ItemLocation[];
}

export interface EncounterMon {
  constant: string;
  name: string;
  nameEn: string;
  slug?: string;
  types: string[];
  sprite: string;
  minLevel: number;
  maxLevel: number;
  rate: number;
}

export interface EncounterMethod {
  key: string;
  method: string;
  mons: EncounterMon[];
}

export interface EncounterVariant {
  time: string;
  timeZh: string;
  methods: EncounterMethod[];
}

export interface Encounter extends Searchable {
  map: string;
  name: string;
  nameZh: string;
  hasTimeVariants: boolean;
  variants: EncounterVariant[];
}

export interface TrainerMon {
  species: string;
  slug?: string;
  level: number;
  sprite: string;
  types: string[];
  ability: string;
  item: string;
  itemIcon: string | null;
  moves: string[];
  nature: string;
  ivs: Record<string, number>;
  evs: Record<string, number>;
}

export interface Trainer extends Searchable {
  constant: string;
  name: string;
  nameEn: string;
  difficulty: string;
  difficultyRaw: string;
  avgLevel: number;
  sprite: string;
  locations: { map: string; mapZh: string }[];
  party: TrainerMon[];
}

export interface FrontierSet {
  key: string;
  species: string;
  speciesEn: string;
  slug?: string;
  sprite?: string;
  types: string[];
  item: string;
  ability: string;
  nature: string;
  moves: string[];
  evs: number[];
  ivs: number[];
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  category: string;
  order: number;
  content: string;
}
