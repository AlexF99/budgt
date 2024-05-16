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
    month: string,
    dateRange: { dateFrom: Date, dateUntil: Date },
}

export type { Entry, EntryForm, Filter };