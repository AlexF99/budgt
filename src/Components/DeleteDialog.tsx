import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef } from "react"
import { toast } from "../helpers/toast"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuthStore } from "../zustand/authStore"

type AlertDialogProps = {
    isOpen: boolean,
    invalidateQueryId: string,
    path: string,
    entityId?: string,
    onClose: () => void
}

export const DeleteDialog: React.FC<AlertDialogProps> = ({ isOpen, onClose, path, entityId, invalidateQueryId }) => {
    const cancelRef = useRef(null);
    const { loggedUser } = useAuthStore();
    const queryClient = useQueryClient();

    const deleteEntry = async () => {
        if (!entityId || !loggedUser?.email || !path) {
            toast.error('Algo deu errado!');
            return;
        }
        await deleteDoc(doc(db, "users", loggedUser.email ?? '', path, entityId ?? ''));
    }

    const { mutate } = useMutation({
        mutationFn: () => deleteEntry(),
        onSuccess: () => {
            toast.success('Registro deletado!');
            queryClient.invalidateQueries({ queryKey: [invalidateQueryId] });
            onClose();
        },
        onError: () => { toast.error('Algo deu errado!'); onClose(); }
    })

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Deletar Registro
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Tem certeza?
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme='red' onClick={() => mutate()} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}