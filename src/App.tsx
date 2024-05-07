import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react'
import { Navbar } from './Components/Navbar';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './Components/BottomNav';
import './App.css'

const queryClient = new QueryClient()

function App() {
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
