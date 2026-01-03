//#region lib/classes/BracketEntrant.d.ts
/**
 * Main class representing an [entrant]{@link Entrant} in a Tournament Bracket.
 * @class BracketEntrant
 * @param entrantTag - Name of the entrant.
 * @param initialSeed - Starting seed of the entrant.
 * @param finalPlacement - Final placement of the entrant in the bracket.
 * @param other - Additional metadata to be stored with the entrant.
 */
declare class BracketEntrant {
  /** Unique ID of the [entrant.]{@link Entrant} */
  entrantID: string;
  /** Name of the [entrant.]{@link Entrant} */
  entrantTag: string;
  /** Initial seed of the [entrant.]{@link Entrant} */
  initialSeed: number;
  /** Final placement of the [entrant.]{@link Entrant} */
  finalPlacement?: number;
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
  /**
   * Assign a seed for this entrant.
   * @param seed - The seed to assign.
   * */
  assignSeed(seed: number): void;
  /**
   * Assign a name for this entrant.
   * @param name - The name to assign.
   * */
  assignName(name: string): void;
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
declare enum TournamentStructures {
  SingleElimination = "single elimination",
  DoubleElimination = "double elimination",
  RoundRobin = "round robin",
}
//#endregion
//#region lib/classes/BracketSet.d.ts
/**
 * Main class representing a [set]{@link Set} in a Tournament Bracket.
 * @class BracketSet
 * @param setId - ID of this set.
 * @param leftSet - Left child of this set (Optional).
 * @param rightSet - Right child of this set (Optional).
 * @param leftEntrant - Left entrant of this set (Optional).
 * @param rightEntrant - Right entrant of this set (Optional).
 * @param parentSet - Parent of this set (Optional).
 * @param leftUpperBracketSet - The upper [bracket set]{@link BracketSet} that links to entrant 1
 * (Double Elimination Only).
 * @param rightUpperBracketSet - The upper [bracket set]{@link BracketSet} that links to entrant 2
 * (Double Elimination Only).
 * @param numberToWin - Number of victories required to declare a winner (Default: 3).
 * @param status - [Status]{@link SetStatus} of this set (Default: "pending").
 * @param type - Type of this set (Default: "winners").
 * @param other - Additional metadata to be stored with this set.
 */
declare class BracketSet {
  /** Unique ID of this [set]{@link Set}. */
  setId: number;
  /** [Entrant]{@link BracketEntrant} 1 of this [set]{@link Set}.*/
  leftEntrant: BracketEntrant | undefined;
  /** [Entrant]{@link BracketEntrant} 2 of this [set]{@link Set}.*/
  rightEntrant: BracketEntrant | undefined;
  /** Set [results]{@link SetGameResult} for [Entrant]{@link BracketEntrant} 1.*/
  entrant1Result?: SetGameResult;
  /** Set [results]{@link SetGameResult} for [Entrant]{@link BracketEntrant} 2.*/
  entrant2Result?: SetGameResult;
  /** Score for [Entrant]{@link BracketEntrant} 1.*/
  entrant1Score: number;
  /** Score for [Entrant]{@link BracketEntrant} 2.*/
  entrant2Score: number;
  /** Left child of this [set]{@link Set}. */
  leftSet: BracketSet | undefined;
  /** Right child of this [set]{@link Set}. */
  rightSet: BracketSet | undefined;
  /** Parent of this [set]{@link Set}. */
  parentSet: BracketSet | undefined;
  /** The upper [bracket set]{@link BracketSet} that precedes the left slot of this [set]{@link Set}. */
  leftUpperBracketSet: BracketSet | undefined;
  /** The upper [bracket set]{@link BracketSet} that precedes the right slot of this [set]{@link Set}. */
  rightUpperBracketSet: BracketSet | undefined;
  /** The lower [bracket set]{@link BracketSet} assigned to this [set]{@link Set}. */
  loserSet: BracketSet | undefined;
  /** The round this set belongs to. */
  round: number;
  /** The required number of victories to declare a winner (Default: 3). */
  numberToWin: number;
  /** [Status]{@link SetStatus} for this set (Default: "pending"). */
  status: SetStatus;
  type: "winners" | "losers";
  /** Final placement of this set in the tournament (Default: 0). */
  placement: number;
  constructor(props: {
    setId: number;
    uuid?: number;
    leftSet?: BracketSet;
    rightSet?: BracketSet;
    leftEntrant?: BracketEntrant;
    rightEntrant?: BracketEntrant;
    parentSet?: BracketSet;
    leftUpperBracketSet?: BracketSet;
    rightUpperBracketSet?: BracketSet;
    loserSet?: BracketSet;
    round: number;
    type?: "winners" | "losers";
    status?: SetStatus;
    placement?: number;
    numberToWin?: number;
  });
  /**
   * Checks if this set is the left child of its parent.
   * @returns - True if this set is the left child of its parent, false otherwise.
   * */
  isLeftChild(): boolean;
  /**
   * Checks if this set is the right child of its parent.
   * @returns - True if this set is the right child of its parent, false otherwise.
   * */
  isRightChild(): boolean;
  /**
   * Checks if the left entrant slot is linked to an upper bracket set.
   * @returns - True if linked to an upper bracket set, false otherwise.
   * */
  isLeftWinner(): boolean;
  /**
   * Checks if the right entrant slot is linked to an upper bracket set.
   * @returns - True if linked to an upper bracket set, false otherwise.
   * */
  isRightWinner(): boolean;
  /**
   * Checks if this set is the only child of its parent.
   * @returns - True if this set has no siblings, false otherwise.
   * */
  isOnlyChild(): boolean;
  /**
   * Calculates the final placement of this set in its parent.
   * @param placement - Current placement of this set.
   * @param node - Current node in the tree.
   * @returns - Final placement of this set in the tournament.
   */
  getPlacement(placement?: number, node?: BracketSet): number;
  /**
   * Get the sibling of this set.
   * @returns - Sibling set of this set, undefined otherwise.
   * */
  getSibling(): BracketSet | undefined;
  /**
   * Add a child to this set.
   * @param node - Child to add.
   * @returns - True if child was added, false otherwise.
   * */
  addSet(node: BracketSet | undefined): boolean;
  /**
   * Add a left child to this set.
   * @param set - Left child [set]{@link BracketSet} to add.
   * @returns - True if child was added, false otherwise.
   * */
  addLeftSet(set: BracketSet | undefined): boolean;
  /**
   * Add a right child to this set.
   * @param set - Right child [set]{@link BracketSet} to add.
   * @returns - True if child was added, false otherwise.
   * */
  addRightSet(set: BracketSet | undefined): void;
  /**
   * Assigns a [bracket set]{@link BracketSet} as the lower bracket progression of this set.
   * @param losersSet - [Bracket set]{@link BracketSet} to attach.
   * */
  assignLowerBracketSet(losersSet: BracketSet | undefined): void;
  /**
   * Assign a [bracket entrant]{@link BracketEntrant} as the left slot of this set.
   * @param entrant - [Bracket entrant]{@link BracketEntrant} to assign.
   * @returns - True if entrant was assigned, false otherwise.
   * */
  assignLeftEntrant(entrant: BracketEntrant | undefined): boolean;
  /**
   * Assign a [bracket entrant]{@link BracketEntrant} as the right slot of this set.
   * @param entrant - [Bracket entrant]{@link BracketEntrant} to assign.
   * @returns - True if entrant was assigned, false otherwise.
   * */
  assignRightEntrant(entrant: BracketEntrant | undefined): void;
  /**
   * Assign a [bracket entrant]{@link BracketEntrant} to any available slot of this set.
   * @param entrant - [Bracket entrant]{@link BracketEntrant} to assign.
   * @returns - True if entrant was assigned, false otherwise.
   * */
  assignEntrant(entrant: BracketEntrant | undefined): void;
  /**
   * Assign a [bracket set]{@link BracketSet} as the parent of this set.
   * @param parent - [Set]{@link BracketSet} to use as the parent set.
   * */
  assignParentSet(parent: BracketSet): void;
  /**
   * Update the scores of this set.
   * @param isP1 - True if the score is for the first entrant, false for the second entrant.
   * @param score - New score of the entrant.
   * */
  updateScore(isP1: boolean, score: number): void;
}
//#endregion
//#region lib/classes/BracketEvent.d.ts
/**
 * Main class representing a Tournament Bracket.
 * @class BracketEvent
 * @param entrants - Array of [entrants]{@link Entrant} to use for the tournament.
 * @param sets - Array of imported [sets]{@link Set} to map to the bracket.
 * Optional.
 * @param layout - Structure of the bracket.
 * @param metaData - Additional metadata to be stored with the bracket.
 */
declare class BracketEvent {
  entrants: Array<BracketEntrant>;
  sets: Array<BracketSet>;
  state: string;
  layout: TournamentStructures | string;
  numberOfEntrants: number;
  root: BracketSet | undefined;
  extraRoot?: BracketSet;
  upperBracketRoot?: BracketSet;
  lowerBracketRoot?: BracketSet;
  constructor(props: {
    sets?: Set[];
    entrants: Entrant[];
    layout: TournamentStructures | string;
    metaData?: {
      [key: string]: any;
    };
    state?: string;
  });
  /**
   * Maps imported [sets]{@link Set} to [bracket sets.]{@link BracketSet}
   * @param importedSets - Sets from a [tournament]{@link Tournament}
   * */
  mapSets(importedSets: Set[]): void;
  /**
   * Creates [bracket entrants]{@link BracketEntrant} from [entrants]{@link Entrant}.
   * @param entrants - [Entrants]{@link Entrant} from a [tournament]{@link Tournament}
   * @returns - [Bracket entrants]{@link BracketEntrant}
   * */
  createEntrants(entrants: Entrant[]): BracketEntrant[];
  /**
   * Export [bracket sets.]{@link BracketSet} as [sets]{@link Set}.
   * @returns - [OBF sets]{@link Set}
   * */
  exportSets(): Set[];
  /**
   * Assigns [bracket entrants]{@link BracketEntrant} to the correct seeded [bracket sets.]{@link BracketSet}
   * @param entrants - [Bracket entrants]{@link BracketEntrant}
   */
  assignEntrants(entrants: BracketEntrant[]): void;
  /**
   * Create [bracket sets]{@link BracketSet} to be used in the [tournament.]{@link BracketEvent}
   * @param numberOfEntrants - Number of entrants in the bracket
   * @returns - [Bracket sets.]{@link BracketSet}
   * */
  createBracketSets(numberOfEntrants?: number): BracketSet;
  /**
   * Project progressions based on the seeding of the [bracket entrants.]{@link BracketEntrant}
   * @returns - Array of seed placements for each round
   * */
  generateProjections(): number[][];
  /**
   * Link [bracket sets]{@link BracketSet} together based on the [bracket layout.]{@link TournamentStructures}
   * @param currentRoundSets - [Bracket sets]{@link BracketSet} for the current round
   * @param previousRoundSets - [Bracket sets]{@link BracketSet} for the previous round
   * */
  linkBracketSets({
    currentRoundSets,
    previousRoundSets
  }: {
    currentRoundSets: BracketSet[];
    previousRoundSets: BracketSet[];
  }): void;
  /**
   * Generate round one positions based on the seeding of the [bracket entrants.]{@link BracketEntrant}
   * @returns - Array of [bracket entrants]{@link BracketEntrant} for round one.
   * */
  round1Positions(): (BracketEntrant | undefined)[];
  /**
   * Add a lower bracket for [double elimination.]{@link TournamentStructures}
   * @param winnersFinals - [Bracket set]{@link BracketSet} for the finals of the winners bracket
   * @returns - Root [bracket set]{@link BracketSet} for the lower bracket
   * */
  attachLowerBracket(winnersFinals: BracketSet): BracketSet;
  /**
   * Links [bracket sets]{@link BracketSet} in the lower bracket for [double elimination.]{@link TournamentStructures}
   * @param losersBracket - Root [bracket set]{@link BracketSet} for the lower bracket
   * @returns - Root [bracket set]{@link BracketSet} for the lower bracket
   * */
  linkLosersSets(losersBracket: BracketSet[]): BracketSet;
  /**
   * Create [bracket sets]{@link BracketSet} for a lower bracket in [double elimination.]{@link TournamentStructures}
   * @param winnersFinals - Root [bracket set]{@link BracketSet} for the winners bracket
   * @returns - [Bracket set]{@link BracketSet} for the finals of the lower bracket
   */
  createLosersBracketSets(winnersFinals: BracketSet): BracketSet;
  /**
   * Get all [bracket sets]{@link BracketSet} from the upper bracket.
   * Will default to all available sets if there is no lower bracket.
   * @returns - Array of [bracket sets]{@link BracketSet} from the upper bracket.
   * */
  getAllUpperBracketSets(): (BracketSet | undefined)[];
  /**
   * Get all [bracket sets]{@link BracketSet} from the lower bracket.
   * Will default to all available sets if there is no lower bracket.
   * @returns - Array of [bracket sets]{@link BracketSet} from the lower bracket.
   * */
  getAllLowerBracketSets(): BracketSet[];
  /**
   * Get [bracket sets]{@link BracketSet} by round.
   * @param round - Which round number to filter by.
   * @param type - which type of bracket sets to return.
   * Defaults to upper.
   * @returns - Array of [bracket sets]{@link BracketSet} for the specified round.
   * */
  getSetsByRound(round: number, type?: "winners" | "losers"): BracketSet[];
  /**
   * Calculates the number of rounds needed to complete the bracket.
   *
   * @param size The number of entrants in the bracket.
   * Defaults to the number of entrants.
   * @returns The total number of rounds for the bracket.
   * */
  calculateRounds(size?: number): number;
  /**
   * Calculates the number of [bracket sets]{@link BracketSet} in a given round.
   *
   * @param round The round number to calculate sets for.
   * @param size The number of entrants in the bracket.
   */
  calculateNumberOfSetsByRound: ({
    round,
    numberOfEntrants
  }: {
    round: number;
    numberOfEntrants: number;
  }) => number;
  /**
   * Finds the highest power of 2 that is greater than or equal to the specified number.
   * @param threshold - The number to find the highest power of 2 for.
   * @returns The highest power of 2 that is greater than or equal to the specified number.
   * */
  findHighestPowerOf2(threshold?: number): number;
  /**
   * Checks if a number is a power of 2.
   * @param x - The number to check.
   * @returns True if the number is a power of 2, false otherwise.
   * */
  isPowerOf2(x: number): boolean;
}
//#endregion
export { BracketEntrant, BracketEvent, BracketSet };