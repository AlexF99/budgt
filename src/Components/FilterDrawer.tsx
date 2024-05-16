import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Select } from "@chakra-ui/react";
import { Form } from "./Form";
import { Controller, UseFormReturn } from "react-hook-form";
import { FC, MutableRefObject, useEffect, useState } from "react";
import moment from "moment";

type Filter = {
    month: string,
    dateRange: { dateFrom: Date, dateUntil: Date },
}

type FilterDrawerProps = {
    form: UseFormReturn<Filter, any, undefined>,
    isFilterOpen: boolean,
    onFilterClose: () => void,
    btnRef: MutableRefObject<null>,
}

const FilterDrawer: FC<FilterDrawerProps> = ({ form, isFilterOpen, onFilterClose, btnRef }) => {
    const { control, setValue } = form;

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
        setValue('dateRange', { dateFrom: months[m]?.start, dateUntil: months[m]?.end })
        onFilterClose();
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
                        <Controller
                            control={control}
                            name="month"
                            render={({ field }) =>
                            (<Select
                                name="month"
                                placeholder="Mês"
                                defaultValue="tudo"
                                onChange={(e) => {
                                    e.preventDefault();
                                    field.onChange(e);
                                }}
                            >
                                <option value='all'>Tudo</option>
                                {Object.keys(months).map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </Select>)} />
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