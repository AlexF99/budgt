import { Button, Flex, Input, InputGroup, InputLeftAddon, Select } from "@chakra-ui/react"
import { Form } from "./Form"
import { useForm } from "react-hook-form"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../firebase"

type Entry = {
    createdAt: Date,
    amountInt: number,
    amountDec: number,
    type: string,
}

export const NewEntryForm = () => {
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
        const entry = { ...formData, amountDec: parseInt(`${formData.amountDec}`), amountInt: parseInt(`${formData.amountInt}`) }

        await addDoc(collection(db, "users", "alexandre", "entries"), { ...entry });
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