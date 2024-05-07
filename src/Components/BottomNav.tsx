import {
    Box,
    Flex,
    IconButton,
    useColorModeValue,
} from '@chakra-ui/react';
import {
    TimeIcon,
    SettingsIcon,
    AddIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { Route } from '../router';

export const BottomNav = () => {
    const navigate = useNavigate()

    return (
        <Box pos="absolute" left={0} bottom={0} w="full">
            <Flex
                bg={useColorModeValue('white', 'gray.800')}
                color={useColorModeValue('gray.600', 'white')}
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderTop={1}
                borderStyle={'solid'}
                borderColor={useColorModeValue('gray.200', 'gray.900')}
                align={'center'}
                justify={'space-between'}
            >

                <Flex justify={'center'}>
                    <IconButton
                        onClick={() => { navigate(Route.HOME, { replace: true }) }}
                        icon={<TimeIcon w={3} h={3} />}
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    />
                </Flex>
                <Flex justify={'center'}>
                    <IconButton
                        onClick={() => { navigate(Route.NEW, { replace: true }) }}
                        icon={<AddIcon w={3} h={3} />}
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    />
                </Flex>
                <Flex justify={'center'}>
                    <IconButton
                        onClick={() => { navigate(Route.PROFILE, { replace: true }) }}
                        icon={<SettingsIcon w={3} h={3} />}
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    />
                </Flex>
            </Flex>
        </Box>
    );
}
