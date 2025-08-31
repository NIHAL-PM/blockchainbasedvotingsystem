import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast, Heading } from '@chakra-ui/react';
import { authorizeOfficerOnChain } from '../utils/blockchain';

const AuthorizeOfficer = () => {
    const [officerAddress, setOfficerAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleAuthorize = async () => {
        if (!officerAddress || !/^0x[a-fA-F0-9]{40}$/.test(officerAddress)) {
            toast({
                title: 'Invalid Address',
                description: 'Please enter a valid Ethereum address',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await authorizeOfficerOnChain(officerAddress);
            if (result.success) {
                toast({
                    title: 'Success',
                    description: `Officer ${officerAddress} authorized successfully`,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                setOfficerAddress('');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                title: 'Authorization Failed',
                description: error.message || 'Failed to authorize officer',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box p={6} borderWidth={1} borderRadius="lg" bg="white" shadow="md">
            <VStack spacing={4} align="stretch">
                <Heading size="md" color="blue.600">Authorize Polling Officer</Heading>
                <FormControl>
                    <FormLabel>Officer Address</FormLabel>
                    <Input
                        type="text"
                        placeholder="0x..."
                        value={officerAddress}
                        onChange={(e) => setOfficerAddress(e.target.value)}
                    />
                </FormControl>
                <Button
                    colorScheme="purple"
                    onClick={handleAuthorize}
                    isLoading={isLoading}
                    loadingText="Authorizing..."
                >
                    Authorize Officer
                </Button>
            </VStack>
        </Box>
    );
};

export default AuthorizeOfficer;