import { Box, Heading } from "@chakra-ui/react";
import { collection, getDocs, query } from "firebase/firestore";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
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
                    gains[data.category] += amount;
                else
                    gains[data.category] = amount;
            } else {
                if (expenses[data.category])
                    expenses[data.category] += amount;
                else
                    expenses[data.category] = amount;
            }
        });

        const result = {
            expenses: Object.keys(expenses).map(k => ({ category: k, value: expenses[k], fill: getRandomColor() })),
            gains: Object.keys(gains).map(k => ({ category: k, value: gains[k], fill: getRandomColor() })),
        }
        return result;
    }

    const { data } = useQuery({
        queryKey: ['charts'],
        queryFn: () => getUserHistory(),
        enabled: isLoggedIn && !!loggedUser.email?.length,
    })

    let renderLabel = (entry: any) => {
        return `${entry.category}: ${entry.value}`;
    }

    return (
        <Box p={3}>
            <Box>
                <Heading as="h3" size="md">Ganhos:</Heading>
                <ResponsiveContainer aspect={1.2} maxHeight={500}>
                    <PieChart>
                        <Pie isAnimationActive={false} data={data?.gains} dataKey="value" nameKey="category" innerRadius={60} outerRadius={80} label={renderLabel} />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
            <Box>
                <Heading as="h3" size="md">Gastos:</Heading>
                <ResponsiveContainer aspect={1.2} maxHeight={500}>
                    <PieChart>
                        <Pie isAnimationActive={false}
                            data={data?.expenses} dataKey="value"
                            cx="50%" cy="50%"
                            nameKey="category" innerRadius={60} outerRadius={80} label={renderLabel} />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    )
}