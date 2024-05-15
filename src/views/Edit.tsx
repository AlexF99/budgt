import { Box, Heading } from "@chakra-ui/react";
import { NewEntryForm } from "../Components/NewEntryForm";
import { useParams } from "react-router-dom";

export const Edit = () => {
    const { id } = useParams();
    
    return (
    <Box>
        <Heading mb={4}>Editar</Heading>
        <NewEntryForm id={id} />
    </Box>
)}