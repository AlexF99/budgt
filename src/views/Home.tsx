import { Badge, Button, Card, CardBody, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, Heading, IconButton, Select, Spinner, Tag, Text, useDisclosure } from "@chakra-ui/react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../zustand/authStore";
import { Entry } from "../types/types";
import { Fragment, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { DeleteIcon } from "@chakra-ui/icons";
import { DeleteDialog } from "../Components/DeleteDialog";
import { parseMoney } from "../helpers/parseMoney";
import { Controller, useForm } from "react-hook-form";
import { Form } from "../Components/Form";
import moment from "moment";

type Filter = {
    month: string,
    dateRange: { dateFrom: Date, dateUntil: Date },
}

export const Home = () => {
    // BEGIN FILTER
    const btnRef = useRef(null);
    const form = useForm<Filter>();
    const { control, watch, setValue, reset } = form;

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

    const dateRange = watch('dateRange');
    const month = watch('month');

    // END FILTER

    const { isLoggedIn, loggedUser } = useAuthStore();
    const [entryId, setEntryId] = useState<string | undefined>(undefined);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure()
    const initial = { gains: 0, expenses: 0, total: 0 };

    const getUserHistory = async (dateRange?: { dateFrom: Date, dateUntil: Date }) => {
        const q = dateRange && dateRange.dateFrom && dateRange.dateUntil
            ? query(collection(db, "users", `${loggedUser?.email}`, "entries"),
                where("createdAt", "<=", dateRange.dateUntil),
                where("createdAt", ">=", dateRange.dateFrom), orderBy("createdAt", "desc"))
            : query(collection(db, "users", `${loggedUser?.email}`, "entries"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const hist: any[] = []
        const info = { ...initial };
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const amount: number = data.amountInt + (data.amountDec / 100);
            info.gains += data.type === "gain" ? amount : 0;
            info.expenses += data.type === "expense" ? amount : 0;
            hist.push({ ...data, id: doc.id, createdAt: data.createdAt.toDate().toDateString() })
        });
        info.total += info.gains - info.expenses;

        const grouped = _.groupBy(hist, 'createdAt');

        return { info, grouped };
    }

    const { data, isFetching } = useQuery({
        queryKey: ['history', dateRange],
        queryFn: () => getUserHistory(dateRange),
        enabled: isLoggedIn && !!loggedUser.email?.length,
    })

    if (isFetching) {
        return (
            <Flex w="full" align="center" justify="center" h="full">
                < Spinner />
            </Flex >
        )
    }

    return (
        <>
            <Flex alignItems="center">
                <Button ref={btnRef} colorScheme='teal' onClick={onFilterOpen}>
                    Filtro
                </Button>
                {month &&
                    <>
                        <Tag size="sm" ml={4} borderRadius="full" colorScheme="gray">
                            {month}
                        </Tag>
                        <Button variant="outline" size="sm" onClick={() => reset()}>
                            Limpar filtro
                        </Button>
                    </>
                }
            </Flex>
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
            <Heading as="h3" size="md">Resumo:</Heading>
            <Card mt={3}>
                <CardBody>
                    <Flex>
                        <Flex direction="column" align="center" justify="center" w="full">
                            <Text>Ganhos:</Text>
                            <Text>{parseMoney(data?.info?.gains)}</Text>
                        </Flex>
                        <Flex direction="column" align="center" justify="center" w="full">
                            <Text>Gastos:</Text>
                            <Text>{parseMoney(data?.info?.expenses)}</Text>
                        </Flex>
                    </Flex>
                    <Flex>
                        <Flex direction="column" align="center" justify="center" w="full">
                            <Text>Balanço:</Text>
                            <Text>{parseMoney(data?.info?.total)}</Text>
                        </Flex>
                    </Flex>
                </CardBody>
            </Card>
            <Heading as="h3" size="md" mt={5}>Histórico:</Heading>
            <DeleteDialog onClose={onClose} entityId={entryId} isOpen={isOpen} path="entries" invalidateQueryId="history" />
            {data?.grouped ? Object.keys(data?.grouped)?.map((date: string) => (
                <Fragment key={date}>
                    <Heading as="h4" size="sm" mt={4}>{date}</Heading>
                    {(data?.grouped[date]) ? data?.grouped[date].map((entry: Entry) => (
                        <Card key={entry.id} mt={3}>
                            <IconButton
                                onClick={() => {
                                    setEntryId(entry.id);
                                    onOpen();
                                }}
                                pos='absolute'
                                right='-8px'
                                top='-8px'
                                isRound={true}
                                variant='solid'
                                colorScheme='red'
                                aria-label='Done'
                                fontSize='12px'
                                icon={<DeleteIcon />}
                                size='sm'
                            />
                            <CardBody>
                                <Flex>
                                    <Flex direction="column" align="center" justify="center" w="full">
                                        <Text>{entry.title}</Text>
                                        <Badge>{entry.category}</Badge>
                                    </Flex>
                                    <Flex direction="column" align="center" justify="center" w="full">
                                        <Badge colorScheme={entry.type === "expense" ? "red" : "green"}>{entry.type === "expense" ? "Gasto" : "Ganho"}</Badge>
                                        <Text>{parseMoney(entry.amountInt + (entry.amountDec / 100))}</Text>
                                    </Flex>
                                </Flex>
                            </CardBody>
                        </Card>
                    )) :
                        <Text>Nenhum registro</Text>
                    }
                </Fragment>
            )) :
                <Text>Nenhum registro</Text>
            }
        </>
    )
}