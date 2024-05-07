import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  useColorModeValue,
  useBreakpointValue,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  useDisclosure,
} from '@chakra-ui/react';
import Login from './Login';
import { useAuthStore } from '../zustand/authStore';
import { getAuth, signOut } from 'firebase/auth';
import { Route, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { onClose } = useDisclosure()
  const { loggedUser, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}>
            Logo
          </Text>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}>
          <Popover>
            <PopoverTrigger>
              <Button
                as={'a'}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'pink.400'}
                href={'#'}
                _hover={{
                  bg: 'pink.300',
                }}>
                {loggedUser?.email ?? 'Sign In'}
              </Button>
            </PopoverTrigger>
            <Portal>
              <PopoverContent>
                {isLoggedIn}
                {!isLoggedIn ?
                  <Login onClose={onClose} />
                  : <Button onClick={() => {
                    const auth = getAuth();
                    signOut(auth).then(() => {
                      navigate('/')
                    }).catch((error) => {
                      console.log(error);
                    });
                    onClose();
                  }}>logout</Button>
                }
              </PopoverContent>
            </Portal>
          </Popover>
        </Stack>
      </Flex>
    </Box>
  );
}
