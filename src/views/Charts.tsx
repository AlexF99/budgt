import { Box, Card, CardBody, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import { collection, getDocs, query } from "firebase/firestore";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { db } from "../firebase";
import { useAuthStore } from "../zustand/authStore";
import { useQuery } from "@tanstack/react-query";

export const Charts = () => {

    const { isLoggedIn, loggedUser } = useAuthStore();

    const getRandomColor = () => {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    const getUserHistory = async () => {
        const q = query(collection(db, "users", `${loggedUser?.email}`, "entries"));
        const querySnapshot = await getDocs(q);
        const gains: any = {};
        const expenses: any = {};
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const amount: number = data.amountInt + (data.amountDec / 100);

            if (data.type === "gain") {
                if (gains[data.category])
                    gains[data.category] = { amount: gains[data.category].amount + amount, entries: gains[data.category].entries + 1 };
                else
                    gains[data.category] = { amount, entries: 1 };
            } else {
                if (expenses[data.category])
                    expenses[data.category] = { amount: expenses[data.category].amount + amount, entries: expenses[data.category].entries + 1 };
                else
                    expenses[data.category] = { amount, entries: 1 };
            }
        });

        const totalGains = Object.keys(gains).reduce((acc, curr) => { return acc + gains[curr].amount }, 0)
        const totalExpenses = Object.keys(expenses).reduce((acc, curr) => { return acc + expenses[curr].amount }, 0)

        const averageGainsPerCategory:any = Object.keys(gains).reduce((acc, k) => ({...acc, [k]: (gains[k].amount / gains[k].entries) }), {})
        const averageExpensesPerCategory:any = Object.keys(expenses).reduce((acc, k) => ({...acc, [k]: (expenses[k].amount / expenses[k].entries) }), {})

        const result = {
            expenses: Object.keys(expenses).map(k => ({ category: k, value: expenses[k].amount, fill: getRandomColor() })),
            gains: Object.keys(gains).map(k => ({ category: k, value: gains[k].amount, fill: getRandomColor() })),
            comparison: [{ name: 'Comparação', ganhos: totalGains.toFixed(2), gastos: totalExpenses.toFixed(2) }],
            averages: { gains: averageGainsPerCategory, expenses: averageExpensesPerCategory }
        }
        return result;
    }

    const { data, isFetching } = useQuery({
        queryKey: ['charts'],
        queryFn: () => getUserHistory(),
        enabled: isLoggedIn && !!loggedUser.email?.length,
    })

    let renderLabel = (entry: any) => {
        return `${entry.category}: ${entry.value.toFixed(2)}`;
    }

    if (isFetching) {
        return (
            <Flex w="full" align="center" justify="center" h="full">
                <Spinner />
            </Flex>
        )
    }

    return (
        <Box>
            <Box>
                <Heading as="h3" size="md">Ganhos vs Gastos:</Heading>
                <ResponsiveContainer aspect={1} maxHeight={200}>
                    <BarChart width={200} height={100} data={data?.comparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="ganhos" fill="#82ca9d" />
                        <Bar dataKey="gastos" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
            <Box mt={4}>
                <Heading as="h3" size="md">Gastos:</Heading>
                <ResponsiveContainer aspect={1.2} maxHeight={500}>
                    <PieChart>
                        <Pie isAnimationActive={false}
                            data={data?.expenses} dataKey="value"
                            nameKey="category"
                            innerRadius={60} outerRadius={80}
                            label={renderLabel} />
                    </PieChart>
                </ResponsiveContainer>
                <Card mt={2}>
                    <CardBody>
                        <Heading as="h4" size="sm">Média dos gastos por categoria:</Heading>
                        <Box>
                            {data?.averages?.expenses && Object.keys(data?.averages?.expenses).map(cat => (
                                <Text>{cat}: {data?.averages?.expenses[cat]}</Text>
                            )) }
                        </Box>
                    </CardBody>
                </Card>
            </Box>
            <Box mt={4}>
                <Heading as="h3" size="md">Ganhos:</Heading>
                <ResponsiveContainer aspect={1.2} maxHeight={200}>
                    <PieChart>
                        <Pie isAnimationActive={false}
                            data={data?.gains} dataKey="value"
                            nameKey="category"
                            innerRadius={60} outerRadius={80}
                            label={renderLabel} />
                    </PieChart>
                </ResponsiveContainer>
                <Card mt={2}>
                    <CardBody>
                        <Heading as="h4" size="sm">Média dos ganhos por categoria:</Heading>
                        <Box>
                            {data?.averages?.gains && Object.keys(data?.averages?.gains).map(cat => (
                                <Text>{cat}: {data?.averages?.gains[cat]}</Text>
                            )) }
                        </Box>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    )
}