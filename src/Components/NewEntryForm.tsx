import { Button, Flex, Input, InputGroup, InputLeftAddon, Select } from "@chakra-ui/react"
import { Form } from "./Form"
import { useForm } from "react-hook-form"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../firebase"
import { useAuthStore } from "../zustand/authStore"
import { useNavigate } from "react-router-dom"
import { Route } from "../router"
import { Entry } from "../types/types"

export const NewEntryForm = () => {
    const { isLoggedIn, loggedUser } = useAuthStore();
    const navigate = useNavigate();

    const form = useForm<Entry>({
        defaultValues: {
            createdAt: new Date(),
            type: 'expense',
            amountInt: 0,
            amountDec: 0,
        },
        shouldUnregister: false
    });

    const { register } = form;

    const onSubmit = form.handleSubmit(async (formData: Entry) => {
        if (!isLoggedIn) return;
        delete formData.id;
        const entry = { ...formData, amountDec: parseInt(`${formData.amountDec}`), amountInt: parseInt(`${formData.amountInt}`) }
        try {
            await addDoc(collection(db, "users", `${loggedUser.email}`, "entries"), { ...entry });
            navigate(Route.HOME, { replace: true })
        } catch (e) {
            //
        }
    })

    return (
        <Flex p="5" w="full" flexDirection="column">
            <Form form={form}>
                <Select {...register('type')} name="type" mb={4} placeholder="Ganho ou Gasto?">
                    <option value='expense'>Gasto</option>
                    <option value='gain'>Ganho</option>
                </Select>
                <InputGroup size='md' mb={4}>
                    <InputLeftAddon>R$</InputLeftAddon>
                    <Input {...register('amountInt')} name="amountInt" type="number" />
                    <InputLeftAddon>,</InputLeftAddon>
                    <Input {...register('amountDec')} name="amountDec" type="number" />
                </InputGroup>
                <Button type="button" onClick={onSubmit}>Enviar</Button>
            </Form>
        </Flex>
    )
}