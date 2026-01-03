import BracketEntrant from "./BracketEntrant"
import {Set, SetGameResult, SetStatus} from "../@types/obf"

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
class BracketSet {
    /** Unique ID of this [set]{@link Set}. */
    setId: number
    /** [Entrant]{@link BracketEntrant} 1 of this [set]{@link Set}.*/
    leftEntrant: BracketEntrant | undefined
    /** [Entrant]{@link BracketEntrant} 2 of this [set]{@link Set}.*/
    rightEntrant: BracketEntrant | undefined
    /** Set [results]{@link SetGameResult} for [Entrant]{@link BracketEntrant} 1.*/
    entrant1Result?: SetGameResult
    /** Set [results]{@link SetGameResult} for [Entrant]{@link BracketEntrant} 2.*/
    entrant2Result?: SetGameResult
    /** Score for [Entrant]{@link BracketEntrant} 1.*/
    entrant1Score: number = 0
    /** Score for [Entrant]{@link BracketEntrant} 2.*/
    entrant2Score: number = 0
    /** Left child of this [set]{@link Set}. */
    leftSet: BracketSet | undefined
    /** Right child of this [set]{@link Set}. */
    rightSet: BracketSet | undefined
    /** Parent of this [set]{@link Set}. */
    parentSet: BracketSet | undefined
    /** The upper [bracket set]{@link BracketSet} that precedes the left slot of this [set]{@link Set}. */
    leftUpperBracketSet: BracketSet | undefined
    /** The upper [bracket set]{@link BracketSet} that precedes the right slot of this [set]{@link Set}. */
    rightUpperBracketSet: BracketSet | undefined
    /** The lower [bracket set]{@link BracketSet} assigned to this [set]{@link Set}. */
    loserSet: BracketSet | undefined
    /** The round this set belongs to. */
    round: number
    /** The required number of victories to declare a winner (Default: 3). */
    numberToWin: number = 3
    /** [Status]{@link SetStatus} for this set (Default: "pending"). */
    status: SetStatus
    type: "winners" | "losers" = "winners"
    /** Final placement of this set in the tournament (Default: 0). */
    placement: number = 0

    constructor(props: {
        setId: number
        uuid?: number
        leftSet?: BracketSet
        rightSet?: BracketSet
        leftEntrant?: BracketEntrant
        rightEntrant?: BracketEntrant
        parentSet?: BracketSet
        leftUpperBracketSet?: BracketSet
        rightUpperBracketSet?: BracketSet
        loserSet?: BracketSet
        round: number
        type?: "winners" | "losers"
        status?: SetStatus
        placement?: number
        numberToWin?: number
    }) {
        const {
            setId,
            leftEntrant,
            rightEntrant,
            leftSet,
            rightSet,
            parentSet,
            leftUpperBracketSet,
            rightUpperBracketSet,
            loserSet,
            round,
            type = "winners",
            status = SetStatus.Pending,
            placement,
            numberToWin = 3,
        } = props
        this.setId = setId
        this.leftEntrant = leftEntrant
        this.rightEntrant = rightEntrant
        this.addLeftSet(leftSet)
        this.addRightSet(rightSet)
        this.leftUpperBracketSet = leftUpperBracketSet
        this.rightUpperBracketSet = rightUpperBracketSet
        this.loserSet = loserSet
        this.parentSet = parentSet
        this.placement = placement ? placement : 0
        this.round = round
        this.type = type
        this.status = status
        this.numberToWin = numberToWin || 3
    }

    /**
     * Checks if this set is the left child of its parent.
     * @returns - True if this set is the left child of its parent, false otherwise.
     * */
    isLeftChild(): boolean {
        if (!this.parentSet) return false
        if (this.parentSet.leftSet) return this.setId === this.parentSet.leftSet.setId
        return false
    }

    /**
     * Checks if this set is the right child of its parent.
     * @returns - True if this set is the right child of its parent, false otherwise.
     * */
    isRightChild(): boolean {
        if (!this.parentSet) return false
        if (this.parentSet.rightSet) return this.setId === this.parentSet.rightSet.setId
        return false
    }

    /**
     * Checks if the left entrant slot is linked to an upper bracket set.
     * @returns - True if linked to an upper bracket set, false otherwise.
     * */
    isLeftWinner(): boolean {
        if (this.type === "losers") return false
        if (!this.loserSet) return false
        if (!this.loserSet.leftUpperBracketSet) return false
        return this.loserSet.leftUpperBracketSet!.setId === this.setId

    }

