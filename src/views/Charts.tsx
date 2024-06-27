import { Box, Button, Flex, Heading, IconButton, SimpleGrid, Spinner, Tag, useDisclosure } from "@chakra-ui/react";
import { QueryFieldFilterConstraint, collection, getDocs, query, where } from "firebase/firestore";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { db } from "../firebase";
import { useAuthStore } from "../zustand/authStore";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "../types/types";
import { useFilter } from "../hooks/useFilter";
import { FilterDrawer } from "../Components/FilterDrawer";
import { useRef } from "react";
import { CloseIcon } from "@chakra-ui/icons";

export const Charts = () => {
    const openFilterBtnRef = useRef(null);
    const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
    const { isLoggedIn, loggedUser } = useAuthStore();
    const { isFilterActive, filterData, setFilterData } = useFilter();

    const getRandomColor = () => {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    const getUserHistory = async (filterData: Filter) => {
        const { dateFrom, dateUntil } = filterData;
        const whereClauses: QueryFieldFilterConstraint[] = dateFrom && dateUntil ?
            [where("createdAt", "<=", dateUntil), where("createdAt", ">=", dateFrom)] : [];
        const q = query(collection(db, "users", `${loggedUser?.email}`, "entries"), ...whereClauses);

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

        const result = {
            expenses: Object.keys(expenses).map(k => ({ category: k, value: expenses[k].amount, fill: getRandomColor() })),
            gains: Object.keys(gains).map(k => ({ category: k, value: gains[k].amount, fill: getRandomColor() })),
            comparison: [{ name: 'Comparação', ganhos: totalGains.toFixed(2), gastos: totalExpenses.toFixed(2) }],
        }
        return result;
    }

    const { data, isFetching } = useQuery({
        queryKey: ['charts', filterData],
        queryFn: () => getUserHistory(filterData),
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
            <FilterDrawer isFilterOpen={isFilterOpen}
                onFilterClose={onFilterClose}
                btnRef={openFilterBtnRef}
                setFilterData={setFilterData}
                filterData={filterData}
            />
            <Box>
                <Flex alignItems="center" justify="end" w="full">
                    {isFilterActive &&
                        <Flex>
                            <Tag size="lg" ml={4} colorScheme="gray">
                                {filterData.month}
                            </Tag>
                            <IconButton
                                size="sm"
                                onClick={() => setFilterData({})}
                                icon={<CloseIcon w={3} h={3} />}
                                aria-label={'Toggle Navigation'}
                            />
                        </Flex>
                    }
                    <Button ref={openFilterBtnRef}
                        colorScheme='teal'
                        size="sm"
                        ml={1}
                        onClick={onFilterOpen}
                        variant={isFilterActive ? 'solid' : 'outline'}>
                        Filtro
                    </Button>
                </Flex>
                <Heading as="h3" size="md">Ganhos vs Gastos:</Heading>
                <ResponsiveContainer aspect={1} maxHeight={300}>
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
            <SimpleGrid columns={[1, null, 2]} spacing='40px'>
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
                </Box>
                <Box mt={4}>
                    <Heading as="h3" size="md">Ganhos:</Heading>
                    <ResponsiveContainer aspect={1.2} maxHeight={500}>
                        <PieChart>
                            <Pie isAnimationActive={false}
                                data={data?.gains} dataKey="value"
                                nameKey="category"
                                innerRadius={60} outerRadius={80}
                                label={renderLabel} />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </SimpleGrid>
        </Box>
    )
}