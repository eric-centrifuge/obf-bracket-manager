import BracketEntrant from "./BracketEntrant"
import {SetGameResult} from "../@types/obf"

class BracketSet {
    setId: number | undefined = undefined
    uuid?: number | string | undefined = undefined
    self: BracketSet
    leftEntrant: BracketEntrant | undefined
    rightEntrant: BracketEntrant | undefined
    entrant1Result?: SetGameResult
    entrant2Result?: SetGameResult
    entrant1Score: number = 0
    entrant2Score: number = 0
    entrant1Ready: boolean = false
    entrant2Ready: boolean = false
    entrant1Reported: boolean = false
    entrant2Reported: boolean = false
    leftSet: BracketSet | undefined
    rightSet: BracketSet | undefined
    parentSet: BracketSet | undefined
    leftWinnerSet: BracketSet | undefined
    rightWinnerSet: BracketSet | undefined
    loserSet: BracketSet | undefined
    round: number
    numberToWin: number = 3
    status: "started" | "pending" | "completed"
    type: "winners" | "losers"
    startTime: Date | undefined = undefined
    endTime: Date | undefined = undefined
    onStream: boolean = false
    winner: string = ""
    loser: string = ""
    placement: number
    other: { [key: string]: never }

    constructor(props: {
        setId: number
        uuid?: number
        leftSet?: BracketSet
        rightSet?: BracketSet
        leftEntrant?: BracketEntrant
        rightEntrant?: BracketEntrant
        parentSet?: BracketSet
        leftWinner?: BracketSet
        rightWinner?: BracketSet
        loserSet?: BracketSet
        round: number
        type?: "winners" | "losers"
        status?: "started" | "completed" | "pending"
        placement?: number
        numberToWin?: number
        other?: { [key: string]: never }
    }) {
        const {
            setId,
            uuid,
            leftEntrant,
            rightEntrant,
            leftSet,
            rightSet,
            parentSet,
            leftWinner,
            rightWinner,
            loserSet,
            round,
            type,
            status,
            placement,
            numberToWin,
            other
        } = props
        this.setId = setId
        this.uuid = uuid
        this.self = this
        this.leftEntrant = leftEntrant
        this.rightEntrant = rightEntrant
        this.addLeftSet(leftSet)
        this.addRightSet(rightSet)
        this.leftWinnerSet = leftWinner
        this.rightWinnerSet = rightWinner
        this.loserSet = loserSet
        this.parentSet = parentSet
        this.placement = placement ? placement : 0
        this.round = round
        this.type = type ? type : "winners"
        this.status = status ? status : "pending"
        this.numberToWin = numberToWin || 3
        this.other = other!
    }

    isLeftChild(): boolean {
        if (!this.parentSet) return false
        if (this.parentSet.leftSet) return this.setId === this.parentSet.leftSet.setId
        return false
    }

    isRightChild(): boolean {
        if (!this.parentSet) return false
        if (this.parentSet.rightSet) return this.setId === this.parentSet.rightSet.setId
        return false
    }

    isLeftWinner(): boolean {
        if (this.type === "losers") return false
        if (!this.loserSet) return false
        if (!this.loserSet.leftWinnerSet) return false
        return this.loserSet.leftWinnerSet!.setId === this.setId

    }

    isRightWinner(): boolean {
        if (this.type === "losers") return false
        if (!this.loserSet) return false
        if (!this.loserSet.rightWinnerSet) return false
        return this.loserSet.rightWinnerSet!.setId === this.setId

    }

    isOnlyChild(): boolean {
        if (!this.parentSet) return false
        return !this.parentSet.rightSet
    }

    getPlacement(placement: number = 1, node: BracketSet = this): number {
        let finalPlacement = placement + 1
        if (node.parentSet) finalPlacement = this.getPlacement(placement + 1, node.parentSet)
        return finalPlacement
    }

    getSibling(): BracketSet | undefined {
        if (!this.parentSet) return undefined
        if (this.isLeftChild()) return this.parentSet.rightSet
        else if (this.isRightChild()) return this.parentSet.leftSet
        else return undefined
    }

    addSet(node: BracketSet | undefined) {
        if (!node) return
        if (!this.leftSet) this.addLeftSet(node)
        else this.addRightSet(node)
        node.setParentSet(this)
    }

    addLeftSet(set: BracketSet | undefined) {
        if (!set) return
        this.leftSet = set
        set.setParentSet(this)
    }

    addRightSet(set: BracketSet | undefined) {
        if (!set) return
        this.rightSet = set
        set.setParentSet(this)
    }

    setLosersSet(losersSet: BracketSet | undefined) {
        if (!losersSet) return
        if (!losersSet.leftWinnerSet && !losersSet.leftSet) losersSet.leftWinnerSet = this
        else if (!losersSet.rightWinnerSet && !losersSet.rightSet) losersSet.rightWinnerSet = this
        this.loserSet = losersSet
    }

    setLeftEntrant(entrant: BracketEntrant | undefined) {
        if (!entrant) return
        this.leftEntrant = entrant
    }

    setRightEntrant(entrant: BracketEntrant | undefined) {
        if (!entrant) return
        this.rightEntrant = entrant
    }

    setEntrant(entrant: BracketEntrant | undefined) {
        if (!entrant) return
        if (!this.leftEntrant) this.leftEntrant = entrant
        else if (!this.rightEntrant) this.rightEntrant = entrant
    }

    setParentSet(parent: BracketSet) { if (parent) this.parentSet = parent }
    setMetaData(data: {[key: string]: never}) { this.other = {...this.other, ...data} }

    updateScore(isP1: boolean, score: number) {
        if (isP1) {
            this.entrant1Score = score
        } else {
            this.entrant2Score = score
        }
    }
}

export default BracketSet
