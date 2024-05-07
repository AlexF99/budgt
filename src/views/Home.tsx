import { Box, Card, CardBody, Heading, Text } from "@chakra-ui/react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../zustand/authStore";
import { Entry } from "../types/types";

export const Home = () => {
    const { isLoggedIn, loggedUser } = useAuthStore();

    const getUserHistory = async () => {
        const q = query(collection(db, "users", `${loggedUser?.email}`, "entries"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const hist: any[] = []
        querySnapshot.forEach((doc) => {
            hist.push({ ...doc.data(), id: doc.id })
        });
        return hist;
    }

    const { data: history } = useQuery({
        queryKey: ['history'],
        queryFn: () => getUserHistory(),
        enabled: isLoggedIn && !!loggedUser.email?.length,
    })

    return (
        <Box p={4} h="calc(100vh - 140px)" overflow="auto">
            <Heading>Histórico:</Heading>
            {history?.length ? history?.map((entry: Entry) => (
                <Card key={entry.id} mt={3}>
                    <CardBody>
                        <Text>{entry.type === "expense" ? "Gasto" : "Ganho"}</Text>
                        <Text>{entry.amountInt},{entry.amountDec}</Text>
                    </CardBody>
                </Card>
            )) :
                <Text>Nenhum registro</Text>
            }
        </Box>
    )
}