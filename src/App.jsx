import { useState } from 'react';
import { Box, Container, Heading, Button, VStack, Text, Grid, GridItem } from '@chakra-ui/react';
import { connectWallet } from './utils/blockchain';
import RegisterVoter from './components/RegisterVoter';
import CastVote from './components/CastVote';
import AuthorizeOfficer from './components/AuthorizeOfficer';

function App() {
    const [account, setAccount] = useState(null);
    const [isOfficer, setIsOfficer] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    const handleConnect = async () => {
        const { address, isOfficer, error } = await connectWallet();
        setAccount(address);
        setIsOfficer(isOfficer);
        if (error) {
            setConnectionError(error);
        }
    };

    return (
        <Box bg="gray.50" minH="100vh">
            <Container maxW="container.xl" py={10}>
                <VStack spacing={4} mb={10}>
                    <Heading>Decentralized Voting System Dashboard</Heading>
                    <Text>A secure, on-chain voter registration and polling system.</Text>
                </VStack>

                {!account ? (
                    <>
                        <Button colorScheme="blue" onClick={handleConnect}>Connect Wallet</Button>
                        {connectionError && (
                            <Text color="red.500" mt={4}>{connectionError}</Text>
                        )}
                    </>
                ) : (
                    <Box>
                        <Text mb={4}><strong>Connected as:</strong> {account}</Text>
                        {isOfficer ? (
                            <Box>
                                <Text color="green.500" fontWeight="bold" mb={6}>✅ You are an authorized Polling Officer.</Text>
                                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={10}>
                                    <GridItem>
                                        <RegisterVoter />
                                    </GridItem>
                                    <GridItem>
                                        <CastVote />
                                    </GridItem>
                                    <GridItem>
                                        <AuthorizeOfficer />
                                    </GridItem>
                                </Grid>
                            </Box>
                        ) : (
                            <Text color="red.500" fontWeight="bold">❌ Access Denied: This wallet is not an authorized Polling Officer.</Text>
                        )}
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default App;
