import { useState } from 'react';
import { Box, FormControl, FormLabel, Input, Select, Button, useToast, VStack, Heading } from '@chakra-ui/react';
import { registerVoterOnChain } from '../utils/blockchain';

const constituencies = ["Bengaluru South", "Bengaluru North", "Bengaluru Central", "Jayanagar", "Koramangala"];

const RegisterVoter = () => {
    const [voterId, setVoterId] = useState('');
    const [name, setName] = useState('');
    const [constituencyId, setConstituencyId] = useState('0');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleRegister = async () => {
        if (!voterId || !name || !constituencyId.match(/^[0-4]$/)) {
            toast({ title: "Invalid input", description: "Please fill all fields correctly.", status: "error", duration: 3000, isClosable: true });
            return;
        }
        setIsLoading(true);
        const result = await registerVoterOnChain(voterId, name, parseInt(constituencyId));
        setIsLoading(false);

        if (!result) {
            toast({ title: "Error", description: "Contract not ready.", status: "error", duration: 5000, isClosable: true });
            return;
        }

        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            status: result.success ? "success" : "error",
            duration: 5000,
            isClosable: true,
        });

        if (result.success) {
            setVoterId('');
            setName('');
            setConstituencyId('0');
        }
    };

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <VStack spacing={4}>
                <Heading size="md">Register New Voter</Heading>
                <FormControl isRequired>
                    <FormLabel>Voter ID</FormLabel>
                    <Input placeholder="Enter Voter ID (e.g., ABC1234567)" value={voterId} onChange={(e) => setVoterId(e.target.value)} aria-label="Voter ID" />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input placeholder="Enter Full Name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Full Name" />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Constituency</FormLabel>
                    <Select value={constituencyId} onChange={(e) => setConstituencyId(e.target.value)} aria-label="Constituency">
                        {constituencies.map((name, index) => (
                            <option key={index} value={index}>{name}</option>
                        ))}
                    </Select>
                </FormControl>
                <Button colorScheme="blue" isLoading={isLoading} onClick={handleRegister} width="full">
                    Register Voter on Blockchain
                </Button>
            </VStack>
        </Box>
    );
};

export default RegisterVoter;
