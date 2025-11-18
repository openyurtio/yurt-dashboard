import { createDockerDesktopClient } from '@docker/extension-api-client';
import {
    Dashboard as DashboardIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Service, ServiceCard, InstallationDialog } from './components';

const ddClient = createDockerDesktopClient();

// const client = createDockerDesktopClient();

// function useDockerDesktopClient() {
//     return client;
// }

// Sample OpenYurt Services Data
// This demonstrates different service states for UI showcase
const sampleServices: Service[] = [
    {
        id: 'yurt-manager',
        name: 'Yurt Manager',
        description: 'Node lifecycle & CSR management',
        icon: 'manager',
        status: 'healthy',
    },
    {
        id: 'yurthub',
        name: 'YurtHub',
        description: 'Edge-cloud communication proxy',
        icon: 'hub',
        status: 'healthy',
    },
    {
        id: 'raven-agent',
        name: 'Raven Agent',
        description: 'Cross-network connectivity',
        icon: 'agent',
        status: 'healthy',
    },
    {
        id: 'kubelet',
        name: 'Kubelet',
        description: 'Container runtime management',
        icon: 'kubelet',
        status: 'healthy',
    },
    {
        id: 'kube-proxy',
        name: 'Kube Proxy',
        description: 'Service load balancing',
        icon: 'proxy',
        status: 'warning',
    },
    {
        id: 'coredns',
        name: 'CoreDNS',
        description: 'DNS resolution service',
        icon: 'dns',
        status: 'healthy',
    },
    {
        id: 'dashboard',
        name: 'Dashboard',
        description: 'Web management interface',
        icon: 'dashboard',
        status: 'warning',
    },
];

// Alternative: All services healthy (uncomment to use)
// const sampleServices: Service[] = [
//     {
//         id: 'yurt-manager',
//         name: 'Yurt Manager',
//         description: 'Node lifecycle & CSR management',
//         icon: 'manager',
//         status: 'healthy',
//     },
//     {
//         id: 'yurthub',
//         name: 'YurtHub',
//         description: 'Edge-cloud communication proxy',
//         icon: 'hub',
//         status: 'healthy',
//     },
//     {
//         id: 'raven-agent',
//         name: 'Raven Agent',
//         description: 'Cross-network connectivity',
//         icon: 'agent',
//         status: 'healthy',
//     },
//     {
//         id: 'kubelet',
//         name: 'Kubelet',
//         description: 'Container runtime management',
//         icon: 'kubelet',
//         status: 'healthy',
//     },
//     {
//         id: 'kube-proxy',
//         name: 'Kube Proxy',
//         description: 'Service load balancing',
//         icon: 'proxy',
//         status: 'healthy',
//     },
//     {
//         id: 'coredns',
//         name: 'CoreDNS',
//         description: 'DNS resolution service',
//         icon: 'dns',
//         status: 'healthy',
//     },
//     {
//         id: 'dashboard',
//         name: 'Dashboard',
//         description: 'Web management interface',
//         icon: 'dashboard',
//         status: 'healthy',
//     },
// ];

// Alternative: Mixed states with errors (uncomment to use)
// const sampleServices: Service[] = [
//     {
//         id: 'yurt-manager',
//         name: 'Yurt Manager',
//         description: 'Node lifecycle & CSR management',
//         icon: 'manager',
//         status: 'healthy',
//     },
//     {
//         id: 'yurthub',
//         name: 'YurtHub',
//         description: 'Edge-cloud communication proxy',
//         icon: 'hub',
//         status: 'error',
//     },
//     {
//         id: 'raven-agent',
//         name: 'Raven Agent',
//         description: 'Cross-network connectivity',
//         icon: 'agent',
//         status: 'healthy',
//     },
//     {
//         id: 'kubelet',
//         name: 'Kubelet',
//         description: 'Container runtime management',
//         icon: 'kubelet',
//         status: 'warning',
//     },
//     {
//         id: 'kube-proxy',
//         name: 'Kube Proxy',
//         description: 'Service load balancing',
//         icon: 'proxy',
//         status: 'healthy',
//     },
//     {
//         id: 'coredns',
//         name: 'CoreDNS',
//         description: 'DNS resolution service',
//         icon: 'dns',
//         status: 'error',
//     },
//     {
//         id: 'dashboard',
//         name: 'Dashboard',
//         description: 'Web management interface',
//         icon: 'dashboard',
//         status: 'warning',
//     },
// ];

