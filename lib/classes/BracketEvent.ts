import BracketSet from "./BracketSet"
import BracketEntrant from "./BracketEntrant"
import {Entrant, EventState, Set, SetGameResult, SetStatus, Tournament, TournamentStructures} from "../@types/obf"

/**
 * Main class representing a Tournament Bracket.
 * @class BracketEvent
 * @param entrants - Array of [entrants]{@link Entrant} to use for the tournament.
 * @param sets - Array of imported [sets]{@link Set} to map to the bracket.
 * Optional.
 * @param layout - Structure of the bracket.
 * @param metaData - Additional metadata to be stored with the bracket.
 */
class BracketEvent {
    entrants: Array<BracketEntrant> = []
    sets: Array<BracketSet> = []
    state: string = EventState.Pending
    layout: TournamentStructures | string = TournamentStructures.SingleElimination
    numberOfEntrants = 3
    root: BracketSet | undefined
    extraRoot?: BracketSet
    upperBracketRoot?: BracketSet
    lowerBracketRoot?: BracketSet

    constructor(props: {
        sets?: Set[]
        entrants: Entrant[]
        layout: TournamentStructures | string
        metaData?: {[key: string]: any}
        state?: string
    }) {
        const {
            entrants,
            layout,
            state,
            sets
        } = props
        this.state = state || EventState.Pending
        this.numberOfEntrants = entrants.length
        this.layout = layout
        this.entrants = this.createEntrants(entrants)
        this.sets = []
        this.root = this.entrants.length > 1 ? this.createBracketSets() : undefined
        this.upperBracketRoot = this.root

        if (this.entrants.length > 1) this.assignEntrants(this.entrants)
        if (this.root) {
            if (layout.toLowerCase() === TournamentStructures.SingleElimination.toLowerCase()) {
                new Array(this.calculateRounds())
                    .fill(0)
                    .map((number, index) => this.getSetsByRound(number + index + 1))
                    .reverse()
                    .flat()
                    .map((set, index) => {
                        set.placement = 2 + index
                        return set
                    })
            }
            else if (layout.toLowerCase() === TournamentStructures.DoubleElimination.toLowerCase()) {
                this.upperBracketRoot = this.attachLowerBracket(this.root!)
                const losersFinals = this.getAllLowerBracketSets().slice(-1)[0]
                const loserRounds = losersFinals ? losersFinals.round : 0

                new Array(loserRounds)
                    .fill(0)
                    .map((number, index) => this.getSetsByRound(number + index + 1, "losers"))
                    .reverse()
                    .flat()
                    .map((set, index) => {
                        set.placement = 3 + index
                        return set
                    })
            }

            if (sets) this.mapSets(sets)
        }
    }

    /**
     * Maps imported [sets]{@link Set} to [bracket sets.]{@link BracketSet}
     * @param importedSets - Sets from a [tournament]{@link Tournament}
     * */
    mapSets (importedSets: Set[]) {
        importedSets
            .forEach((importedSet) => {
                const bracketSet = this.sets.find((set) => `${set.setId}` === `${importedSet.setID}`)

                if (bracketSet) {
                    bracketSet.status = importedSet.status
                    bracketSet.entrant1Result = importedSet.entrant1Result
                    bracketSet.entrant2Result = importedSet.entrant2Result

                    if (importedSet.entrant1ID) {
                        const foundEntrant = this.entrants!.find((entrant) => entrant.entrantID === importedSet.entrant1ID)
                        if (foundEntrant) {
                            bracketSet.assignLeftEntrant(foundEntrant)
                            bracketSet.updateScore(true, importedSet.entrant1Score)
                        }
                    }

                    if (importedSet.entrant2ID) {
                        const foundEntrant = this.entrants!.find((entrant) => entrant.entrantID === importedSet.entrant2ID)
                        if (foundEntrant) {
                            bracketSet.assignRightEntrant(foundEntrant)
                            bracketSet.updateScore(false, importedSet.entrant2Score)
                        }
                    }
                }
            })
    }

    /**
     * Creates [bracket entrants]{@link BracketEntrant} from [entrants]{@link Entrant}.
     * @param entrants - [Entrants]{@link Entrant} from a [tournament]{@link Tournament}
     * @returns - [Bracket entrants]{@link BracketEntrant}
     * */
    createEntrants (entrants: Entrant[]): BracketEntrant[] {
        return entrants.map((entrant, index) => new BracketEntrant({
            entrantID: entrant.entrantID,
            initialSeed: entrant.initialSeed || index + 1,
            entrantTag: entrant.entrantTag,
            other: { ...entrant.other },
        }))
    }

