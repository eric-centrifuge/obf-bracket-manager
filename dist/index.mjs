//#region lib/@types/obf.ts
let SetStatus = /* @__PURE__ */ function(SetStatus$1) {
	SetStatus$1["Completed"] = "completed";
	SetStatus$1["Started"] = "started";
	SetStatus$1["Pending"] = "pending";
	return SetStatus$1;
}({});
let EventState = /* @__PURE__ */ function(EventState$1) {
	EventState$1["Open"] = "open";
	EventState$1["Pending"] = "pending";
	EventState$1["Started"] = "started";
	EventState$1["Completed"] = "completed";
	EventState$1["Finalized"] = "finalized";
	return EventState$1;
}({});
let TournamentStructures = /* @__PURE__ */ function(TournamentStructures$1) {
	TournamentStructures$1["SingleElimination"] = "single elimination";
	TournamentStructures$1["DoubleElimination"] = "double elimination";
	TournamentStructures$1["RoundRobin"] = "round robin";
	return TournamentStructures$1;
}({});

//#endregion
//#region lib/classes/BracketSet.ts
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
var BracketSet = class {
	/** Unique ID of this [set]{@link Set}. */
	setId;
	/** [Entrant]{@link BracketEntrant} 1 of this [set]{@link Set}.*/
	leftEntrant;
	/** [Entrant]{@link BracketEntrant} 2 of this [set]{@link Set}.*/
	rightEntrant;
	/** Set [results]{@link SetGameResult} for [Entrant]{@link BracketEntrant} 1.*/
	entrant1Result;
	/** Set [results]{@link SetGameResult} for [Entrant]{@link BracketEntrant} 2.*/
	entrant2Result;
	/** Score for [Entrant]{@link BracketEntrant} 1.*/
	entrant1Score = 0;
	/** Score for [Entrant]{@link BracketEntrant} 2.*/
	entrant2Score = 0;
	/** Left child of this [set]{@link Set}. */
	leftSet;
	/** Right child of this [set]{@link Set}. */
	rightSet;
	/** Parent of this [set]{@link Set}. */
	parentSet;
	/** The upper [bracket set]{@link BracketSet} that precedes the left slot of this [set]{@link Set}. */
	leftUpperBracketSet;
	/** The upper [bracket set]{@link BracketSet} that precedes the right slot of this [set]{@link Set}. */
	rightUpperBracketSet;
	/** The lower [bracket set]{@link BracketSet} assigned to this [set]{@link Set}. */
	loserSet;
	/** The round this set belongs to. */
	round;
	/** The required number of victories to declare a winner (Default: 3). */
	numberToWin = 3;
	/** [Status]{@link SetStatus} for this set (Default: "pending"). */
	status;
	type = "winners";
	/** Final placement of this set in the tournament (Default: 0). */
	placement = 0;
	constructor(props) {
		const { setId, leftEntrant, rightEntrant, leftSet, rightSet, parentSet, leftUpperBracketSet, rightUpperBracketSet, loserSet, round, type = "winners", status = SetStatus.Pending, placement, numberToWin = 3 } = props;
		this.setId = setId;
		this.leftEntrant = leftEntrant;
		this.rightEntrant = rightEntrant;
		this.addLeftSet(leftSet);
		this.addRightSet(rightSet);
		this.leftUpperBracketSet = leftUpperBracketSet;
		this.rightUpperBracketSet = rightUpperBracketSet;
		this.loserSet = loserSet;
		this.parentSet = parentSet;
		this.placement = placement ? placement : 0;
		this.round = round;
		this.type = type;
		this.status = status;
		this.numberToWin = numberToWin || 3;
	}
	/**
	* Checks if this set is the left child of its parent.
	* @returns - True if this set is the left child of its parent, false otherwise.
	* */
	isLeftChild() {
		if (!this.parentSet) return false;
		if (this.parentSet.leftSet) return this.setId === this.parentSet.leftSet.setId;
		return false;
	}
	/**
	* Checks if this set is the right child of its parent.
	* @returns - True if this set is the right child of its parent, false otherwise.
	* */
	isRightChild() {
		if (!this.parentSet) return false;
		if (this.parentSet.rightSet) return this.setId === this.parentSet.rightSet.setId;
		return false;
	}
	/**
	* Checks if the left entrant slot is linked to an upper bracket set.
	* @returns - True if linked to an upper bracket set, false otherwise.
	* */
	isLeftWinner() {
		if (this.type === "losers") return false;
		if (!this.loserSet) return false;
		if (!this.loserSet.leftUpperBracketSet) return false;
		return this.loserSet.leftUpperBracketSet.setId === this.setId;
	}
	/**
	* Checks if the right entrant slot is linked to an upper bracket set.
	* @returns - True if linked to an upper bracket set, false otherwise.
	* */
	isRightWinner() {
		if (this.type === "losers") return false;
		if (!this.loserSet) return false;
		if (!this.loserSet.rightUpperBracketSet) return false;
		return this.loserSet.rightUpperBracketSet.setId === this.setId;
	}
	/**
	* Checks if this set is the only child of its parent.
	* @returns - True if this set has no siblings, false otherwise.
	* */
	isOnlyChild() {
		if (!this.parentSet) return false;
		return !this.parentSet.rightSet;
	}
	/**
	* Calculates the final placement of this set in its parent.
	* @param placement - Current placement of this set.
	* @param node - Current node in the tree.
	* @returns - Final placement of this set in the tournament.
	*/
	getPlacement(placement = 1, node = this) {
		let finalPlacement = placement + 1;
		if (node.parentSet) finalPlacement = this.getPlacement(placement + 1, node.parentSet);
		return finalPlacement;
	}
	/**
	* Get the sibling of this set.
	* @returns - Sibling set of this set, undefined otherwise.
	* */
	getSibling() {
		if (!this.parentSet) return void 0;
		if (this.isLeftChild()) return this.parentSet.rightSet;
		else if (this.isRightChild()) return this.parentSet.leftSet;
		else return void 0;
	}
	/**
	* Add a child to this set.
	* @param node - Child to add.
	* @returns - True if child was added, false otherwise.
	* */
	addSet(node) {
		if (!node) return false;
		if (!this.leftSet) this.addLeftSet(node);
		else this.addRightSet(node);
		node.assignParentSet(this);
		return true;
	}
	/**
	* Add a left child to this set.
	* @param set - Left child [set]{@link BracketSet} to add.
	* @returns - True if child was added, false otherwise.
	* */
	addLeftSet(set) {
		if (!set) return false;
		this.leftSet = set;
		return true;
	}
	/**
	* Add a right child to this set.
	* @param set - Right child [set]{@link BracketSet} to add.
	* @returns - True if child was added, false otherwise.
	* */
	addRightSet(set) {
		if (!set) return;
		this.rightSet = set;
	}
	/**
	* Assigns a [bracket set]{@link BracketSet} as the lower bracket progression of this set.
	* @param losersSet - [Bracket set]{@link BracketSet} to attach.
	* */
	assignLowerBracketSet(losersSet) {
		if (!losersSet) return;
		if (!losersSet.leftUpperBracketSet && !losersSet.leftSet) losersSet.leftUpperBracketSet = this;
		else if (!losersSet.rightUpperBracketSet && !losersSet.rightSet) losersSet.rightUpperBracketSet = this;
		this.loserSet = losersSet;
	}
	/**
	* Assign a [bracket entrant]{@link BracketEntrant} as the left slot of this set.
	* @param entrant - [Bracket entrant]{@link BracketEntrant} to assign.
	* @returns - True if entrant was assigned, false otherwise.
	* */
	assignLeftEntrant(entrant) {
		if (!entrant) return false;
		this.leftEntrant = entrant;
		return true;
	}
	/**
	* Assign a [bracket entrant]{@link BracketEntrant} as the right slot of this set.
	* @param entrant - [Bracket entrant]{@link BracketEntrant} to assign.
	* @returns - True if entrant was assigned, false otherwise.
	* */
	assignRightEntrant(entrant) {
		if (!entrant) return;
		this.rightEntrant = entrant;
	}
	/**
	* Assign a [bracket entrant]{@link BracketEntrant} to any available slot of this set.
	* @param entrant - [Bracket entrant]{@link BracketEntrant} to assign.
	* @returns - True if entrant was assigned, false otherwise.
	* */
	assignEntrant(entrant) {
		if (!entrant) return;
		if (!this.leftEntrant) this.leftEntrant = entrant;
		else if (!this.rightEntrant) this.rightEntrant = entrant;
	}
	/**
	* Assign a [bracket set]{@link BracketSet} as the parent of this set.
	* @param parent - [Set]{@link BracketSet} to use as the parent set.
	* */
	assignParentSet(parent) {
		this.parentSet = parent;
	}
	/**
	* Update the scores of this set.
	* @param isP1 - True if the score is for the first entrant, false for the second entrant.
	* @param score - New score of the entrant.
	* */
	updateScore(isP1, score) {
		if (isP1) this.entrant1Score = score;
		else this.entrant2Score = score;
	}
};
var BracketSet_default = BracketSet;

