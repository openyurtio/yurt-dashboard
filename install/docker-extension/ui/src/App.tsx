import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Container,
    Grid,
    Paper,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BackendStatus, ContainerCard, Header } from './components';

// const client = createDockerDesktopClient();

// function useDockerDesktopClient() {
//     return client;
// }

interface Container {
    Id: string;
    Names: string[];
    Image: string;
    State: string;
    Status: string;
}

function App() {
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [containers, setContainers] = useState<Container[]>([]);
    // const ddClient = useDockerDesktopClient();

    // const fetchHello = async () => {
    //     setLoading(true);
    //     setError('');
    //     try {
    //         const result = await ddClient.extension.vm?.service?.get('/hello');
    //         setMessage(result?.Message || 'No message received');
    //     } catch (err: any) {
    //         setError(err.message || 'Failed to fetch data from backend');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const fetchContainers = async () => {
    //     try {
    //         const result = await ddClient.docker.listContainers();
    //         setContainers(result);
    //     } catch (err: any) {
    //         console.error('Failed to fetch containers:', err);
    //     }
    // };

    useEffect(() => {
        // fetchHello();
        // fetchContainers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)',
                py: 4,
            }}
        >
            <Container maxWidth="lg">
                {/* Header Section */}
                <Header />

                {/* Backend Connection Card */}
                {/* v
                {/* Containers Section */}
                <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                    Docker Containers
                </Typography>

                {containers.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No containers found. Start some containers to see them here.
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {containers.map((container) => (
                            <Grid item xs={12} md={6} key={container.Id}>
                                <ContainerCard container={container} />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Refresh Button */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        // onClick={fetchContainers}
                        size="large"
                    >
                        Refresh Containers
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}

export default App;

