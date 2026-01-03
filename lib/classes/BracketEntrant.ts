import { Entrant } from "../@types/obf"

/**
 * Main class representing an [entrant]{@link Entrant} in a Tournament Bracket.
 * @class BracketEntrant
 * @param entrantTag - Name of the entrant.
 * @param initialSeed - Starting seed of the entrant.
 * @param finalPlacement - Final placement of the entrant in the bracket.
 * @param other - Additional metadata to be stored with the entrant.
 */
class BracketEntrant {
    /** Unique ID of the [entrant.]{@link Entrant} */
    entrantID: string
    /** Name of the [entrant.]{@link Entrant} */
    entrantTag = ""
    /** Initial seed of the [entrant.]{@link Entrant} */
    initialSeed: number
    /** Final placement of the [entrant.]{@link Entrant} */
    finalPlacement?: number

    constructor(props: {
        entrantTag: string
        other: {
            image: string
            seed: number
            misc: string
            username: string
            finalRank: number
            groupId: string
            email?: string
            tournamentId: number
            name: string
            timestamps: { created_at: Date; updated_at: Date }
            states: { active: boolean }
        }
        initialSeed: number
        finalPlacement?: number
        entrantID: string
    }) {
        const {
            entrantID,
            initialSeed,
            entrantTag,
            finalPlacement
        } = props
        this.entrantID = entrantID
        this.initialSeed = initialSeed || 0
        this.entrantTag = entrantTag
        this.finalPlacement = finalPlacement || 0
    }

    /**
     * Assign a seed for this entrant.
     * @param seed - The seed to assign.
     * */
    assignSeed(seed: number) {
        this.initialSeed = seed
    }

    /**
     * Assign a name for this entrant.
     * @param name - The name to assign.
     * */
    assignName(name: string) {
        this.entrantTag = name
    }
}

export default BracketEntrant