    /**
     * Export [bracket sets.]{@link BracketSet} as [sets]{@link Set}.
     * @returns - [OBF sets]{@link Set}
     * */
    exportSets (): Set[] {
        return this.sets.map((set) => {
            const {
                entrant1Result,
                entrant2Result,
                entrant1Score,
                entrant2Score,
                status,
                leftEntrant,
                rightEntrant,
                setId,
                round,
                leftUpperBracketSet,
                rightUpperBracketSet,
                parentSet,
                loserSet,
                leftSet,
                rightSet,
                type,
                numberToWin: matchLimit
            } = set

            return ({
                setID: `${setId}`,
                status: status as SetStatus,
                phaseID: ``,
                roundID: `${type === "winners" ? round : -round}`,
                setFormat: `${this.layout}`,
                entrant1ID: leftEntrant ? leftEntrant.entrantID : "null",
                entrant2ID: rightEntrant ? rightEntrant.entrantID : "null",
                entrant1Result: `${entrant1Result}` as SetGameResult,
                entrant2Result: `${entrant2Result}` as SetGameResult,
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
                    label: `${setId}`,
                },
            })
        })
    }

    /**
     * Assigns [bracket entrants]{@link BracketEntrant} to the correct seeded [bracket sets.]{@link BracketSet}
     * @param entrants - [Bracket entrants]{@link BracketEntrant}
     */
    assignEntrants (entrants: BracketEntrant[]) {
        const round1Sets = this.getSetsByRound(1)
        const round2Sets = this.getSetsByRound(2)
        const isEliminationType = [
            TournamentStructures.SingleElimination,
            TournamentStructures.DoubleElimination
        ].includes(this.layout as TournamentStructures)

        if (isEliminationType) {
            const round1Entrants = this.round1Positions()
            const round1GroupedEntrants = Array(round1Entrants.length / 2)
                .fill(0)
                .map(() => {
                    const entrant1 = round1Entrants.shift()
                    const entrant2 = round1Entrants.shift()
                    return [
                        entrants.find((entrant) => {
                            if (entrant1) return entrant.initialSeed === entrant1.initialSeed
                            else return false
                        }),
                        entrants.find((entrant) => {
                            if (entrant2) return entrant.initialSeed === entrant2.initialSeed
                            else return false
                        })
                    ]
                })
            const byes =
                round1GroupedEntrants
                    .filter((entrants) => entrants[0] && !entrants[1])
                    .flat()
                    .filter((entrant) => entrant)

            const fillRound1 = () => {
                const round1Entrants = round1GroupedEntrants
                    .filter((entrants) => entrants[0] && entrants[1])
                    .flat()
                round1Sets
                    .forEach((set: BracketSet) => {
                        const entrant1 = round1Entrants.shift()
                        const entrant2 = round1Entrants.shift()
                        entrant1 && set.assignEntrant(entrant1)
                        set.assignEntrant(entrant2)
                    })
            }

            fillRound1()

            while (byes.length) {
                round2Sets
                    .forEach((set) => {
                        if (!set.leftSet && !set.rightSet) {
                            if (!set.leftEntrant) set.assignLeftEntrant(byes.shift())
                            if (!set.rightEntrant) set.assignRightEntrant(byes.shift())
                        } else {
                            if (!set.rightSet && !set.rightEntrant) set.assignRightEntrant(byes.shift())
                            else if (!set.leftSet && !set.leftEntrant) set.assignLeftEntrant(byes.shift())
                        }
                    })
            }
        } else if (this.layout === TournamentStructures.RoundRobin) {
            const totalRounds = this.calculateRounds()
            entrants =
                entrants
                    .sort((a, b) => a.initialSeed - b.initialSeed)
                    .slice(0)
            let rotatingIndex = 0

            if (this.entrants.length % 2) entrants.push(undefined as unknown as BracketEntrant)

            for (let round = 1; round <= totalRounds; round++) {
                const roundSets = this.getSetsByRound(round)
                const entrantPairs = new Array(entrants.length / 2)
                    .fill(0)
                    .map((value, index) => [entrants[index], entrants[entrants.length - 1 - index]])

                entrantPairs
                    .forEach(([entrant1, entrant2]) => {
                        if (entrant1 && entrant2) {
                            const set = roundSets.shift()!
                            if (set) {
                                set.assignLeftEntrant(entrant1)
                                set.assignRightEntrant(entrant2)
                                rotatingIndex = rotatingIndex >= entrants.length - 1 ? 0 : rotatingIndex + 1
                            }
                        }
                    })

                entrants.splice(1, 0, entrants.pop()!)
            }
        }
    }

    /**
     * Create [bracket sets]{@link BracketSet} to be used in the [tournament.]{@link BracketEvent}
     * @param numberOfEntrants - Number of entrants in the bracket
     * @returns - [Bracket sets.]{@link BracketSet}
     * */
    createBracketSets(numberOfEntrants: number = this.numberOfEntrants) {
        if (numberOfEntrants < 2) return new BracketSet({
            setId: 0,
            round: 0
        })

        let currentRound = 1
        let previousRoundSets = [] as unknown as BracketSet[]

        const winnersSets = []
        const numberOfRounds = this.calculateRounds(numberOfEntrants)

        while (currentRound <= numberOfRounds) {
            const lastIndex = previousRoundSets.length ? previousRoundSets.slice(-1)[0].setId : 0
            const currentRoundSets = []

            for (let index = 0; index < this.calculateNumberOfSetsByRound({round: currentRound, numberOfEntrants}); index++) {
                const set = new BracketSet({
                    setId: index + 1 + (lastIndex || 0),
                    round: currentRound
                })
                currentRoundSets.push(set)
                this.sets.push(set)
            }

            if (previousRoundSets.length) {
                if (["single elimination", "double elimination"].includes(this.layout))
                    this.linkBracketSets({currentRoundSets, previousRoundSets})
            }

            previousRoundSets = currentRoundSets
            winnersSets.push(...currentRoundSets)
            currentRound++
        }

        return winnersSets && winnersSets.slice(-1)![0]
    }

    /**
     * Project progressions based on the seeding of the [bracket entrants.]{@link BracketEntrant}
     * @returns - Array of seed placements for each round
     * */
    generateProjections () {
        const totalRounds = this.calculateRounds()
        const seedsByRound= []

        for (let i=0; i < totalRounds; i++) seedsByRound[i] = []

        seedsByRound[totalRounds] = [1,2]

        for (let currentRound = totalRounds; currentRound > 0; currentRound--) {
            const currentRoundSeeds = seedsByRound[currentRound]
            const previousRoundSeeds = seedsByRound[currentRound - 1]
            const numberOfSeedsInPreviousRound = currentRoundSeeds.length * 2

            if (previousRoundSeeds) {
                currentRoundSeeds
                    .forEach((seed: number, index: number) => {
                        previousRoundSeeds[index * 2] = seed
                        previousRoundSeeds[(index * 2) + 1] = numberOfSeedsInPreviousRound + 1 - seed
                    })
            }
        }

        return seedsByRound
    }

    /**
     * Link [bracket sets]{@link BracketSet} together based on the [bracket layout.]{@link TournamentStructures}
     * @param currentRoundSets - [Bracket sets]{@link BracketSet} for the current round
     * @param previousRoundSets - [Bracket sets]{@link BracketSet} for the previous round
     * */
    linkBracketSets ({
        currentRoundSets,
        previousRoundSets
    }: {
        currentRoundSets: BracketSet[]
        previousRoundSets: BracketSet[]
    }) {
        const round1Entrants =
            this.generateProjections()[1]
                .map((seed) => this.entrants.find((entrant) => entrant.initialSeed === seed))
        const round1Sets = Array(this.generateProjections()[1].length / 2).fill(0).map(() => {
            return [round1Entrants.shift(), round1Entrants.shift()]
        })

        currentRoundSets
            .forEach((set) => {
                if (set.round === 2 && !this.isPowerOf2(this.numberOfEntrants)) {
                    const round1Set1 = round1Sets.shift()
                    round1Set1 && round1Set1[1] && set.addSet(previousRoundSets.shift())
                    const round1Set2 = round1Sets.shift()
                    round1Set2 && round1Set2[1] && set.addSet(previousRoundSets.shift())
                } else {
                    set.addSet(previousRoundSets.shift())
                    set.addSet(previousRoundSets.shift())
                }
            })
    }

    /**
     * Generate round one positions based on the seeding of the [bracket entrants.]{@link BracketEntrant}
     * @returns - Array of [bracket entrants]{@link BracketEntrant} for round one.
     * */
    round1Positions () {
        if (!this.entrants) return []
        return this.generateProjections()[1]
            .map((seed) => this.entrants.find((entrant) => entrant.initialSeed === seed))
    }

    /**
     * Add a lower bracket for [double elimination.]{@link TournamentStructures}
     * @param winnersFinals - [Bracket set]{@link BracketSet} for the finals of the winners bracket
     * @returns - Root [bracket set]{@link BracketSet} for the lower bracket
     * */
    attachLowerBracket (winnersFinals: BracketSet) {
        if (!winnersFinals) return winnersFinals

        const grandFinals = new BracketSet({
            setId: (winnersFinals.setId! * 2),
            type: "winners",
            round: winnersFinals.round! + 1
        })

        const grandFinalsReset = new BracketSet({
            setId: (winnersFinals.setId! * 2) + 1,
            type: "winners",
            round: winnersFinals.round! + 2
        })

        this.sets.push(grandFinals, grandFinalsReset)
        this.lowerBracketRoot = this.createLosersBracketSets(winnersFinals)
        this.upperBracketRoot = grandFinals

        if (this.numberOfEntrants > 2) {
            winnersFinals.assignLowerBracketSet(this.lowerBracketRoot)
            grandFinals.addLeftSet(winnersFinals)
            winnersFinals.assignParentSet(grandFinals)
            grandFinals.addRightSet(this.lowerBracketRoot)
            this.lowerBracketRoot.assignParentSet(grandFinals)
            grandFinals.assignLowerBracketSet(grandFinalsReset)
            this.root = grandFinals
            this.extraRoot = grandFinalsReset
            grandFinalsReset.addSet(grandFinals)
            grandFinals.assignParentSet(grandFinalsReset)
        }

        return grandFinalsReset
    }

    /**
     * Links [bracket sets]{@link BracketSet} in the lower bracket for [double elimination.]{@link TournamentStructures}
     * @param losersBracket - Root [bracket set]{@link BracketSet} for the lower bracket
     * @returns - Root [bracket set]{@link BracketSet} for the lower bracket
     * */
    linkLosersSets (losersBracket: BracketSet[]) {
        const numberOfRounds = losersBracket[losersBracket.length - 1].round!
        const winnersRound1 = this.getSetsByRound(1)
        const winnersRound2 = this.getSetsByRound(2)
        let firstTimeLoserSets = this.getAllUpperBracketSets()
        let round = 1

        while (round <= numberOfRounds) {
            const currentRoundSets = losersBracket.filter((node) => node.round! === round)
            const nextRoundSets = losersBracket.filter((node) => node.round! === round + 1)

            switch (round) {
                case 1:
                    winnersRound1
                        .filter((set) => set.isLeftChild())
                        .forEach((round1Set, index) => {
                            const loserSet = currentRoundSets.find((set) => !set.parentSet)
                            const parentIndex = winnersRound2.findIndex((parentSet) => parentSet.setId === round1Set.parentSet!.setId)
                            const round2Set = winnersRound2.slice(0).reverse()[parentIndex]

                            if (winnersRound1.every((set) => set.getSibling())) {
                                round1Set.assignLowerBracketSet(currentRoundSets[index])
                                round1Set.getSibling()!.assignLowerBracketSet(currentRoundSets[index])
                                nextRoundSets[index].addSet(currentRoundSets[index])
                            } else if (winnersRound1.every((set) => !set.getSibling())) {
                                round2Set.assignLowerBracketSet(loserSet)
                                round1Set.assignLowerBracketSet(loserSet)
                                if (nextRoundSets[Math.floor(parentIndex / 2)]) nextRoundSets[Math.floor(parentIndex / 2)].addSet(loserSet)
                                else {
                                    const setMatch = nextRoundSets.find((set) => !set.leftUpperBracketSet || !set.rightUpperBracketSet)
                                    if (setMatch) setMatch.addSet(loserSet)
                                }
                            } else {
                                if (round1Set.getSibling()) {
                                    round1Set.assignLowerBracketSet(loserSet)
                                    round1Set.getSibling()!.assignLowerBracketSet(loserSet)
                                    if (nextRoundSets[index] && loserSet) {
                                        nextRoundSets[index].addSet(loserSet)
                                        round2Set.assignLowerBracketSet(loserSet!.parentSet!)
                                    }
                                } else {
                                    winnersRound2.slice(0).reverse()[index].assignLowerBracketSet(nextRoundSets[index])
                                    round1Set.assignLowerBracketSet(nextRoundSets[index])
                                }
                            }
                        })

                    this.getAllUpperBracketSets()
                        .filter((set) => set && set.loserSet)
                        .forEach((set) => {
                            firstTimeLoserSets = firstTimeLoserSets.filter((firstTimeLoserSet) => firstTimeLoserSet && set && firstTimeLoserSet.setId !== set.setId)
                        })

                    break
                default:
                    if (nextRoundSets.length) {
                        if (currentRoundSets.length !== nextRoundSets.length) {
                            currentRoundSets
                                .forEach((set) => {
                                    const parent = nextRoundSets.find((parent) => !parent.leftSet || !parent.rightSet)
                                    if (parent) parent!.addSet(set)
                                })
                        } else {
                            currentRoundSets
                                .forEach((set, index) => {
                                    const parent = nextRoundSets[index]
                                    if (parent) parent.addSet(set)
                                })
                        }

                        if (firstTimeLoserSets.length) {
                            if (round === 2) currentRoundSets.reverse()
                            currentRoundSets.forEach((set) => {
                                if (!set.leftUpperBracketSet && !set.leftSet) {
                                    const firstTimeLoserSet = firstTimeLoserSets.shift()!
                                    firstTimeLoserSet.assignLowerBracketSet(set)
                                }

                                if (!set.rightUpperBracketSet && !set.rightSet) {
                                    const firstTimeLoserSet = firstTimeLoserSets.shift()!
                                    firstTimeLoserSet.assignLowerBracketSet(set)
                                }
                            })
                        }
                    }
                    break
            }

            round++
        }

        return losersBracket.slice(-1)[0]
    }

    /**
     * Create [bracket sets]{@link BracketSet} for a lower bracket in [double elimination.]{@link TournamentStructures}
     * @param winnersFinals - Root [bracket set]{@link BracketSet} for the winners bracket
     * @returns - [Bracket set]{@link BracketSet} for the finals of the lower bracket
     */
    createLosersBracketSets (winnersFinals: BracketSet) {
        if (this.numberOfEntrants <= 2) return winnersFinals

        const losersSets = [] as unknown as BracketSet[]
        const firstTimeLosers = this.getSetsByRound(1).length + this.getSetsByRound(2).length
        const firstTimeLosersByes = this.findHighestPowerOf2(firstTimeLosers) - firstTimeLosers
        const setId = winnersFinals.setId! + 1

        let setIdIncrement = 0
        let numberOfSets = 0
        let surplus = 0
        let round = 1
        let winnersRound = round

        while (setIdIncrement < this.numberOfEntrants - 2) {
            const winnersRoundSets = this.getSetsByRound(winnersRound)
            const previousRoundSets = losersSets.filter((set) => set.round! === round - 1)

            if (!winnersRoundSets.length) winnersRoundSets.push(...this.getSetsByRound(winnersRound - 1))

            switch (round) {
                case 1:
                    numberOfSets = (firstTimeLosers - firstTimeLosersByes) / 2
                    surplus = winnersRoundSets.length - (numberOfSets * 2)

                    for (let i = 0; i < numberOfSets; i++) {
                        losersSets[setIdIncrement] = new BracketSet({
                            setId: setId + setIdIncrement,
                            type: "losers",
                            round: round,
                        })

                        this.sets.push(losersSets[setIdIncrement])
                        setIdIncrement++
                    }

                    break
                case 2:
                    numberOfSets = (firstTimeLosersByes + previousRoundSets.length) / 2

                    for (let i = 0; i < numberOfSets; i++) {
                        losersSets[setIdIncrement] = new BracketSet({
                            setId: setId + setIdIncrement,
                            type: "losers",
                            round: round
                        })

                        this.sets.push(losersSets[setIdIncrement])
                        setIdIncrement++
                    }

                    surplus = 0

                    break
                default:
                    if (this.isPowerOf2(previousRoundSets.length + winnersRoundSets.length)) {
                        numberOfSets = (previousRoundSets.length + winnersRoundSets.length) / 2
                    } else {
                        if (this.isPowerOf2(previousRoundSets.length + surplus)) {
                            numberOfSets = (previousRoundSets.length + surplus) / 2
                            surplus = winnersRoundSets.length
                        } else numberOfSets = previousRoundSets.length / 2
                    }

                    for (let i = 0; i < numberOfSets; i++) {
                        losersSets[setIdIncrement] = new BracketSet({
                            setId: setId + setIdIncrement,
                            type: "losers",
                            round: round
                        })

                        this.sets.push(losersSets[setIdIncrement])
                        setIdIncrement++
                    }

                    break
            }

            winnersRound++
            round++
        }

        return this.linkLosersSets(losersSets.flat())
    }

    /**
     * Get all [bracket sets]{@link BracketSet} from the upper bracket.
     * Will default to all available sets if there is no lower bracket.
     * @returns - Array of [bracket sets]{@link BracketSet} from the upper bracket.
     * */
    getAllUpperBracketSets() {
        return [this.sets.filter((set) => set.type === "winners"), this.upperBracketRoot || this.root].flat()
    }

    /**
     * Get all [bracket sets]{@link BracketSet} from the lower bracket.
     * Will default to all available sets if there is no lower bracket.
     * @returns - Array of [bracket sets]{@link BracketSet} from the lower bracket.
     * */
    getAllLowerBracketSets () {
        if (!this.lowerBracketRoot) return []
        return this.sets.filter((set) => set.type === "losers")
    }

    /**
     * Get [bracket sets]{@link BracketSet} by round.
     * @param round - Which round number to filter by.
     * @param type - which type of bracket sets to return.
     * Defaults to upper.
     * @returns - Array of [bracket sets]{@link BracketSet} for the specified round.
     * */
    getSetsByRound(round: number, type: "winners" | "losers" = "winners") {
        if (type) return this.sets.filter((set) => set.round! === round && set.type === type) || []
        return this.sets.filter((set) => set.round! === round) || []
    }

    /**
     * Calculates the number of rounds needed to complete the bracket.
     *
     * @param size The number of entrants in the bracket.
     * Defaults to the number of entrants.
     * @returns The total number of rounds for the bracket.
     * */
    calculateRounds(size: number = this.numberOfEntrants) {
        let rounds = 1
        const layout = this.layout
        const isEliminationType = [
            TournamentStructures.SingleElimination,
            TournamentStructures.DoubleElimination
        ].includes(this.layout as TournamentStructures)

        if (isEliminationType)
            while (Math.pow(2,rounds) < size) rounds++
        if (TournamentStructures.RoundRobin === layout)
            rounds = this.entrants.length % 2 ? size : size - 1
        return rounds
    }

    /**
     * Calculates the number of [bracket sets]{@link BracketSet} in a given round.
     *
     * @param round The round number to calculate sets for.
     * @param size The number of entrants in the bracket.
     */
    calculateNumberOfSetsByRound = ({
        round,
        numberOfEntrants = this.numberOfEntrants,
    } : {
        round: number
        numberOfEntrants: number
    }) => {
        const layout = this.layout
        const previousRoundSets = this.getSetsByRound(round - 1)
        const isEliminationType = [
            TournamentStructures.SingleElimination,
            TournamentStructures.DoubleElimination
        ].includes(this.layout as TournamentStructures)

        if (isEliminationType) {
            const byesFromRound1 = this.findHighestPowerOf2(numberOfEntrants) - numberOfEntrants
            switch (round) {
                case 1:
                    return (numberOfEntrants - byesFromRound1) / 2
                case 2:
                    return (byesFromRound1 + previousRoundSets.length) / 2
                default:
                    return previousRoundSets.length / 2
            }
        }
        else if (TournamentStructures.RoundRobin === layout) return Math.floor(numberOfEntrants / 2)
        return 0
    }

    /**
     * Finds the highest power of 2 that is greater than or equal to the specified number.
     * @param threshold - The number to find the highest power of 2 for.
     * @returns The highest power of 2 that is greater than or equal to the specified number.
     * */
    findHighestPowerOf2(threshold: number = this.numberOfEntrants) {
        if (threshold < 2) return threshold
        if (this.isPowerOf2(threshold)) return threshold
        let i = 1
        while (threshold > Math.pow(2, i) && threshold !== Math.pow(2, i)) i++
        return Math.pow(2, i)
    }

    /**
     * Checks if a number is a power of 2.
     * @param x - The number to check.
     * @returns True if the number is a power of 2, false otherwise.
     * */
    isPowerOf2(x: number) { return (Math.log2(x) % 1 === 0) }
}

export default BracketEvent
