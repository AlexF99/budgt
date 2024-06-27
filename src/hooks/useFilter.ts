import { useMemo, useState } from "react";
import { Filter } from "../types/types";
import moment from "moment";

const monthsOfYear = ["jan", "fev", "mar", "abril", "maio", "jun", "jul", "ago", "set", "out", "nov", "dez"]

const useFilter = () => {
    const currMonth: Filter = useMemo(() => {
        const currentMoment = moment();
        const currentMomentCopy = moment(currentMoment);

        const month = monthsOfYear[currentMoment.get('month')] + currentMoment.get('year');
        const dateFrom = currentMoment.date(currentMoment.startOf('month').date()).toDate()
        const dateUntil = currentMomentCopy.date(currentMomentCopy.endOf('month').date()).toDate()
        return { month, dateFrom, dateUntil };
    }, [])

    const [filterData, setFilterData] = useState<Filter>(currMonth);
    const isFilterActive = useMemo(() => Object.keys(filterData).length > 0, [filterData]);

    const months = useMemo(() => {
        const monthsAdd: Record<string, { start: Date, end: Date }> = {};
        for (let i = 0; i < 5; i++) {
            const current = moment().year(moment().year()).month(moment().month() - i)
            const currentCopy = moment(current);
            const label = monthsOfYear[current.get('month')] + current.get("year");
            const monthAdd = {
                start: current.date(current.startOf('month').date()).toDate(),
                end: currentCopy.date(currentCopy.endOf('month').date()).toDate()
            }
            monthsAdd[label] = monthAdd;
        }
        return monthsAdd;
    }, [])

    return { filterData, setFilterData, isFilterActive, months };
}

export { useFilter };