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
    amount: string,
    type: string,
}

type Filter = {
    month?: string,
    dateFrom?: Date,
    dateUntil?: Date,
    category?: string,
}

export type { Entry, EntryForm, Filter };