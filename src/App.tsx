import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react'
import { Navbar } from './Components/Navbar';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './Components/BottomNav';
import './App.css'
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from './zustand/authStore';
import { auth } from './firebase';

const queryClient = new QueryClient()

function App() {
  const { resetStore, setLoggedUser } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedUser(user)
      } else {
        resetStore();
      }
    });
    return () => {
      unsub()
    };
  }, [resetStore, setLoggedUser])

  return (
    <div className="App">
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <div className="AppContainer">
            <Navbar />
            <Outlet />
            <BottomNav />
          </div>
        </QueryClientProvider>
      </ChakraProvider>
    </div>
  );
}

export default App;
