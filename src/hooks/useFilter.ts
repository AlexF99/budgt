import { useState } from "react";
import { Filter } from "../types/types";

const useFilter = () => {
    const [filterData, setFilterData] = useState<Filter>({});
    const isFilterActive = Object.keys(filterData).length > 0;

    return { filterData, setFilterData, isFilterActive };
}

export { useFilter };