    /**
     * Checks if the right entrant slot is linked to an upper bracket set.
     * @returns - True if linked to an upper bracket set, false otherwise.
     * */
    isRightWinner(): boolean {
        if (this.type === "losers") return false
        if (!this.loserSet) return false
        if (!this.loserSet.rightUpperBracketSet) return false
        return this.loserSet.rightUpperBracketSet!.setId === this.setId

    }

    /**
     * Checks if this set is the only child of its parent.
     * @returns - True if this set has no siblings, false otherwise.
     * */
    isOnlyChild(): boolean {
        if (!this.parentSet) return false
        return !this.parentSet.rightSet
    }

    /**
     * Calculates the final placement of this set in its parent.
     * @param placement - Current placement of this set.
     * @param node - Current node in the tree.
     * @returns - Final placement of this set in the tournament.
     */
    getPlacement(placement: number = 1, node: BracketSet = this): number {
        let finalPlacement = placement + 1
        if (node.parentSet) finalPlacement = this.getPlacement(placement + 1, node.parentSet)
        return finalPlacement
    }

    /**
     * Get the sibling of this set.
     * @returns - Sibling set of this set, undefined otherwise.
     * */
    getSibling(): BracketSet | undefined {
        if (!this.parentSet) return undefined
        if (this.isLeftChild()) return this.parentSet.rightSet
        else if (this.isRightChild()) return this.parentSet.leftSet
        else return undefined
    }

    /**
     * Add a child to this set.
     * @param node - Child to add.
     * @returns - True if child was added, false otherwise.
     * */
    addSet(node: BracketSet | undefined) {
        if (!node) return false
        if (!this.leftSet) this.addLeftSet(node)
        else this.addRightSet(node)
        node.assignParentSet(this)
        return true
    }

    /**
     * Add a left child to this set.
     * @param set - Left child [set]{@link BracketSet} to add.
     * @returns - True if child was added, false otherwise.
     * */
    addLeftSet(set: BracketSet | undefined) {
        if (!set) return false
        this.leftSet = set
        return true
    }

    /**
     * Add a right child to this set.
     * @param set - Right child [set]{@link BracketSet} to add.
     * @returns - True if child was added, false otherwise.
     * */
    addRightSet(set: BracketSet | undefined) {
        if (!set) return
        this.rightSet = set
    }

    /**
     * Assigns a [bracket set]{@link BracketSet} as the lower bracket progression of this set.
     * @param losersSet - [Bracket set]{@link BracketSet} to attach.
     * */
    assignLowerBracketSet(losersSet: BracketSet | undefined) {
        if (!losersSet) return
        if (!losersSet.leftUpperBracketSet && !losersSet.leftSet) losersSet.leftUpperBracketSet = this
        else if (!losersSet.rightUpperBracketSet && !losersSet.rightSet) losersSet.rightUpperBracketSet = this
        this.loserSet = losersSet
    }

    /**
     * Assign a [bracket entrant]{@link BracketEntrant} as the left slot of this set.
     * @param entrant - [Bracket entrant]{@link BracketEntrant} to assign.
     * @returns - True if entrant was assigned, false otherwise.
     * */
    assignLeftEntrant(entrant: BracketEntrant | undefined) {
        if (!entrant) return false
        this.leftEntrant = entrant
        return true
    }

    /**
     * Assign a [bracket entrant]{@link BracketEntrant} as the right slot of this set.
     * @param entrant - [Bracket entrant]{@link BracketEntrant} to assign.
     * @returns - True if entrant was assigned, false otherwise.
     * */
    assignRightEntrant(entrant: BracketEntrant | undefined) {
        if (!entrant) return
        this.rightEntrant = entrant
    }

    /**
     * Assign a [bracket entrant]{@link BracketEntrant} to any available slot of this set.
     * @param entrant - [Bracket entrant]{@link BracketEntrant} to assign.
     * @returns - True if entrant was assigned, false otherwise.
     * */
    assignEntrant(entrant: BracketEntrant | undefined) {
        if (!entrant) return
        if (!this.leftEntrant) this.leftEntrant = entrant
        else if (!this.rightEntrant) this.rightEntrant = entrant
    }

    /**
     * Assign a [bracket set]{@link BracketSet} as the parent of this set.
     * @param parent - [Set]{@link BracketSet} to use as the parent set.
     * */
    assignParentSet(parent: BracketSet) { this.parentSet = parent }

    /**
     * Update the scores of this set.
     * @param isP1 - True if the score is for the first entrant, false for the second entrant.
     * @param score - New score of the entrant.
     * */
    updateScore(isP1: boolean, score: number) {
        if (isP1) {
            this.entrant1Score = score
        } else {
            this.entrant2Score = score
        }
    }
}

export default BracketSet
