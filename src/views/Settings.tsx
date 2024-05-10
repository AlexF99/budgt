import { Box, Button, Card, CardBody, Flex, Heading, IconButton, Spinner, useDisclosure } from "@chakra-ui/react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";
import { useAuthStore } from "../zustand/authStore";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DeleteDialog } from "../Components/DeleteDialog";
import { DeleteIcon } from "@chakra-ui/icons";
import { NewCategoryModal } from "../Components/NewCategoryModal";

export const Settings = () => {
    const { loggedUser, isLoggedIn } = useAuthStore();
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure();
    const { isOpen: isCategoryModalOpen, onOpen: onCategoryModalOpen, onClose: onCategoryModalClose } = useDisclosure();

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

    if (isFetching) {
        return (
            <Flex w="full" align="center" justify="center" h="full">
                <Spinner />
            </Flex>
        )
    }

    return (
        <Box>
            <NewCategoryModal isOpen={isCategoryModalOpen} onClose={onCategoryModalClose} />
            <Flex justify='space-between'>
                <Heading>Categorias</Heading>
                <Button onClick={onCategoryModalOpen}>Nova categoria</Button>
            </Flex>
            <DeleteDialog onClose={onDeleteDialogClose} entityId={categoryId} isOpen={isDeleteDialogOpen} path="categories" invalidateQueryId="categories" />
            {categories && categories.map(c => (
                <Card key={c.id} mt={4}>
                    <IconButton
                        onClick={() => {
                            setCategoryId(c.id);
                            onDeleteDialogOpen();
                        }}
                        pos='absolute'
                        right='8px'
                        top='8px'
                        isRound={true}
                        variant='solid'
                        colorScheme='red'
                        aria-label='Done'
                        fontSize='12px'
                        icon={<DeleteIcon />}
                        size='sm'
                    />
                    <CardBody>
                        {c.name}
                    </CardBody>
                </Card>
            ))}
        </Box>
    );
}