function App() {
    const [services, setServices] = useState<Service[]>(sampleServices);
    const [loading, setLoading] = useState<boolean>(false);
    const [installationDialogOpen, setInstallationDialogOpen] = useState<boolean>(false);
    const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

    const healthyCount = services.filter((s) => s.status === 'healthy').length;
    const totalCount = services.length;
    const needsAttention = services.some(
        (s) => s.status === 'error' || s.status === 'warning'
    );

    const fetchServiceStatus = async () => {
        setLoading(true);
        try {
            // Try to fetch service status from backend
            const result = await ddClient.extension.vm?.service?.get('/services/status');
            if (result && Array.isArray(result)) {
                setServices(result);
                // Check if OpenYurt is installed
                const openyurtServices = result.filter(
                    (s: Service) => ['yurt-manager', 'yurthub', 'raven-agent'].includes(s.id)
                );
                const installedCount = openyurtServices.filter(
                    (s: Service) => s.status === 'healthy' || s.status === 'warning'
                ).length;
                setIsInstalled(installedCount > 0);
            } else {
                // Check installation status via dedicated endpoint
                const installCheck = await ddClient.extension.vm?.service?.get('/api/install/check');
                if (installCheck && installCheck.installed) {
                    setIsInstalled(true);
                } else {
                    setIsInstalled(false);
                }
            }
        } catch (err: any) {
            console.log('Using sample service data:', err.message);
            // Keep using the sample services data for demo purposes
            setIsInstalled(false);
        } finally {
            setLoading(false);
        }
    };

    const handleReinstallAll = async () => {
        setInstallationDialogOpen(true);
    };

    const handleOpenDashboard = async () => {
        // Open the dashboard in browser
        await ddClient.host.openExternal('http://localhost:8080');
    };

    const handleInstallationComplete = () => {
        setInstallationDialogOpen(false);
        fetchServiceStatus(); // Refresh service status
    };

    useEffect(() => {
        fetchServiceStatus();
        // Poll for service status every 30 seconds
        const interval = setInterval(() => {
            fetchServiceStatus();
        }, 30000);
        return () => clearInterval(interval);
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
            <Container maxWidth="md">
                {/* Main Service Panel */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        background: 'rgba(22, 27, 34, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ mb: 3 }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 2 }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '1.5rem',
                                }}
                            >
                                OpenYurt Services
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 600,
                                }}
                            >
                                {healthyCount}/{totalCount}
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Services List */}
                    <Box sx={{ mb: 3 }}>
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </Box>

                    {/* Action Buttons */}
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ mb: 2 }}
                        justifyContent="center"
                        flexWrap="wrap"
                    >
                        {isInstalled === false && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                onClick={() => setInstallationDialogOpen(true)}
                                disabled={loading}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    fontWeight: 600,
                                }}
                            >
                                Install OpenYurt
                            </Button>
                        )}
                        {isInstalled === true && (
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleReinstallAll}
                                disabled={loading}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                    },
                                }}
                            >
                                Reinstall All
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchServiceStatus}
                            disabled={loading}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                },
                            }}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DashboardIcon />}
                            onClick={handleOpenDashboard}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                },
                            }}
                        >
                            Dashboard
                        </Button>
                    </Stack>

                    {/* Status Message */}
                    {needsAttention && (
                        <Alert
                            severity="warning"
                            sx={{
                                backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                color: '#ff9800',
                                border: '1px solid rgba(255, 152, 0, 0.3)',
                                borderRadius: 2,
                            }}
                        >
                            Some services need attention
                        </Alert>
                    )}
                </Paper>

                {/* Info Footer */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        OpenYurt Dashboard Extension v1.0.0
                    </Typography>
                </Box>
            </Container>

            {/* Installation Dialog */}
            <InstallationDialog
                open={installationDialogOpen}
                onClose={() => setInstallationDialogOpen(false)}
                onInstallationComplete={handleInstallationComplete}
            />
        </Box>
    );
}

export default App;

