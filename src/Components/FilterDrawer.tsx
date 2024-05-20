import {
    Button, Drawer, DrawerBody, DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    Flex, Select, Spinner, Stack
} from "@chakra-ui/react";
import { Form } from "./Form";
import { useForm } from "react-hook-form";
import { FC, MutableRefObject, useEffect, useState } from "react";
import moment from "moment";
import { Filter } from "../types/types";
import { useQueryCategories } from "../hooks/useQueryCategories";

type FilterDrawerProps = {
    filterData: Filter
    setFilterData: (filter: Filter) => void,
    isFilterOpen: boolean,
    onFilterClose: () => void,
    btnRef: MutableRefObject<null>,
}

const FilterDrawer: FC<FilterDrawerProps> = ({ isFilterOpen, onFilterClose, btnRef, setFilterData, filterData }) => {

    const form = useForm<Filter>({ defaultValues: filterData, shouldUnregister: false });
    const { register } = form;
    const [months, setMonths] = useState<any>({});

    useEffect(() => {
        const monthsOfYear = ["jan", "fev", "mar", "abril", "maio", "jun", "jul", "ago", "set", "out", "nov", "dez"]
        const monthsAdd: any = {};
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
        setMonths({ ...months, ...monthsAdd })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterSubmit = () => {
        const m = form.getValues('month');
        const filterData: Filter = {
            ...form.getValues(),
            dateFrom: m ? months[m]?.start : undefined,
            dateUntil: m ? months[m]?.end : undefined,
        };
        setFilterData(filterData);
        onFilterClose();
    }

    const { data: categories, isFetching } = useQueryCategories();

    if (isFetching) {
        return (
            <Flex w="full" align="center" justify="center" h="full">
                <Spinner />
            </Flex >
        )
    }

    return (
        <Drawer
            isOpen={isFilterOpen}
            placement='right'
            onClose={onFilterClose}
            finalFocusRef={btnRef}
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Selecione o período</DrawerHeader>
                <DrawerBody>
                    <Form form={form}>
                        <Stack spacing={2}>
                            <Select {...register('month')} name="month" mb={4} placeholder="Mês">
                                <option value='all'>Tudo</option>
                                {Object.keys(months).map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </Select>
                            <Select {...register('category')} name="category" mb={4} placeholder="Categoria">
                                <option value='other'>Outro</option>
                                {categories?.map((c: any) => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </Select>
                        </Stack>
                    </Form>
                </DrawerBody>
                <DrawerFooter>
                    <Button variant='outline' mr={3} onClick={onFilterClose}>
                        Cancelar
                    </Button>
                    <Button colorScheme='blue' onClick={handleFilterSubmit}>Aplicar</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export { FilterDrawer };