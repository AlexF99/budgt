import {
    Badge, Button, Card, CardBody, Flex, Grid, GridItem, Heading, IconButton, Menu, MenuButton, MenuItem,
    MenuList, Spinner, Stat, StatArrow, StatGroup, StatHelpText, StatLabel, StatNumber, Tag, Text, useDisclosure
} from "@chakra-ui/react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../zustand/authStore";
import { Entry } from "../types/types";
import { Fragment, useRef, useState } from 'react';
import _ from 'lodash';
import { CloseIcon, DeleteIcon, EditIcon, HamburgerIcon } from "@chakra-ui/icons";
import { DeleteDialog } from "../Components/DeleteDialog";
import { parseMoney } from "../helpers/parseMoney";
import { useForm } from "react-hook-form";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Route } from "../router";
import { FilterDrawer } from "../Components/FilterDrawer";

type Filter = {
    month: string,
    dateRange: { dateFrom: Date, dateUntil: Date },
}

export const Home = () => {
    // BEGIN FILTER
    const btnRef = useRef(null);
    const filterForm = useForm<Filter>();
    const { watch, reset } = filterForm;

    const dateRange = watch('dateRange');
    const month = watch('month');
    const isFilterActive = !!month;
    // END FILTER

    const { isLoggedIn, loggedUser } = useAuthStore();
    const [entryId, setEntryId] = useState<string | undefined>(undefined);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
    const navigate = useNavigate();
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
            hist.push({ ...data, id: doc.id, createdAt: moment(data.createdAt.toDate()).format('D/MM/YYYY') })
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
            <FilterDrawer isFilterOpen={isFilterOpen} onFilterClose={onFilterClose} btnRef={btnRef} form={filterForm} />
            <Card mt={3}>
                <CardBody p={3}>
                    <StatGroup>
                        <Stat>
                            <StatLabel>Balanço</StatLabel>
                            <StatNumber>{parseMoney(data?.info?.total)}</StatNumber>

                        </Stat>
                        <Stat>
                            <StatHelpText>
                                <StatArrow type='increase' />
                                {parseMoney(data?.info?.gains)}
                            </StatHelpText>
                            <StatHelpText>
                                <StatArrow type='decrease' />
                                {parseMoney(data?.info?.expenses)}
                            </StatHelpText>
                        </Stat>
                    </StatGroup>
                </CardBody>
            </Card>
            <Flex align="baseline">
                <Heading as="h3" size="md" mt={5}>Histórico</Heading>
                <Flex alignItems="center" justify="end" w="full">
                    {isFilterActive &&
                        <Flex>
                            <Tag size="lg" ml={4} colorScheme="gray">
                                {month}
                            </Tag>
                            <IconButton
                                size="sm"
                                onClick={() => reset()}
                                icon={<CloseIcon w={3} h={3} />}
                                aria-label={'Toggle Navigation'}
                            />
                        </Flex>
                    }
                    <Button ref={btnRef}
                        colorScheme='teal'
                        size="sm"
                        ml={1}
                        onClick={onFilterOpen}
                        variant={isFilterActive ? 'solid' : 'outline'}>
                        Filtro
                    </Button>
                </Flex>
            </Flex>
            <DeleteDialog onClose={onClose} entityId={entryId} isOpen={isOpen} path="entries" invalidateQueryId="history" />
            {(data?.grouped && Object.keys(data?.grouped).length) ? Object.keys(data?.grouped)?.map((date: string) => (
                <Fragment key={date}>
                    <Heading as="h4" size="sm" mt={4}>{date}</Heading>
                    {(data?.grouped[date]) ? data?.grouped[date].map((entry: Entry) => (
                        <Card key={entry.id} mt={3}>
                            <CardBody>
                                <Grid
                                    h='60px'
                                    templateRows='repeat(2, 1fr)'
                                    templateColumns='repeat(5, 1fr)'
                                    gap={2}
                                >
                                    <GridItem colSpan={1}>
                                        <Badge size="lg" colorScheme={entry.type === "expense" ? "red" : "green"}>{parseMoney(entry.amountInt + (entry.amountDec / 100))}</Badge>
                                    </GridItem>
                                    <GridItem colSpan={3}>
                                        <Badge size="lg">{entry.category}</Badge>
                                    </GridItem>
                                    <GridItem colSpan={1} rowSpan={2} display="flex" alignItems="center" justifyContent="center">
                                        <Menu>
                                            <MenuButton
                                                as={IconButton}
                                                aria-label='Options'
                                                icon={<HamburgerIcon />}
                                                variant='outline'
                                            />
                                            <MenuList>
                                                <MenuItem icon={<DeleteIcon />} onClick={() => {
                                                    setEntryId(entry.id);
                                                    onOpen();
                                                }}>
                                                    Remover
                                                </MenuItem>
                                                <MenuItem icon={<EditIcon />} onClick={() => { navigate(Route.EDIT + '/' + entry.id, { replace: true }) }}>
                                                    Editar
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </GridItem>
                                    <GridItem colSpan={4}><Text>{entry.title}</Text></GridItem>
                                </Grid>
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