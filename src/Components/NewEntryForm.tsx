import {
    Button, Flex, IconButton, Input, InputGroup, InputLeftAddon, Select, Spinner, useDisclosure
} from "@chakra-ui/react"
import { Form } from "./Form"
import { Controller, useForm } from "react-hook-form"
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuthStore } from "../zustand/authStore"
import { useNavigate } from "react-router-dom"
import { Route } from "../router"
import { EntryForm } from "../types/types"
import { AddIcon } from '@chakra-ui/icons';
import { useQuery } from "@tanstack/react-query"
import { IMaskInput } from "react-imask"
import { toast } from "../helpers/toast"
import { NewCategoryModal } from "./NewCategoryModal"

type EntryFormProps = {
    id?: string,
}

export const NewEntryForm: React.FC<EntryFormProps> = ({ id }) => {
    const { isLoggedIn, loggedUser } = useAuthStore();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();

    const getEntry = async (id?: string) => {
        if (!id) return null;
        try {
            const docRef = doc(db, "users", `${loggedUser?.email}`, "entries", id);
            const docSnap = await getDoc(docRef);
            const data = docSnap.data();
            if (!data) throw Error('Registro não encontrado :(');

            const res = {
                createdAt: data?.createdAt,
                type: data?.type,
                title: data?.title,
                category: data?.category,
                amount: `${data?.amountInt + (data?.amountDec / 100)}`.replace('.', ','),
            }
            reset(res);
            return res;
        } catch (e: any) {
            toast.error(e.message);
            navigate(Route.HOME, { replace: true });
        }
    }

    const { isFetching: isFetchingEdit } = useQuery({
        queryKey: ['entry', id],
        queryFn: () => getEntry(id),
        enabled: isLoggedIn && !!loggedUser.email?.length && !!id,
    })

    const entryForm = useForm<EntryForm>({
        defaultValues: {
            createdAt: new Date(),
            type: undefined,
            category: undefined,
            amount: undefined,
        },
        shouldUnregister: false
    });

    const { register, control, reset } = entryForm;

    const onSubmit = entryForm.handleSubmit(async (formData: EntryForm) => {
        if (!isLoggedIn) {
            toast.info('É necessário logar para salvar um registro!')
            return;
        };

        const x = parseFloat(`${formData.amount}`.replace(',', '.'));
        const amountInt = Math.trunc(x);
        const amountDec = Number((x - amountInt).toFixed(2)) * 100;
        const entry = { ...formData, amountDec: isNaN(amountDec) ? 0 : amountDec, amountInt }

        try {
            if (!id) {
                await addDoc(collection(db, "users", `${loggedUser.email}`, "entries"), { ...entry });
            } else {
                const entryRef = doc(db, "users", `${loggedUser.email}`, "entries", id);
                await updateDoc(entryRef, { ...entry });
            }
            toast.success('Registro salvo!');
            navigate(Route.HOME, { replace: true })

        } catch (e) {
            toast.error('Não foi possível salvar o registro :(');
        }
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

    if (isFetching || isFetchingEdit) {
        return (
            <Flex w="full" align="center" justify="center" h="full">
                <Spinner />
            </Flex>
        )
    }

    return (
        <Flex w="full" flexDirection="column">
            <NewCategoryModal isOpen={isOpen} onClose={onClose} />
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
                    render={({ field: { value, onChange } }) => (
                        <InputGroup>
                            <InputLeftAddon>R$ </InputLeftAddon>
                            <Input
                                min={0.01}
                                as={IMaskInput}
                                mask={Number}
                                value={String(value)}
                                name="amount"
                                onAccept={(val: string) => onChange(val)}

                            />
                        </InputGroup>
                    )}
                />
                <Button mt={2} type="button" onClick={onSubmit}>Salvar</Button>
            </Form>
        </Flex>
    )
}