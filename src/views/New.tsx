import { Box, Heading } from "@chakra-ui/react";
import { NewEntryForm } from "../Components/NewEntryForm";

export const New = () => (
    <Box p="5">
        <Heading mb={4}>Novo Registro</Heading>
        <NewEntryForm />
    </Box>
)