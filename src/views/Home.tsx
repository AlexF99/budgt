import { Badge, Card, CardBody, Flex, Heading, IconButton, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../zustand/authStore";
import { Entry } from "../types/types";
import { Fragment, useState } from 'react';
import _ from 'lodash';
import { DeleteIcon } from "@chakra-ui/icons";
import { DeleteDialog } from "../Components/DeleteDialog";
import { parseMoney } from "../helpers/parseMoney";

export const Home = () => {
    const { isLoggedIn, loggedUser } = useAuthStore();
    const [entryId, setEntryId] = useState<string | undefined>(undefined);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const initial = { gains: 0, expenses: 0, total: 0 };

    const getUserHistory = async () => {
        const q = query(collection(db, "users", `${loggedUser?.email}`, "entries"), orderBy("createdAt", "desc"));
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
        queryKey: ['history'],
        queryFn: () => getUserHistory(),
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