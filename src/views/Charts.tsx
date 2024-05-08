import { Box } from "@chakra-ui/react";
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
        const info: any = {};
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const amount: number = data.amountInt + (data.amountDec / 100);
            if (info[data.category])
                info[data.category] += amount;
            else
                info[data.category] = amount;
        });


        return Object.keys(info).map(k => ({ category: k, value: info[k], fill: getRandomColor() }));
    }

    const { data } = useQuery({
        queryKey: ['history'],
        queryFn: () => getUserHistory(),
        enabled: isLoggedIn && !!loggedUser.email?.length,
    })

    return (
        <Box>
            <ResponsiveContainer aspect={1.2} maxHeight={500}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="category" innerRadius={60} outerRadius={80} label />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    )
}