//#endregion
//#region lib/classes/BracketEntrant.ts
/**
* Main class representing an [entrant]{@link Entrant} in a Tournament Bracket.
* @class BracketEntrant
* @param entrantTag - Name of the entrant.
* @param initialSeed - Starting seed of the entrant.
* @param finalPlacement - Final placement of the entrant in the bracket.
* @param other - Additional metadata to be stored with the entrant.
*/
var BracketEntrant = class {
	/** Unique ID of the [entrant.]{@link Entrant} */
	entrantID;
	/** Name of the [entrant.]{@link Entrant} */
	entrantTag = "";
	/** Initial seed of the [entrant.]{@link Entrant} */
	initialSeed;
	/** Final placement of the [entrant.]{@link Entrant} */
	finalPlacement;
	constructor(props) {
		const { entrantID, initialSeed, entrantTag, finalPlacement } = props;
		this.entrantID = entrantID;
		this.initialSeed = initialSeed || 0;
		this.entrantTag = entrantTag;
		this.finalPlacement = finalPlacement || 0;
	}
	/**
	* Assign a seed for this entrant.
	* @param seed - The seed to assign.
	* */
	assignSeed(seed) {
		this.initialSeed = seed;
	}
	/**
	* Assign a name for this entrant.
	* @param name - The name to assign.
	* */
	assignName(name) {
		this.entrantTag = name;
	}
};
var BracketEntrant_default = BracketEntrant;

