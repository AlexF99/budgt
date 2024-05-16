import { Box, Button, Card, CardBody, Flex, Heading, IconButton, Spinner, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { DeleteDialog } from "../Components/DeleteDialog";
import { DeleteIcon } from "@chakra-ui/icons";
import { NewCategoryModal } from "../Components/NewCategoryModal";
import { useQueryCategories } from "../hooks/useQueryCategories";

export const Settings = () => {
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure();
    const { isOpen: isCategoryModalOpen, onOpen: onCategoryModalOpen, onClose: onCategoryModalClose } = useDisclosure();

    const { data: categories, isFetching } = useQueryCategories();

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