import { User } from 'firebase/auth'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
    loggedUser: User,
    isLoggedIn: boolean,
}

type AuthActions = {
    /* eslint-disable-next-line no-empty-pattern */
    setLoggedUser: ({ }: User) => void
    resetStore: () => void
}

const initialState = {
    loggedUser: {} as User,
    isLoggedIn: false,
}


export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set) => ({
            ...initialState,
            setLoggedUser: (loggedUser: User) => {
                console.log("oioioiioiiiii");
                
                set((state: AuthState) => ({ ...state, loggedUser, isLoggedIn: true }));
            },
            resetStore: () => { set(initialState); },
        }),
        {
            name: 'auth-storage', // must be unique among stores
            partialize: (state) => ({
                loggedUser: state.loggedUser,
                isLoggedIn: state.isLoggedIn,
            }),
        },
    ),
)