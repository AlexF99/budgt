import { Box, Heading } from "@chakra-ui/react";
import { NewEntryForm } from "../Components/NewEntryForm";

export const New = () => (
    <Box p="5">
        <Heading>Novo Registro</Heading>
        <NewEntryForm />
    </Box>
)