//#endregion
//#region lib/classes/BracketEvent.ts
/**
* Main class representing a Tournament Bracket.
* @class BracketEvent
* @param entrants - Array of [entrants]{@link Entrant} to use for the tournament.
* @param sets - Array of imported [sets]{@link Set} to map to the bracket.
* Optional.
* @param layout - Structure of the bracket.
* @param metaData - Additional metadata to be stored with the bracket.
*/
var BracketEvent = class {
	entrants = [];
	sets = [];
	state = EventState.Pending;
	layout = TournamentStructures.SingleElimination;
	numberOfEntrants = 3;
	root;
	extraRoot;
	upperBracketRoot;
	lowerBracketRoot;
	constructor(props) {
		const { entrants, layout, state, sets } = props;
		this.state = state || EventState.Pending;
		this.numberOfEntrants = entrants.length;
		this.layout = layout;
		this.entrants = this.createEntrants(entrants);
		this.sets = [];
		this.root = this.entrants.length > 1 ? this.createBracketSets() : void 0;
		this.upperBracketRoot = this.root;
		if (this.entrants.length > 1) this.assignEntrants(this.entrants);
		if (this.root) {
			if (layout.toLowerCase() === TournamentStructures.SingleElimination.toLowerCase()) new Array(this.calculateRounds()).fill(0).map((number, index) => this.getSetsByRound(number + index + 1)).reverse().flat().map((set, index) => {
				set.placement = 2 + index;
				return set;
			});
			else if (layout.toLowerCase() === TournamentStructures.DoubleElimination.toLowerCase()) {
				this.upperBracketRoot = this.attachLowerBracket(this.root);
				const losersFinals = this.getAllLowerBracketSets().slice(-1)[0];
				const loserRounds = losersFinals ? losersFinals.round : 0;
				new Array(loserRounds).fill(0).map((number, index) => this.getSetsByRound(number + index + 1, "losers")).reverse().flat().map((set, index) => {
					set.placement = 3 + index;
					return set;
				});
			}
			if (sets) this.mapSets(sets);
		}
	}
	/**
	* Maps imported [sets]{@link Set} to [bracket sets.]{@link BracketSet}
	* @param importedSets - Sets from a [tournament]{@link Tournament}
	* */
	mapSets(importedSets) {
		importedSets.forEach((importedSet) => {
			const bracketSet = this.sets.find((set) => `${set.setId}` === `${importedSet.setID}`);
			if (bracketSet) {
				bracketSet.status = importedSet.status;
				bracketSet.entrant1Result = importedSet.entrant1Result;
				bracketSet.entrant2Result = importedSet.entrant2Result;
				if (importedSet.entrant1ID) {
					const foundEntrant = this.entrants.find((entrant) => entrant.entrantID === importedSet.entrant1ID);
					if (foundEntrant) {
						bracketSet.assignLeftEntrant(foundEntrant);
						bracketSet.updateScore(true, importedSet.entrant1Score);
					}
				}
				if (importedSet.entrant2ID) {
					const foundEntrant = this.entrants.find((entrant) => entrant.entrantID === importedSet.entrant2ID);
					if (foundEntrant) {
						bracketSet.assignRightEntrant(foundEntrant);
						bracketSet.updateScore(false, importedSet.entrant2Score);
					}
				}
			}
		});
	}
	/**
	* Creates [bracket entrants]{@link BracketEntrant} from [entrants]{@link Entrant}.
	* @param entrants - [Entrants]{@link Entrant} from a [tournament]{@link Tournament}
	* @returns - [Bracket entrants]{@link BracketEntrant}
	* */
	createEntrants(entrants) {
		return entrants.map((entrant, index) => new BracketEntrant_default({
			entrantID: entrant.entrantID,
			initialSeed: entrant.initialSeed || index + 1,
			entrantTag: entrant.entrantTag,
			other: { ...entrant.other }
		}));
	}
	/**
	* Export [bracket sets.]{@link BracketSet} as [sets]{@link Set}.
	* @returns - [OBF sets]{@link Set}
	* */
	exportSets() {
		return this.sets.map((set) => {
			const { entrant1Result, entrant2Result, entrant1Score, entrant2Score, status, leftEntrant, rightEntrant, setId, round, leftUpperBracketSet, rightUpperBracketSet, parentSet, loserSet, leftSet, rightSet, type, numberToWin: matchLimit } = set;
			return {
				setID: `${setId}`,
				status,
				phaseID: ``,
				roundID: `${type === "winners" ? round : -round}`,
				setFormat: `${this.layout}`,
				entrant1ID: leftEntrant ? leftEntrant.entrantID : "null",
				entrant2ID: rightEntrant ? rightEntrant.entrantID : "null",
				entrant1Result: `${entrant1Result}`,
				entrant2Result: `${entrant2Result}`,
				entrant1Score,
				entrant2Score,
				entrant1NextSetID: parentSet ? `${parentSet.setId}` : "null",
				entrant2NextSetID: parentSet ? `${parentSet.setId}` : "null",
				entrant1PrevSetID: leftSet ? `${leftSet.setId}` : leftUpperBracketSet ? `${leftUpperBracketSet.setId}` : "null",
				entrant2PrevSetID: rightSet ? `${rightSet.setId}` : rightUpperBracketSet ? `${rightUpperBracketSet.setId}` : "null",
				games: [],
				other: {
					matchLimit,
					nextWinnerSet: parentSet ? `${parentSet.setId}` : `null`,
					nextLoserSet: loserSet && `${loserSet.setId}`,
					nextLeftWinnerSlot: parentSet ? `${parentSet.setId}` : `null`,
					nextRightWinnerSlot: parentSet ? `${parentSet.setId}` : `null`,
					nextLeftLoserSlot: loserSet && loserSet.leftUpperBracketSet && loserSet.leftUpperBracketSet.setId === setId ? loserSet.setId : `null`,
					nextRightLoserSlot: loserSet && loserSet.rightUpperBracketSet && loserSet.rightUpperBracketSet.setId === setId ? loserSet.setId : `null`,
					leftSet: leftSet && leftSet.setId,
					rightSet: rightSet && rightSet.setId,
					label: `${setId}`
				}
			};
		});
	}
	/**
	* Assigns [bracket entrants]{@link BracketEntrant} to the correct seeded [bracket sets.]{@link BracketSet}
	* @param entrants - [Bracket entrants]{@link BracketEntrant}
	*/
	assignEntrants(entrants) {
		const round1Sets = this.getSetsByRound(1);
		const round2Sets = this.getSetsByRound(2);
		if ([TournamentStructures.SingleElimination, TournamentStructures.DoubleElimination].includes(this.layout)) {
			const round1Entrants = this.round1Positions();
			const round1GroupedEntrants = Array(round1Entrants.length / 2).fill(0).map(() => {
				const entrant1 = round1Entrants.shift();
				const entrant2 = round1Entrants.shift();
				return [entrants.find((entrant) => {
					if (entrant1) return entrant.initialSeed === entrant1.initialSeed;
					else return false;
				}), entrants.find((entrant) => {
					if (entrant2) return entrant.initialSeed === entrant2.initialSeed;
					else return false;
				})];
			});
			const byes = round1GroupedEntrants.filter((entrants$1) => entrants$1[0] && !entrants$1[1]).flat().filter((entrant) => entrant);
			const fillRound1 = () => {
				const round1Entrants$1 = round1GroupedEntrants.filter((entrants$1) => entrants$1[0] && entrants$1[1]).flat();
				round1Sets.forEach((set) => {
					const entrant1 = round1Entrants$1.shift();
					const entrant2 = round1Entrants$1.shift();
					entrant1 && set.assignEntrant(entrant1);
					set.assignEntrant(entrant2);
				});
			};
			fillRound1();
			while (byes.length) round2Sets.forEach((set) => {
				if (!set.leftSet && !set.rightSet) {
					if (!set.leftEntrant) set.assignLeftEntrant(byes.shift());
					if (!set.rightEntrant) set.assignRightEntrant(byes.shift());
				} else if (!set.rightSet && !set.rightEntrant) set.assignRightEntrant(byes.shift());
				else if (!set.leftSet && !set.leftEntrant) set.assignLeftEntrant(byes.shift());
			});
		} else if (this.layout === TournamentStructures.RoundRobin) {
			const totalRounds = this.calculateRounds();
			entrants = entrants.sort((a, b) => a.initialSeed - b.initialSeed).slice(0);
			let rotatingIndex = 0;
			if (this.entrants.length % 2) entrants.push(void 0);
			for (let round = 1; round <= totalRounds; round++) {
				const roundSets = this.getSetsByRound(round);
				new Array(entrants.length / 2).fill(0).map((value, index) => [entrants[index], entrants[entrants.length - 1 - index]]).forEach(([entrant1, entrant2]) => {
					if (entrant1 && entrant2) {
						const set = roundSets.shift();
						if (set) {
							set.assignLeftEntrant(entrant1);
							set.assignRightEntrant(entrant2);
							rotatingIndex = rotatingIndex >= entrants.length - 1 ? 0 : rotatingIndex + 1;
						}
					}
				});
				entrants.splice(1, 0, entrants.pop());
			}
		}
	}
	/**
	* Create [bracket sets]{@link BracketSet} to be used in the [tournament.]{@link BracketEvent}
	* @param numberOfEntrants - Number of entrants in the bracket
	* @returns - [Bracket sets.]{@link BracketSet}
	* */
	createBracketSets(numberOfEntrants = this.numberOfEntrants) {
		if (numberOfEntrants < 2) return new BracketSet_default({
			setId: 0,
			round: 0
		});
		let currentRound = 1;
		let previousRoundSets = [];
		const winnersSets = [];
		const numberOfRounds = this.calculateRounds(numberOfEntrants);
		while (currentRound <= numberOfRounds) {
			const lastIndex = previousRoundSets.length ? previousRoundSets.slice(-1)[0].setId : 0;
			const currentRoundSets = [];
			for (let index = 0; index < this.calculateNumberOfSetsByRound({
				round: currentRound,
				numberOfEntrants
			}); index++) {
				const set = new BracketSet_default({
					setId: index + 1 + (lastIndex || 0),
					round: currentRound
				});
				currentRoundSets.push(set);
				this.sets.push(set);
			}
			if (previousRoundSets.length) {
				if (["single elimination", "double elimination"].includes(this.layout)) this.linkBracketSets({
					currentRoundSets,
					previousRoundSets
				});
			}
			previousRoundSets = currentRoundSets;
			winnersSets.push(...currentRoundSets);
			currentRound++;
		}
		return winnersSets && winnersSets.slice(-1)[0];
	}
	/**
	* Project progressions based on the seeding of the [bracket entrants.]{@link BracketEntrant}
	* @returns - Array of seed placements for each round
	* */
	generateProjections() {
		const totalRounds = this.calculateRounds();
		const seedsByRound = [];
		for (let i = 0; i < totalRounds; i++) seedsByRound[i] = [];
		seedsByRound[totalRounds] = [1, 2];
		for (let currentRound = totalRounds; currentRound > 0; currentRound--) {
			const currentRoundSeeds = seedsByRound[currentRound];
			const previousRoundSeeds = seedsByRound[currentRound - 1];
			const numberOfSeedsInPreviousRound = currentRoundSeeds.length * 2;
			if (previousRoundSeeds) currentRoundSeeds.forEach((seed, index) => {
				previousRoundSeeds[index * 2] = seed;
				previousRoundSeeds[index * 2 + 1] = numberOfSeedsInPreviousRound + 1 - seed;
			});
		}
		return seedsByRound;
	}
	/**
	* Link [bracket sets]{@link BracketSet} together based on the [bracket layout.]{@link TournamentStructures}
	* @param currentRoundSets - [Bracket sets]{@link BracketSet} for the current round
	* @param previousRoundSets - [Bracket sets]{@link BracketSet} for the previous round
	* */
	linkBracketSets({ currentRoundSets, previousRoundSets }) {
		const round1Entrants = this.generateProjections()[1].map((seed) => this.entrants.find((entrant) => entrant.initialSeed === seed));
		const round1Sets = Array(this.generateProjections()[1].length / 2).fill(0).map(() => {
			return [round1Entrants.shift(), round1Entrants.shift()];
		});
		currentRoundSets.forEach((set) => {
			if (set.round === 2 && !this.isPowerOf2(this.numberOfEntrants)) {
				const round1Set1 = round1Sets.shift();
				round1Set1 && round1Set1[1] && set.addSet(previousRoundSets.shift());
				const round1Set2 = round1Sets.shift();
				round1Set2 && round1Set2[1] && set.addSet(previousRoundSets.shift());
			} else {
				set.addSet(previousRoundSets.shift());
				set.addSet(previousRoundSets.shift());
			}
		});
	}
	/**
	* Generate round one positions based on the seeding of the [bracket entrants.]{@link BracketEntrant}
	* @returns - Array of [bracket entrants]{@link BracketEntrant} for round one.
	* */
	round1Positions() {
		if (!this.entrants) return [];
		return this.generateProjections()[1].map((seed) => this.entrants.find((entrant) => entrant.initialSeed === seed));
	}
	/**
	* Add a lower bracket for [double elimination.]{@link TournamentStructures}
	* @param winnersFinals - [Bracket set]{@link BracketSet} for the finals of the winners bracket
	* @returns - Root [bracket set]{@link BracketSet} for the lower bracket
	* */
	attachLowerBracket(winnersFinals) {
		if (!winnersFinals) return winnersFinals;
		const grandFinals = new BracketSet_default({
			setId: winnersFinals.setId * 2,
			type: "winners",
			round: winnersFinals.round + 1
		});
		const grandFinalsReset = new BracketSet_default({
			setId: winnersFinals.setId * 2 + 1,
			type: "winners",
			round: winnersFinals.round + 2
		});
		this.sets.push(grandFinals, grandFinalsReset);
		this.lowerBracketRoot = this.createLosersBracketSets(winnersFinals);
		this.upperBracketRoot = grandFinals;
		if (this.numberOfEntrants > 2) {
			winnersFinals.assignLowerBracketSet(this.lowerBracketRoot);
			grandFinals.addLeftSet(winnersFinals);
			winnersFinals.assignParentSet(grandFinals);
			grandFinals.addRightSet(this.lowerBracketRoot);
			this.lowerBracketRoot.assignParentSet(grandFinals);
			grandFinals.assignLowerBracketSet(grandFinalsReset);
			this.root = grandFinals;
			this.extraRoot = grandFinalsReset;
			grandFinalsReset.addSet(grandFinals);
			grandFinals.assignParentSet(grandFinalsReset);
		}
		return grandFinalsReset;
	}
	/**
	* Links [bracket sets]{@link BracketSet} in the lower bracket for [double elimination.]{@link TournamentStructures}
	* @param losersBracket - Root [bracket set]{@link BracketSet} for the lower bracket
	* @returns - Root [bracket set]{@link BracketSet} for the lower bracket
	* */
	linkLosersSets(losersBracket) {
		const numberOfRounds = losersBracket[losersBracket.length - 1].round;
		const winnersRound1 = this.getSetsByRound(1);
		const winnersRound2 = this.getSetsByRound(2);
		let firstTimeLoserSets = this.getAllUpperBracketSets();
		let round = 1;
		while (round <= numberOfRounds) {
			const currentRoundSets = losersBracket.filter((node) => node.round === round);
			const nextRoundSets = losersBracket.filter((node) => node.round === round + 1);
			switch (round) {
				case 1:
					winnersRound1.filter((set) => set.isLeftChild()).forEach((round1Set, index) => {
						const loserSet = currentRoundSets.find((set) => !set.parentSet);
						const parentIndex = winnersRound2.findIndex((parentSet) => parentSet.setId === round1Set.parentSet.setId);
						const round2Set = winnersRound2.slice(0).reverse()[parentIndex];
						if (winnersRound1.every((set) => set.getSibling())) {
							round1Set.assignLowerBracketSet(currentRoundSets[index]);
							round1Set.getSibling().assignLowerBracketSet(currentRoundSets[index]);
							nextRoundSets[index].addSet(currentRoundSets[index]);
						} else if (winnersRound1.every((set) => !set.getSibling())) {
							round2Set.assignLowerBracketSet(loserSet);
							round1Set.assignLowerBracketSet(loserSet);
							if (nextRoundSets[Math.floor(parentIndex / 2)]) nextRoundSets[Math.floor(parentIndex / 2)].addSet(loserSet);
							else {
								const setMatch = nextRoundSets.find((set) => !set.leftUpperBracketSet || !set.rightUpperBracketSet);
								if (setMatch) setMatch.addSet(loserSet);
							}
						} else if (round1Set.getSibling()) {
							round1Set.assignLowerBracketSet(loserSet);
							round1Set.getSibling().assignLowerBracketSet(loserSet);
							if (nextRoundSets[index] && loserSet) {
								nextRoundSets[index].addSet(loserSet);
								round2Set.assignLowerBracketSet(loserSet.parentSet);
							}
						} else {
							winnersRound2.slice(0).reverse()[index].assignLowerBracketSet(nextRoundSets[index]);
							round1Set.assignLowerBracketSet(nextRoundSets[index]);
						}
					});
					this.getAllUpperBracketSets().filter((set) => set && set.loserSet).forEach((set) => {
						firstTimeLoserSets = firstTimeLoserSets.filter((firstTimeLoserSet) => firstTimeLoserSet && set && firstTimeLoserSet.setId !== set.setId);
					});
					break;
				default:
					if (nextRoundSets.length) {
						if (currentRoundSets.length !== nextRoundSets.length) currentRoundSets.forEach((set) => {
							const parent = nextRoundSets.find((parent$1) => !parent$1.leftSet || !parent$1.rightSet);
							if (parent) parent.addSet(set);
						});
						else currentRoundSets.forEach((set, index) => {
							const parent = nextRoundSets[index];
							if (parent) parent.addSet(set);
						});
						if (firstTimeLoserSets.length) {
							if (round === 2) currentRoundSets.reverse();
							currentRoundSets.forEach((set) => {
								if (!set.leftUpperBracketSet && !set.leftSet) firstTimeLoserSets.shift().assignLowerBracketSet(set);
								if (!set.rightUpperBracketSet && !set.rightSet) firstTimeLoserSets.shift().assignLowerBracketSet(set);
							});
						}
					}
					break;
			}
			round++;
		}
		return losersBracket.slice(-1)[0];
	}
	/**
	* Create [bracket sets]{@link BracketSet} for a lower bracket in [double elimination.]{@link TournamentStructures}
	* @param winnersFinals - Root [bracket set]{@link BracketSet} for the winners bracket
	* @returns - [Bracket set]{@link BracketSet} for the finals of the lower bracket
	*/
	createLosersBracketSets(winnersFinals) {
		if (this.numberOfEntrants <= 2) return winnersFinals;
		const losersSets = [];
		const firstTimeLosers = this.getSetsByRound(1).length + this.getSetsByRound(2).length;
		const firstTimeLosersByes = this.findHighestPowerOf2(firstTimeLosers) - firstTimeLosers;
		const setId = winnersFinals.setId + 1;
		let setIdIncrement = 0;
		let numberOfSets = 0;
		let surplus = 0;
		let round = 1;
		let winnersRound = round;
		while (setIdIncrement < this.numberOfEntrants - 2) {
			const winnersRoundSets = this.getSetsByRound(winnersRound);
			const previousRoundSets = losersSets.filter((set) => set.round === round - 1);
			if (!winnersRoundSets.length) winnersRoundSets.push(...this.getSetsByRound(winnersRound - 1));
			switch (round) {
				case 1:
					numberOfSets = (firstTimeLosers - firstTimeLosersByes) / 2;
					surplus = winnersRoundSets.length - numberOfSets * 2;
					for (let i = 0; i < numberOfSets; i++) {
						losersSets[setIdIncrement] = new BracketSet_default({
							setId: setId + setIdIncrement,
							type: "losers",
							round
						});
						this.sets.push(losersSets[setIdIncrement]);
						setIdIncrement++;
					}
					break;
				case 2:
					numberOfSets = (firstTimeLosersByes + previousRoundSets.length) / 2;
					for (let i = 0; i < numberOfSets; i++) {
						losersSets[setIdIncrement] = new BracketSet_default({
							setId: setId + setIdIncrement,
							type: "losers",
							round
						});
						this.sets.push(losersSets[setIdIncrement]);
						setIdIncrement++;
					}
					surplus = 0;
					break;
				default:
					if (this.isPowerOf2(previousRoundSets.length + winnersRoundSets.length)) numberOfSets = (previousRoundSets.length + winnersRoundSets.length) / 2;
					else if (this.isPowerOf2(previousRoundSets.length + surplus)) {
						numberOfSets = (previousRoundSets.length + surplus) / 2;
						surplus = winnersRoundSets.length;
					} else numberOfSets = previousRoundSets.length / 2;
					for (let i = 0; i < numberOfSets; i++) {
						losersSets[setIdIncrement] = new BracketSet_default({
							setId: setId + setIdIncrement,
							type: "losers",
							round
						});
						this.sets.push(losersSets[setIdIncrement]);
						setIdIncrement++;
					}
					break;
			}
			winnersRound++;
			round++;
		}
		return this.linkLosersSets(losersSets.flat());
	}
	/**
	* Get all [bracket sets]{@link BracketSet} from the upper bracket.
	* Will default to all available sets if there is no lower bracket.
	* @returns - Array of [bracket sets]{@link BracketSet} from the upper bracket.
	* */
	getAllUpperBracketSets() {
		return [this.sets.filter((set) => set.type === "winners"), this.upperBracketRoot || this.root].flat();
	}
	/**
	* Get all [bracket sets]{@link BracketSet} from the lower bracket.
	* Will default to all available sets if there is no lower bracket.
	* @returns - Array of [bracket sets]{@link BracketSet} from the lower bracket.
	* */
	getAllLowerBracketSets() {
		if (!this.lowerBracketRoot) return [];
		return this.sets.filter((set) => set.type === "losers");
	}
	/**
	* Get [bracket sets]{@link BracketSet} by round.
	* @param round - Which round number to filter by.
	* @param type - which type of bracket sets to return.
	* Defaults to upper.
	* @returns - Array of [bracket sets]{@link BracketSet} for the specified round.
	* */
	getSetsByRound(round, type = "winners") {
		if (type) return this.sets.filter((set) => set.round === round && set.type === type) || [];
		return this.sets.filter((set) => set.round === round) || [];
	}
	/**
	* Calculates the number of rounds needed to complete the bracket.
	*
	* @param size The number of entrants in the bracket.
	* Defaults to the number of entrants.
	* @returns The total number of rounds for the bracket.
	* */
	calculateRounds(size = this.numberOfEntrants) {
		let rounds = 1;
		const layout = this.layout;
		if ([TournamentStructures.SingleElimination, TournamentStructures.DoubleElimination].includes(this.layout)) while (Math.pow(2, rounds) < size) rounds++;
		if (TournamentStructures.RoundRobin === layout) rounds = this.entrants.length % 2 ? size : size - 1;
		return rounds;
	}
	/**
	* Calculates the number of [bracket sets]{@link BracketSet} in a given round.
	*
	* @param round The round number to calculate sets for.
	* @param size The number of entrants in the bracket.
	*/
	calculateNumberOfSetsByRound = ({ round, numberOfEntrants = this.numberOfEntrants }) => {
		const layout = this.layout;
		const previousRoundSets = this.getSetsByRound(round - 1);
		if ([TournamentStructures.SingleElimination, TournamentStructures.DoubleElimination].includes(this.layout)) {
			const byesFromRound1 = this.findHighestPowerOf2(numberOfEntrants) - numberOfEntrants;
			switch (round) {
				case 1: return (numberOfEntrants - byesFromRound1) / 2;
				case 2: return (byesFromRound1 + previousRoundSets.length) / 2;
				default: return previousRoundSets.length / 2;
			}
		} else if (TournamentStructures.RoundRobin === layout) return Math.floor(numberOfEntrants / 2);
		return 0;
	};
	/**
	* Finds the highest power of 2 that is greater than or equal to the specified number.
	* @param threshold - The number to find the highest power of 2 for.
	* @returns The highest power of 2 that is greater than or equal to the specified number.
	* */
	findHighestPowerOf2(threshold = this.numberOfEntrants) {
		if (threshold < 2) return threshold;
		if (this.isPowerOf2(threshold)) return threshold;
		let i = 1;
		while (threshold > Math.pow(2, i) && threshold !== Math.pow(2, i)) i++;
		return Math.pow(2, i);
	}
	/**
	* Checks if a number is a power of 2.
	* @param x - The number to check.
	* @returns True if the number is a power of 2, false otherwise.
	* */
	isPowerOf2(x) {
		return Math.log2(x) % 1 === 0;
	}
};
var BracketEvent_default = BracketEvent;

//#endregion
export { BracketEntrant_default as BracketEntrant, BracketEvent_default as BracketEvent, BracketSet_default as BracketSet };