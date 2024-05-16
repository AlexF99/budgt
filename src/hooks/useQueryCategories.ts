import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../zustand/authStore";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";



const useQueryCategories = () => {
    const { loggedUser, isLoggedIn } = useAuthStore();

    const getCategories = async () => {
        const q = query(collection(db, "users", `${loggedUser?.email}`, "categories"));
        const querySnapshot = await getDocs(q);
        const categs: any[] = []
        querySnapshot.forEach((doc) => {
            categs.push({ ...doc.data(), id: doc.id })
        });
        return categs;
    }

    return useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories(),
        enabled: isLoggedIn && !!loggedUser.email?.length,
    });
}

export { useQueryCategories };