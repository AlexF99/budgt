import {
    Button,
    ButtonGroup,
    Flex,
    IconButton,
    Input,
    InputGroup,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spinner,
    useDisclosure
} from "@chakra-ui/react"
import { Form } from "./Form"
import { Controller, useForm } from "react-hook-form"
import { addDoc, collection, getDocs, query } from "firebase/firestore"
import { db } from "../firebase"
import { useAuthStore } from "../zustand/authStore"
import { useNavigate } from "react-router-dom"
import { Route } from "../router"
import { EntryForm } from "../types/types"
import { AddIcon } from '@chakra-ui/icons';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { IMaskInput } from "react-imask"
import { useRef } from "react"

type CategoryAdd = {
    name: string
}

export const NewEntryForm = () => {
    // use ref to get access to internal "masked = ref.current.maskRef"
    const ref = useRef(null);
    const inputRef = useRef(null);
    const { isLoggedIn, loggedUser } = useAuthStore();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const entryForm = useForm<EntryForm>({
        defaultValues: {
            createdAt: new Date(),
            type: undefined,
            category: undefined,
            amount: undefined,
        },
        shouldUnregister: false
    });
    const categoryForm = useForm<CategoryAdd>({
        defaultValues: { name: undefined },
        shouldUnregister: false
    });

    const { register: registerCategory, reset: resetCategory } = categoryForm;
    const { register, control } = entryForm;

    const onSubmit = entryForm.handleSubmit(async (formData: EntryForm) => {
        if (!isLoggedIn) return;

        const x = parseFloat(`${formData.amount}`.replace(',', '.'));

        const amountInt = Math.trunc(x);
        const amountDec = Number((x - amountInt).toFixed(2)) * 100;

        const entry = { ...formData, amountDec: isNaN(amountDec) ? 0 : amountDec, amountInt }

        try {
            await addDoc(collection(db, "users", `${loggedUser.email}`, "entries"), { ...entry });
            navigate(Route.HOME, { replace: true })
        } catch (e) { }
    })

    const getCategories = async () => {
        const q = query(collection(db, "users", `${loggedUser?.email}`, "categories"));
        const querySnapshot = await getDocs(q);
        const categs: any[] = []
        querySnapshot.forEach((doc) => {
            categs.push({ ...doc.data(), id: doc.id })
        });
        return categs;
    }

    const { data: categories, isFetching } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories(),
        enabled: isLoggedIn && !!loggedUser.email?.length,
    })

    const saveCategory = async (c: CategoryAdd) => {
        if (!isLoggedIn) return;
        try {
            await addDoc(collection(db, "users", `${loggedUser.email}`, "categories"), { ...c });
        } catch (e) { }
    }

    const { mutateAsync: mutateAsyncCategory, isPending } = useMutation({
        mutationFn: (c: CategoryAdd) => saveCategory(c),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            resetCategory();
            onClose();
        }
    })

    const onSubmitCategory = categoryForm.handleSubmit(async (formData: CategoryAdd) => {
        await mutateAsyncCategory(formData);
    })

    if (isFetching) {
        return (
            <Flex w="full" align="center" justify="center" h="full">
                <Spinner />
            </Flex>
        )
    }

    return (
        <Flex w="full" flexDirection="column">
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Nova categoria</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Form form={categoryForm}>
                            <InputGroup>
                                <Input {...registerCategory('name', { required: true })} />
                            </InputGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup isDisabled={isPending}>
                            <Button variant='ghost' onClick={onClose}>Cancelar</Button>
                            <Button colorScheme='blue' mr={3} onClick={onSubmitCategory}>
                                Adicionar
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Form form={entryForm}>
                <InputGroup size="md">
                    <Input {...register('title', { required: true })} name="title" placeholder="Título" mb={4} />
                </InputGroup>
                <Flex>
                    <Select {...register('category', { required: true })} name="category" mb={4} placeholder="Categoria">
                        {categories && categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                        <option value='other'>Outro</option>
                    </Select>
                    <IconButton
                        onClick={() => onOpen()}
                        icon={<AddIcon w={3} h={3} />}
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    />
                </Flex>
                <Select {...register('type', { required: true })} name="type" mb={4} placeholder="Ganho ou Gasto?">
                    <option value='expense'>Gasto</option>
                    <option value='gain'>Ganho</option>
                </Select>
                <Controller
                    control={control}
                    name="amount"
                    render={({ field }) =>
                    (<IMaskInput
                        mask={Number}
                        radix=","
                        unmask={true} // true|false|'typed'
                        ref={ref}
                        inputRef={inputRef}  // access to nested input
                        onChange={(value) => field.onChange(value)}
                        placeholder='Valor (R$)'
                        style={{ border: 'none', padding: '5px', marginRight: '5px' }}
                    />)} />
                <Button type="button" onClick={onSubmit}>Enviar</Button>
            </Form>
        </Flex>
    )
}