//#region lib/classes/BracketEntrant.d.ts
declare class BracketEntrant {
  entrantID: string;
  entrantTag: string;
  initialSeed: number;
  finalPlacement?: number;
  other: {
    [key: string]: any;
  };
  constructor(props: {
    entrantTag: string;
    other: {
      image: string;
      seed: number;
      misc: string;
      username: string;
      finalRank: number;
      groupId: string;
      email?: string;
      tournamentId: number;
      name: string;
      timestamps: {
        created_at: Date;
        updated_at: Date;
      };
      states: {
        active: boolean;
      };
    };
    initialSeed: number;
    finalPlacement?: number;
    entrantID: string;
  });
  setSeed(seed: number): void;
  setName(name: string): void;
  setMetaData(data: {
    [key: string]: never;
  }): void;
}
//#endregion
//#region lib/@types/obf.d.ts

/** Represents an entrant in the [tournament]{@link Tournament}. */
interface Entrant {
  /** A unique ID corresponding to this entrant.
   * These IDs are mapped to the [entrant 1]{@link Set.entrant1ID} and [entrant 2]{@link Set.entrant2ID} IDs found in each [set]{@link Set}.
   * This is a required field. */
  entrantID: string;
  /** A unique name associated with this entrant. */
  entrantTag: string;
  /** A weighted number representing the initial seeding of this entrant (lower seeds are at the top). */
  initialSeed: number;
  /** The final placement for this entrant (only used after an event is completed). */
  finalPlacement?: number;
  /** List of personal data about players corresponding to this entrant (e.g., legal name, country, etc.).
   * If this entrant corresponds to a single player, this will be a list of size one.
   * If it is a team of several players, there will be one entry per player. */
  personalInformation: PersonalInformation[];
  /** An object for storing any additional entrant-related information not covered by the previously mentioned fields. */
  other?: any;
}
/** Represents personal information (e.g., name, country) associated with an [entrant]{@link Entrant}. */
interface PersonalInformation {
  /** Entrant's legal name. */
  name?: string;
  /** Entrant's country. */
  country?: string;
  /** Entrant's tag. Same as [entrantTag]{@link Entrant.entrantTag} if not part of a team. */
  tag: string;
  /** Prefix for entrant's tag. */
  prefix?: string;
  /** An object for storing any additional entrant-related information not covered by the previously mentioned fields. */
  other?: any;
}
/** Represents a single set of the tournament. */
interface Set {
  /** A unique identifier for this set.
   * This is a required field and should be ordered with the rest of the set IDs. */
  setID: string;
  /** The [ID]{@link Entrant.entrantID} for the first entrant. */
  entrant1ID: string;
  /** The [ID]{@link Entrant.entrantID} of the second entrant. */
  entrant2ID: string;
  /** The current [status]{@link SetStatus} for this set. This field is required. */
  status: SetStatus;
  /** The final [result]{@link SetGameResult} for entrant 1. */
  entrant1Result?: SetGameResult;
  /** The final [result]{@link SetGameResult} for entrant 2. */
  entrant2Result?: SetGameResult;
  /** The score for entrant 1. */
  entrant1Score: number;
  /** The score for entrant 2. */
  entrant2Score: number;
  /** The [ID]{@link Set.setID} of the set that entrant 1 will advance to (if there is one).*/
  entrant1NextSetID?: string;
  /** The [ID]{@link Set.setID} of the set that entrant 2 will advance to (if there is one).*/
  entrant2NextSetID?: string;
  /** The previous [ID]{@link Set.setID} of the set that entrant 1 came from (if there is one).*/
  entrant1PrevSetID?: string;
  /** The previous [ID]{@link Set.setID} of the set that entrant 2 came from (if there is one).*/
  entrant2PrevSetID?: string;
  /** The format for this set (e.g., whether it was best of 3 or best of 5). */
  setFormat: string;
  /** The [phase]{@link Phase} of this specific set. */
  phaseID: string;
  /** The round in the bracket of this specific set (for example, "Winner's Round 1" or "Semifinals").
   * It is up to the user's discretion to decide what precisely a round means and how to record it. */
  roundID: string;
  /** The [games]{@link Game} belonging to this [set]{@link Set}.
   * It is recommended (but not required) that this array records the games in chronological order. */
  games: Game[];
  /** An object for storing additional set-related information not covered by the previously mentioned fields. */
  other?: any;
}
/** Represents a single game of a set. */
interface Game {
  /** The order in which this game appears in a set. Spans a consecutive range of integers starting at 1. */
  gameNumber: number;
  /** The characters played by entrant 1 in this game.
   * If only a single character is used in this game,
   * this field should contain an array containing a single string.
   * In team games or games where each entrant can choose a selection of different characters,
   * you should record these characters as separate elements of this field. */
  entrant1Characters: string[];
  /** The characters played by entrant 2 in this game.
   * If only a single character is used in this game,
   * this field should contain an array containing a single string.
   * In team games or games where each entrant can choose a selection of different characters,
   * you should record these characters as separate elements of this field. */
  entrant2Characters: string[];
  /** The stage this game was played on. */
  stage: string;
  /** The [result]{@link SetGameResult} for entrant 1. */
  entrant1Result?: SetGameResult;
  /** The [result]{@link SetGameResult} for entrant 2. */
  entrant2Result?: SetGameResult;
  /** An object for storing additional game-related information not covered by the previously mentioned fields. */
  other?: any;
}
declare enum SetStatus {
  Completed = "completed",
  Started = "started",
  Pending = "pending",
}
declare enum SetGameResult {
  Win = "win",
  Lose = "lose",
  Draw = "draw",
  Disqualified = "disqualified",
}
//#endregion
//#region lib/classes/BracketSet.d.ts
declare class BracketSet {
  setId: number;
  uuid?: number | string;
  self: BracketSet;
  leftEntrant: BracketEntrant | undefined;
  rightEntrant: BracketEntrant | undefined;
  entrant1Result?: SetGameResult;
  entrant2Result?: SetGameResult;
  entrant1Score: number;
  entrant2Score: number;
  entrant1Ready: boolean;
  entrant2Ready: boolean;
  entrant1Reported: boolean;
  entrant2Reported: boolean;
  leftSet: BracketSet | undefined;
  rightSet: BracketSet | undefined;
  parentSet: BracketSet | undefined;
  leftWinnerSet: BracketSet | undefined;
  rightWinnerSet: BracketSet | undefined;
  loserSet: BracketSet | undefined;
  round: number;
  numberToWin: number;
  status: "started" | "pending" | "completed";
  type: "winners" | "losers";
  startTime: Date | undefined;
  endTime: Date | undefined;
  onStream: boolean;
  winner: string;
  loser: string;
  placement: number;
  other: {
    [key: string]: never;
  };
  constructor(props: {
    setId: number;
    uuid?: number;
    leftSet?: BracketSet;
    rightSet?: BracketSet;
    leftEntrant?: BracketEntrant;
    rightEntrant?: BracketEntrant;
    parentSet?: BracketSet;
    leftWinner?: BracketSet;
    rightWinner?: BracketSet;
    loserSet?: BracketSet;
    round: number;
    type?: "winners" | "losers";
    status?: "started" | "completed" | "pending";
    placement?: number;
    numberToWin?: number;
    other?: {
      [key: string]: never;
    };
  });
  isLeftChild(): boolean;
  isRightChild(): boolean;
  isLeftWinner(): boolean;
  isRightWinner(): boolean;
  isOnlyChild(): boolean;
  getPlacement(placement?: number, node?: BracketSet): number;
  getSibling(): BracketSet | undefined;
  addSet(node: BracketSet | undefined): void;
  addLeftSet(set: BracketSet | undefined): void;
  addRightSet(set: BracketSet | undefined): void;
  setLosersSet(losersSet: BracketSet | undefined): void;
  setLeftEntrant(entrant: BracketEntrant | undefined): void;
  setRightEntrant(entrant: BracketEntrant | undefined): void;
  setEntrant(entrant: BracketEntrant | undefined): void;
  setParentSet(parent: BracketSet): void;
  setMetaData(data: {
    [key: string]: never;
  }): void;
  updateScore(isP1: boolean, score: number): void;
}
//#endregion
//#region lib/classes/BracketEvent.d.ts
declare class BracketEvent {
  id?: string;
  numberOfEntrants: number;
  root: BracketSet | undefined;
  state: string;
  winnersRoot?: BracketSet;
  losersRoot?: BracketSet;
  extraRoot?: BracketSet;
  entrants: Array<BracketEntrant>;
  sets: Array<BracketSet>;
  layout: string;
  other?: {
    [key: string]: any;
  };
  constructor(props: {
    id?: string;
    sets?: Set[];
    entrants: Entrant[];
    layout: string;
    metaData?: {
      [key: string]: any;
    };
    state?: string;
  });
  mapSets(importedSets: Set[]): void;
  createEntrants(entrants: Entrant[]): BracketEntrant[];
  exportSets(): Set[];
  assignEntrants(): void;
  createBracket(size?: number): BracketSet;
  linkEliminationSets({
    currentRoundSets,
    previousRoundSets
  }: {
    currentRoundSets: BracketSet[];
    previousRoundSets: BracketSet[];
  }): void;
  orderSeeds(): number[][];
  weaveEntrants(): (BracketEntrant | undefined)[];
  attachLosersBracket(winnersFinals: BracketSet): BracketSet;
  linkLosersSets(losersBracket: BracketSet[]): BracketSet;
  createLosersBracket(winnersFinals: BracketSet): BracketSet;
  getAllWinnersSets(): (BracketSet | undefined)[];
  getAllLosersSets(): BracketSet[];
  getSetsByRound(round: number, filters?: {
    set?: BracketSet;
    type?: "winners" | "losers";
  }): BracketSet[];
  calculateRounds(size?: number): number;
  calculateNumberOfSetsPerRound: ({
    round,
    size,
    previousRoundSets
  }: {
    round: number;
    size: number;
    previousRoundSets?: BracketSet[];
  }) => number;
  findHighestPowerOf2(threshold?: number): number;
  isPowerOf2(x: number): boolean;
  addMetaData(data: {
    [key: string]: any;
  }): void;
}
//#endregion
export { BracketEntrant, BracketEvent, BracketSet };