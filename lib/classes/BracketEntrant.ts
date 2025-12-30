class BracketEntrant {
    entrantID: string
    entrantTag = ""
    initialSeed: number
    finalPlacement?: number
    other: { [key: string]: any }

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
            finalPlacement,
            other
        } = props
        this.entrantID = entrantID
        this.initialSeed = initialSeed || 0
        this.entrantTag = entrantTag
        this.finalPlacement = finalPlacement || 0
        this.other = other
    }

    setSeed(seed: number) {
        this.initialSeed = seed
    }

    setName(name: string) {
        this.entrantTag = name
    }

    setMetaData(data: { [key: string]: never }) {
        this.other = {...this.other!, ...data}
    }
}

export default BracketEntrant
