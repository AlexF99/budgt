type Entry = {
    title: string,
    category: string,
    createdAt: Date,
    amountInt: number,
    amountDec: number,
    type: string,
    id?: string
}

type EntryForm = {
    title: string,
    category: string,
    createdAt: Date,
    amount: number,
    type: string,
}

export type { Entry, EntryForm };