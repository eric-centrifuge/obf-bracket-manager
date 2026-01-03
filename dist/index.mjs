//#region lib/classes/BracketSet.ts
var BracketSet = class {
	setId;
	uuid;
	self;
	leftEntrant;
	rightEntrant;
	entrant1Result;
	entrant2Result;
	entrant1Score = 0;
	entrant2Score = 0;
	entrant1Ready = false;
	entrant2Ready = false;
	entrant1Reported = false;
	entrant2Reported = false;
	leftSet;
	rightSet;
	parentSet;
	leftWinnerSet;
	rightWinnerSet;
	loserSet;
	round;
	numberToWin = 3;
	status;
	type;
	startTime = void 0;
	endTime = void 0;
	onStream = false;
	winner = "";
	loser = "";
	placement;
	other;
	constructor(props) {
		const { setId, uuid, leftEntrant, rightEntrant, leftSet, rightSet, parentSet, leftWinner, rightWinner, loserSet, round, type, status, placement, numberToWin, other } = props;
		this.setId = setId;
		this.uuid = uuid;
		this.self = this;
		this.leftEntrant = leftEntrant;
		this.rightEntrant = rightEntrant;
		this.addLeftSet(leftSet);
		this.addRightSet(rightSet);
		this.leftWinnerSet = leftWinner;
		this.rightWinnerSet = rightWinner;
		this.loserSet = loserSet;
		this.parentSet = parentSet;
		this.placement = placement ? placement : 0;
		this.round = round;
		this.type = type ? type : "winners";
		this.status = status ? status : "pending";
		this.numberToWin = numberToWin || 3;
		this.other = other;
	}
	isLeftChild() {
		if (!this.parentSet) return false;
		if (this.parentSet.leftSet) return this.setId === this.parentSet.leftSet.setId;
		return false;
	}
	isRightChild() {
		if (!this.parentSet) return false;
		if (this.parentSet.rightSet) return this.setId === this.parentSet.rightSet.setId;
		return false;
	}
	isLeftWinner() {
		if (this.type === "losers") return false;
		if (!this.loserSet) return false;
		if (!this.loserSet.leftWinnerSet) return false;
		return this.loserSet.leftWinnerSet.setId === this.setId;
	}
	isRightWinner() {
		if (this.type === "losers") return false;
		if (!this.loserSet) return false;
		if (!this.loserSet.rightWinnerSet) return false;
		return this.loserSet.rightWinnerSet.setId === this.setId;
	}
	isOnlyChild() {
		if (!this.parentSet) return false;
		return !this.parentSet.rightSet;
	}
	getPlacement(placement = 1, node = this) {
		let finalPlacement = placement + 1;
		if (node.parentSet) finalPlacement = this.getPlacement(placement + 1, node.parentSet);
		return finalPlacement;
	}
	getSibling() {
		if (!this.parentSet) return void 0;
		if (this.isLeftChild()) return this.parentSet.rightSet;
		else if (this.isRightChild()) return this.parentSet.leftSet;
		else return void 0;
	}
	addSet(node) {
		if (!node) return;
		if (!this.leftSet) this.addLeftSet(node);
		else this.addRightSet(node);
		node.setParentSet(this.self);
	}
	addLeftSet(set) {
		if (!set) return;
		this.leftSet = set;
	}
	addRightSet(set) {
		if (!set) return;
		this.rightSet = set;
	}
	setLosersSet(losersSet) {
		if (!losersSet) return;
		if (!losersSet.leftWinnerSet && !losersSet.leftSet) losersSet.leftWinnerSet = this;
		else if (!losersSet.rightWinnerSet && !losersSet.rightSet) losersSet.rightWinnerSet = this;
		this.loserSet = losersSet;
	}
	setLeftEntrant(entrant) {
		if (!entrant) return;
		this.leftEntrant = entrant;
	}
	setRightEntrant(entrant) {
		if (!entrant) return;
		this.rightEntrant = entrant;
	}
	setEntrant(entrant) {
		if (!entrant) return;
		if (!this.leftEntrant) this.leftEntrant = entrant;
		else if (!this.rightEntrant) this.rightEntrant = entrant;
	}
	setParentSet(parent) {
		this.parentSet = parent;
	}
	setMetaData(data) {
		this.other = {
			...this.other,
			...data
		};
	}
	updateScore(isP1, score) {
		if (isP1) this.entrant1Score = score;
		else this.entrant2Score = score;
	}
};
var BracketSet_default = BracketSet;

