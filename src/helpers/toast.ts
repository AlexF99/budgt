import { UseToastOptions, createStandaloneToast } from '@chakra-ui/react';

export const toast = {
    success: (message: string, customProps?: UseToastOptions) => {
        const { toast: toastOptions } = createStandaloneToast();
        toastOptions({
            title: 'Sucesso!',
            description: message,
            status: 'success',
            duration: 2000,
            isClosable: true,
            position: 'top',
            ...customProps,
        });
    },
    error: (message: string, customProps?: UseToastOptions) => {
        const { toast: toastOptions } = createStandaloneToast();
        toastOptions({
            title: 'Erro!',
            description: message,
            status: 'error',
            duration: 2000,
            isClosable: true,
            position: 'top',
            ...customProps,
        });
    },
    info: (message: string, customProps?: UseToastOptions) => {
        const { toast: toastOptions } = createStandaloneToast();
        toastOptions({
            title: 'Importante',
            description: message,
            status: 'info',
            duration: 2000,
            isClosable: true,
            position: 'top',
            ...customProps,
        });
    },
};
