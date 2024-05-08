import { Badge, Box, Card, CardBody, Flex, Heading, Text } from "@chakra-ui/react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../zustand/authStore";
import { Entry } from "../types/types";

export const Home = () => {
    const { isLoggedIn, loggedUser } = useAuthStore();
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
            hist.push({ ...data, id: doc.id })
        });
        info.total += info.gains - info.expenses;

        return { history: hist, info };
    }

    const { data } = useQuery({
        queryKey: ['history'],
        queryFn: () => getUserHistory(),
        enabled: isLoggedIn && !!loggedUser.email?.length,
    })

    const parseMoney = (amount?: number) => amount?.toFixed(2).replace('.', ',') ?? '';

    return (
        <Box p={4} h="calc(100vh - 140px)" overflow="auto">
            <Heading as="h3" size="md">Resumo:</Heading>
            <Card mt={3}>
                <CardBody>
                    <Flex>
                        <Flex direction="column" align="center" justify="center" w="full">
                            <Text>Total Ganhos:</Text>
                            <Text>{parseMoney(data?.info?.gains)}</Text>
                        </Flex>
                        <Flex direction="column" align="center" justify="center" w="full">
                            <Text>Total Gastos:</Text>
                            <Text>{parseMoney(data?.info?.expenses)}</Text>
                        </Flex>
                    </Flex>
                    <Flex>
                        <Flex direction="column" align="center" justify="center" w="full">
                            <Text>Total:</Text>
                            <Text>{parseMoney(data?.info?.total)}</Text>
                        </Flex>
                    </Flex>
                </CardBody>
            </Card>
            <Heading as="h3" size="md" mt={5}>Histórico:</Heading>
            {data?.history?.length ? data?.history?.map((entry: Entry) => (
                <Card key={entry.id} mt={3}>
                    <CardBody>
                        <Flex>
                            <Flex direction="column" align="center" justify="center" w="full">
                                <Text>{entry.title}</Text>
                                <Badge>{entry.category}</Badge>
                            </Flex>
                            <Flex direction="column" align="center" justify="center" w="full">
                                <Badge colorScheme={entry.type === "expense" ? "red" : "green"}>{entry.type === "expense" ? "Gasto" : "Ganho"}</Badge>
                                <Text>{entry.amountInt},{entry.amountDec < 10 ? `0${entry.amountDec}` : entry.amountDec}</Text>
                            </Flex>
                        </Flex>
                    </CardBody>
                </Card>
            )) :
                <Text>Nenhum registro</Text>
            }
        </Box>
    )
}