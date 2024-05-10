import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box, ChakraProvider } from '@chakra-ui/react'
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
    <Box className="App">
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <Box className="AppContainer">
            <Navbar />
            <Box p={4} className='PageContainer'>
              <Outlet />
            </Box>
            <BottomNav />
          </Box>
        </QueryClientProvider>
      </ChakraProvider>
    </Box>
  );
}

export default App;
