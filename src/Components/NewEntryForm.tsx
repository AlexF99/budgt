import {
    Button,
    Flex,
    IconButton,
    Input,
    InputGroup,
    InputLeftAddon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    useDisclosure
} from "@chakra-ui/react"
import { Form } from "./Form"
import { useForm } from "react-hook-form"
import { addDoc, collection, getDocs, query } from "firebase/firestore"
import { db } from "../firebase"
import { useAuthStore } from "../zustand/authStore"
import { useNavigate } from "react-router-dom"
import { Route } from "../router"
import { Entry } from "../types/types"
import { AddIcon } from '@chakra-ui/icons';
import { useQuery, useQueryClient } from "@tanstack/react-query"

type CategoryAdd = {
    name: string
}

export const NewEntryForm = () => {
    const { isLoggedIn, loggedUser } = useAuthStore();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const entryForm = useForm<Entry>({
        defaultValues: {
            createdAt: new Date(),
            type: undefined,
            category: undefined,
            amountInt: undefined,
            amountDec: undefined,
        },
        shouldUnregister: false
    });
    const categoryForm = useForm<CategoryAdd>({
        defaultValues: { name: undefined },
        shouldUnregister: false
    });

    const { register: registerCategory, reset: resetCategory } = categoryForm;
    const { register, setFocus, setValue, getValues } = entryForm;

    const onSubmitCategory = categoryForm.handleSubmit(async (formData: CategoryAdd) => {
        if (!isLoggedIn) return;
        try {
            await addDoc(collection(db, "users", `${loggedUser.email}`, "categories"), { ...formData });
        } catch (e) { }
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        resetCategory();
        onClose();
    })

    const onSubmit = entryForm.handleSubmit(async (formData: Entry) => {
        if (!isLoggedIn) return;
        delete formData.id;
        const amountDec = parseInt(`${formData.amountDec}`);
        const amountInt = parseInt(`${formData.amountInt}`);
        if ((amountDec <= 0 && amountInt <= 0) || amountDec < 0 || amountInt < 0 || isNaN(amountDec)) return;
        const entry = { ...formData, amountDec, amountInt }
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

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories(),
        enabled: isLoggedIn && !!loggedUser.email?.length,
    })

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
                        <Button variant='ghost' onClick={onClose}>Cancelar</Button>
                        <Button colorScheme='blue' mr={3} onClick={onSubmitCategory}>
                            Adicionar
                        </Button>
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
                <InputGroup size="md" mb={4}>
                    <InputLeftAddon>R$</InputLeftAddon>
                    <Input {...register('amountInt', { required: true })}
                        name="amountInt"
                        onKeyUp={(k) => {
                            const intInput = parseInt(getValues('amountInt').toString());
                            setValue('amountInt', isNaN(intInput) ? 0 : intInput);
                            if (k.code === "Period" || k.code === "Comma") {
                                setFocus('amountDec')
                            }
                        }} />
                    <InputLeftAddon>,</InputLeftAddon>
                    <Input {...register('amountDec', { required: true })}
                        name="amountDec"
                        maxLength={2}
                    />
                </InputGroup>
                <Button type="button" onClick={onSubmit}>Enviar</Button>
            </Form>
        </Flex>
    )
}