import { useState } from 'react';
import { Box, FormControl, FormLabel, Input, Button, useToast, VStack, Heading, Text, RadioGroup, Stack, Radio, Divider } from '@chakra-ui/react';
import { getVoterInfo, castVoteOnChain } from '../utils/blockchain';

const candidates = {
    0: ["Candidate A0", "Candidate B0"],
    1: ["Candidate A1", "Candidate B1"],
    2: ["Candidate A2", "Candidate B2"],
    3: ["Candidate A3", "Candidate B3"],
    4: ["Candidate A4", "Candidate B4"],
};

const CastVote = () => {
    const [voterId, setVoterId] = useState('');
    const [voterInfo, setVoterInfo] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState('0');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const toast = useToast();

    const handleFetchVoter = async () => {
        if (!voterId) {
            toast({ title: "Invalid input", description: "Please enter a Voter ID.", status: "error", duration: 3000, isClosable: true });
            return;
        }
        setIsFetching(true);
        const info = await getVoterInfo(voterId);
        setIsFetching(false);
        if (!info || !info.success) {
            toast({ title: "Error", description: info?.message || "Failed to fetch voter info.", status: "error", duration: 5000, isClosable: true });
            setVoterInfo(null);
            return;
        }
        if (info.data.isRegistered) {
            setVoterInfo(info.data);
        } else {
            toast({ title: "Voter not found", description: "This voter is not registered.", status: "error", duration: 5000, isClosable: true });
            setVoterInfo(null);
        }
    };

    const handleCastVote = async () => {
        setIsLoading(true);
        const result = await castVoteOnChain(voterId, parseInt(selectedCandidate));
        setIsLoading(false);
        if (!result) {
            toast({ title: "Error", description: "Contract not ready.", status: "error", duration: 5000, isClosable: true });
            return;
        }
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            status: result.success ? "success" : "error",
            duration: 9000,
            isClosable: true,
        });
        if (result.success) {
            setVoterInfo(null);
            setVoterId('');
        }
    };

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <VStack spacing={4}>
                <Heading size="md">Cast Vote</Heading>
                <FormControl>
                    <FormLabel>Voter ID</FormLabel>
                    <Input placeholder="Enter Voter ID to cast vote" value={voterId} onChange={(e) => setVoterId(e.target.value)} aria-label="Voter ID" />
                </FormControl>
                <Button colorScheme="teal" isLoading={isFetching} onClick={handleFetchVoter} width="full">
                    Fetch Voter Status
                </Button>

                {voterInfo && (
                    <Box width="full" pt={4}>
                        <Divider my={4}/>
                        <Text><strong>Name:</strong> {voterInfo.name}</Text>
                        <Text><strong>Status:</strong> {voterInfo.hasVoted ? <Text as="span" color="red.500">ALREADY VOTED</Text> : <Text as="span" color="green.500">ELIGIBLE TO VOTE</Text>}</Text>

                        {!voterInfo.hasVoted && (
                            <VStack pt={4} spacing={4}>
                                <Heading size="sm">Select a Candidate</Heading>
                                <RadioGroup onChange={setSelectedCandidate} value={selectedCandidate} aria-label="Candidate selection">
                                    <Stack direction={{ base: "column", sm: "row" }}>
                                        {candidates[voterInfo.constituencyId].map((name, index) => (
                                            <Radio key={index} value={String(index)}>{name}</Radio>
                                        ))}
                                    </Stack>
                                </RadioGroup>
                                <Button colorScheme="green" isLoading={isLoading} onClick={handleCastVote} width="full">
                                    Cast Your Vote Securely
                                </Button>
                            </VStack>
                        )}
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default CastVote;
