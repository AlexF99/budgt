import {
    Button,
    ButtonGroup,
    Input,
    InputGroup,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay
} from "@chakra-ui/react"
import { Form } from "./Form"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../zustand/authStore";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "../helpers/toast";

type CategoryAdd = {
    name: string
}

type CategoryModalProps = {
    isOpen: boolean,
    onClose: () => void
}

const NewCategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
    const { isLoggedIn, loggedUser } = useAuthStore();

    const queryClient = useQueryClient();

    const categoryForm = useForm<CategoryAdd>({
        defaultValues: { name: undefined },
        shouldUnregister: false
    });

    const { register: registerCategory, reset: resetCategory } = categoryForm;

    const saveCategory = async (c: CategoryAdd) => {
        if (!isLoggedIn) return;
        try {
            await addDoc(collection(db, "users", `${loggedUser.email}`, "categories"), { ...c });
        } catch (e) { }
    }

    const { mutate: mutateCategory, isPending } = useMutation({
        mutationFn: (c: CategoryAdd) => saveCategory(c),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            resetCategory();
            onClose();
            toast.success('Categoria criada!');
        },
        onError: () => { toast.error('Algo deu errado :(') }
    })

    const onSubmitCategory = categoryForm.handleSubmit(async (formData: CategoryAdd) => { mutateCategory(formData); })

    return (<Modal isOpen={isOpen} onClose={onClose}>
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
    </Modal>)
}

export { NewCategoryModal };