//#endregion
//#region lib/classes/BracketEntrant.ts
var BracketEntrant = class {
	entrantID;
	entrantTag = "";
	initialSeed;
	finalPlacement;
	other;
	constructor(props) {
		const { entrantID, initialSeed, entrantTag, finalPlacement, other } = props;
		this.entrantID = entrantID;
		this.initialSeed = initialSeed || 0;
		this.entrantTag = entrantTag;
		this.finalPlacement = finalPlacement || 0;
		this.other = other;
	}
	setSeed(seed) {
		this.initialSeed = seed;
	}
	setName(name) {
		this.entrantTag = name;
	}
	setMetaData(data) {
		this.other = {
			...this.other,
			...data
		};
	}
};
var BracketEntrant_default = BracketEntrant;

//#endregion
//#region lib/classes/BracketEvent.ts
var BracketEvent = class {
	id;
	numberOfEntrants = 3;
	root;
	state = "pending";
	winnersRoot;
	losersRoot;
	extraRoot;
	entrants;
	sets;
	layout;
	other;
	constructor(props) {
		const { id, entrants, layout, metaData, state, sets } = props;
		this.id = id;
		this.state = state || "pending";
		this.numberOfEntrants = entrants.length;
		this.layout = layout;
		this.entrants = this.createEntrants(entrants);
		this.sets = [];
		this.root = this.entrants.length > 1 ? this.createBracket() : void 0;
		this.winnersRoot = this.root;
		if (metaData) this.addMetaData(metaData);
		if (this.entrants.length > 1) this.assignEntrants();
		if (this.root) {
			if (layout.toLowerCase() === "single elimination") new Array(this.calculateRounds()).fill(0).map((number, index) => this.getSetsByRound(number + index + 1, { type: "winners" })).reverse().flat().map((set, index) => {
				set.placement = 2 + index;
				return set;
			});
			else if (layout.toLowerCase() === "double elimination") {
				this.winnersRoot = this.attachLosersBracket(this.root);
				const losersFinals = this.getAllLosersSets().slice(-1)[0];
				const loserRounds = losersFinals ? losersFinals.round : 0;
				new Array(loserRounds).fill(0).map((number, index) => this.getSetsByRound(number + index + 1, { type: "losers" })).reverse().flat().map((set, index) => {
					set.placement = 3 + index;
					return set;
				});
			}
			if (sets) this.mapSets(sets);
		}
	}
	mapSets(importedSets) {
		importedSets.forEach((importedSet) => {
			const bracketSet = this.sets.find((set) => `${set.setId}` === `${importedSet.setID}`);
			if (bracketSet) {
				bracketSet.status = importedSet.status;
				bracketSet.entrant1Result = importedSet.entrant1Result;
				bracketSet.entrant2Result = importedSet.entrant2Result;
				bracketSet.other = importedSet.other;
				if (importedSet.entrant1ID) {
					const foundEntrant = this.entrants.find((entrant) => entrant.entrantID === importedSet.entrant1ID);
					if (foundEntrant) {
						bracketSet.setLeftEntrant(foundEntrant);
						bracketSet.updateScore(true, importedSet.entrant1Score);
					}
				}
				if (importedSet.entrant2ID) {
					const foundEntrant = this.entrants.find((entrant) => entrant.entrantID === importedSet.entrant2ID);
					if (foundEntrant) {
						bracketSet.setRightEntrant(foundEntrant);
						bracketSet.updateScore(false, importedSet.entrant2Score);
					}
				}
			}
		});
	}
	createEntrants(entrants) {
		return entrants.map((entrant, index) => new BracketEntrant_default({
			entrantID: entrant.entrantID,
			initialSeed: entrant.initialSeed || index + 1,
			entrantTag: entrant.entrantTag,
			other: { ...entrant.other }
		}));
	}
	exportSets() {
		return this.sets.map((set) => {
			const { entrant1Ready, entrant2Ready, entrant1Reported, entrant2Reported, entrant1Result, entrant2Result, entrant1Score, entrant2Score, status, leftEntrant, rightEntrant, other, setId, round, startTime, endTime, onStream, winner, loser, leftWinnerSet, rightWinnerSet, parentSet, loserSet, leftSet, rightSet, type, numberToWin: matchLimit } = set;
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
				entrant1PrevSetID: leftSet ? `${leftSet.setId}` : leftWinnerSet ? `${leftWinnerSet.setId}` : "null",
				entrant2PrevSetID: rightSet ? `${rightSet.setId}` : rightWinnerSet ? `${rightWinnerSet.setId}` : "null",
				games: [],
				other: {
					...other,
					entrant1Ready,
					entrant2Ready,
					entrant1Reported,
					entrant2Reported,
					startTime,
					endTime,
					onStream,
					winner,
					loser,
					matchLimit,
					nextWinnerSet: parentSet ? `${parentSet.setId}` : `null`,
					nextLoserSet: loserSet && `${loserSet.setId}`,
					nextLeftWinnerSlot: parentSet ? `${parentSet.setId}` : `null`,
					nextRightWinnerSlot: parentSet ? `${parentSet.setId}` : `null`,
					nextLeftLoserSlot: loserSet && loserSet.leftWinnerSet && loserSet.leftWinnerSet.setId === setId ? loserSet.setId : `null`,
					nextRightLoserSlot: loserSet && loserSet.rightWinnerSet && loserSet.rightWinnerSet.setId === setId ? loserSet.setId : `null`,
					leftSet: leftSet && leftSet.setId,
					rightSet: rightSet && rightSet.setId,
					label: `${setId}`
				}
			};
		});
	}
	assignEntrants() {
		if (!this.entrants) return;
		const round1Sets = this.getSetsByRound(1, { type: "winners" });
		const round2Sets = this.getSetsByRound(2, { type: "winners" });
		if (["single elimination", "double elimination"].includes(this.layout)) {
			const round1Entrants = this.weaveEntrants();
			const round1GroupedEntrants = Array(round1Entrants.length / 2).fill(0).map(() => {
				const entrant1 = round1Entrants.shift();
				const entrant2 = round1Entrants.shift();
				return [this.entrants.find((entrant) => {
					if (entrant1) return entrant.initialSeed === entrant1.initialSeed;
					else return false;
				}), this.entrants.find((entrant) => {
					if (entrant2) return entrant.initialSeed === entrant2.initialSeed;
					else return false;
				})];
			});
			const byes = round1GroupedEntrants.filter((entrants) => entrants[0] && !entrants[1]).flat().filter((entrant) => entrant);
			const fillRound1 = () => {
				const round1Entrants$1 = round1GroupedEntrants.filter((entrants) => entrants[0] && entrants[1]).flat();
				round1Sets.forEach((set) => {
					const entrant1 = round1Entrants$1.shift();
					const entrant2 = round1Entrants$1.shift();
					entrant1 && set.setEntrant(entrant1);
					set.setEntrant(entrant2);
				});
			};
			fillRound1();
			while (byes.length) round2Sets.forEach((set) => {
				if (!set.leftSet && !set.rightSet) {
					if (!set.leftEntrant) set.setLeftEntrant(byes.shift());
					if (!set.rightEntrant) set.setRightEntrant(byes.shift());
				} else if (!set.rightSet && !set.rightEntrant) set.setRightEntrant(byes.shift());
				else if (!set.leftSet && !set.leftEntrant) set.setLeftEntrant(byes.shift());
			});
		} else if (this.layout === "round robin") {
			const totalRounds = this.calculateRounds();
			const entrants = this.entrants.sort((a, b) => a.initialSeed - b.initialSeed).slice(0);
			let rotatingIndex = 0;
			if (this.entrants.length % 2) entrants.push(void 0);
			for (let round = 1; round <= totalRounds; round++) {
				const roundSets = this.getSetsByRound(round);
				new Array(entrants.length / 2).fill(0).map((value, index) => [entrants[index], entrants[entrants.length - 1 - index]]).forEach(([entrant1, entrant2]) => {
					if (entrant1 && entrant2) {
						const set = roundSets.shift();
						if (set) {
							set.setLeftEntrant(entrant1);
							set.setRightEntrant(entrant2);
							rotatingIndex = rotatingIndex >= entrants.length - 1 ? 0 : rotatingIndex + 1;
						}
					}
				});
				entrants.splice(1, 0, entrants.pop());
			}
		}
	}
	createBracket(size = this.numberOfEntrants) {
		if (size < 2) return new BracketSet_default({
			setId: 0,
			round: 0
		});
		let currentRound = 1;
		let previousRoundSets = [];
		const winnersSets = [];
		const numberOfRounds = this.calculateRounds(size);
		while (currentRound <= numberOfRounds) {
			const lastIndex = previousRoundSets.length ? previousRoundSets.slice(-1)[0].setId : 0;
			const currentRoundSets = [];
			for (let index = 0; index < this.calculateNumberOfSetsPerRound({
				round: currentRound,
				size,
				previousRoundSets
			}); index++) {
				const set = new BracketSet_default({
					setId: index + 1 + (lastIndex || 0),
					round: currentRound
				});
				currentRoundSets.push(set);
				this.sets.push(set);
			}
			if (previousRoundSets.length) {
				if (["single elimination", "double elimination"].includes(this.layout)) this.linkEliminationSets({
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
	linkEliminationSets({ currentRoundSets, previousRoundSets }) {
		const round1Entrants = this.orderSeeds()[1].map((seed) => this.entrants.find((entrant) => entrant.initialSeed === seed));
		const round1Sets = Array(this.orderSeeds()[1].length / 2).fill(0).map(() => {
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
	orderSeeds() {
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
	weaveEntrants() {
		if (!this.entrants) return [];
		return this.orderSeeds()[1].map((seed) => this.entrants.find((entrant) => entrant.initialSeed === seed));
	}
	attachLosersBracket(winnersFinals) {
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
		this.losersRoot = this.createLosersBracket(winnersFinals);
		this.winnersRoot = grandFinals;
		if (this.numberOfEntrants > 2) {
			winnersFinals.setLosersSet(this.losersRoot);
			grandFinals.addLeftSet(winnersFinals);
			winnersFinals.setParentSet(grandFinals);
			grandFinals.addRightSet(this.losersRoot);
			this.losersRoot.setParentSet(grandFinals);
			grandFinals.setLosersSet(grandFinalsReset);
			this.root = grandFinals;
			this.extraRoot = grandFinalsReset;
			grandFinalsReset.addSet(grandFinals);
			grandFinals.setParentSet(grandFinalsReset);
		}
		return grandFinalsReset;
	}
	linkLosersSets(losersBracket) {
		const numberOfRounds = losersBracket[losersBracket.length - 1].round;
		const winnersRound1 = this.getSetsByRound(1, { type: "winners" });
		const winnersRound2 = this.getSetsByRound(2, { type: "winners" });
		let firstTimeLoserSets = this.getAllWinnersSets();
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
							round1Set.setLosersSet(currentRoundSets[index]);
							round1Set.getSibling().setLosersSet(currentRoundSets[index]);
							nextRoundSets[index].addSet(currentRoundSets[index]);
						} else if (winnersRound1.every((set) => !set.getSibling())) {
							round2Set.setLosersSet(loserSet);
							round1Set.setLosersSet(loserSet);
							if (nextRoundSets[Math.floor(parentIndex / 2)]) nextRoundSets[Math.floor(parentIndex / 2)].addSet(loserSet);
							else {
								const setMatch = nextRoundSets.find((set) => !set.leftWinnerSet || !set.rightWinnerSet);
								if (setMatch) setMatch.addSet(loserSet);
							}
						} else if (round1Set.getSibling()) {
							round1Set.setLosersSet(loserSet);
							round1Set.getSibling().setLosersSet(loserSet);
							if (nextRoundSets[index] && loserSet) {
								nextRoundSets[index].addSet(loserSet);
								round2Set.setLosersSet(loserSet.parentSet);
							}
						} else {
							winnersRound2.slice(0).reverse()[index].setLosersSet(nextRoundSets[index]);
							round1Set.setLosersSet(nextRoundSets[index]);
						}
					});
					this.getAllWinnersSets().filter((set) => set && set.loserSet).forEach((set) => {
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
								if (!set.leftWinnerSet && !set.leftSet) firstTimeLoserSets.shift().setLosersSet(set);
								if (!set.rightWinnerSet && !set.rightSet) firstTimeLoserSets.shift().setLosersSet(set);
							});
						}
					}
					break;
			}
			round++;
		}
		return losersBracket.slice(-1)[0];
	}
	createLosersBracket(winnersFinals) {
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
	getAllWinnersSets() {
		return [this.sets.filter((set) => set.type === "winners"), this.winnersRoot || this.root].flat();
	}
	getAllLosersSets() {
		if (!this.losersRoot) return [];
		return this.sets.filter((set) => set.type === "losers");
	}
	getSetsByRound(round, filters) {
		if (filters) {
			const { type } = filters;
			if (type) return this.sets.filter((set) => set.round === round && set.type === type) || [];
		}
		return this.sets.filter((set) => set.round === round) || [];
	}
	calculateRounds(size = this.numberOfEntrants) {
		let rounds = 1;
		const layout = this.layout;
		if (["single elimination", "double elimination"].includes(this.layout)) while (Math.pow(2, rounds) < size) rounds++;
		if ("round robin" === layout) rounds = this.entrants.length % 2 ? size : size - 1;
		return rounds;
	}
	calculateNumberOfSetsPerRound = ({ round, size, previousRoundSets = this.getSetsByRound(round - 1) }) => {
		const layout = this.layout;
		if (["single elimination", "double elimination"].includes(this.layout)) {
			const byesFromRound1 = this.findHighestPowerOf2(size) - size;
			switch (round) {
				case 1: return (size - byesFromRound1) / 2;
				case 2: return (byesFromRound1 + previousRoundSets.length) / 2;
				default: return previousRoundSets.length / 2;
			}
		} else if ("round robin" === layout) return Math.floor(size / 2);
		return 0;
	};
	findHighestPowerOf2(threshold = this.numberOfEntrants) {
		if (threshold < 2) return threshold;
		if (this.isPowerOf2(threshold)) return threshold;
		let i = 1;
		while (threshold > Math.pow(2, i) && threshold !== Math.pow(2, i)) i++;
		return Math.pow(2, i);
	}
	isPowerOf2(x) {
		return Math.log2(x) % 1 === 0;
	}
	addMetaData(data) {
		if (this.other) this.other = Object.assign(this.other, data);
	}
};
var BracketEvent_default = BracketEvent;

//#endregion
export { BracketEntrant_default as BracketEntrant, BracketEvent_default as BracketEvent, BracketSet_default as BracketSet };