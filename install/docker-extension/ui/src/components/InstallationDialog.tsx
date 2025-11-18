import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Step,
    StepLabel,
    Stepper,
    Typography,
} from '@mui/material';
import {
    CheckCircle,
    Error as ErrorIcon,
    HourglassEmpty,
} from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { createDockerDesktopClient } from '@docker/extension-api-client';

const ddClient = createDockerDesktopClient();

interface InstallationStep {
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    description?: string;
    error?: string;
}

interface InstallationStatus {
    id: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    currentStep: string;
    progress: number;
    steps: InstallationStep[];
    startedAt?: string;
    completedAt?: string;
    error?: string;
}

interface InstallationDialogProps {
    open: boolean;
    onClose: () => void;
    onInstallationComplete: () => void;
}

export const InstallationDialog: React.FC<InstallationDialogProps> = ({
    open,
    onClose,
    onInstallationComplete,
}) => {
    const [installing, setInstalling] = useState(false);
    const [installationId, setInstallationId] = useState<string | null>(null);
    const [installationStatus, setInstallationStatus] = useState<InstallationStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [checkingPrerequisites, setCheckingPrerequisites] = useState(false);
    const [prerequisitesReady, setPrerequisitesReady] = useState<boolean | null>(null);
    const [prerequisitesError, setPrerequisitesError] = useState<string | null>(null);

    useEffect(() => {
        if (open && !installing) {
            checkPrerequisites();
        }
    }, [open, installing]);

    // Poll for installation status
    useEffect(() => {
        if (!installationId || !installing) {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const result = await ddClient.extension.vm?.service?.get(
                    `/api/install/status/${installationId}`
                );
                if (result) {
                    setInstallationStatus(result as InstallationStatus);
                    
                    if (result.status === 'completed') {
                        setInstalling(false);
                        clearInterval(interval);
                        onInstallationComplete();
                        ddClient.desktopUI.toast.success('OpenYurt installation completed successfully!');
                    } else if (result.status === 'failed') {
                        setInstalling(false);
                        setError(result.error || 'Installation failed');
                        clearInterval(interval);
                    }
                }
            } catch (err: any) {
                console.error('Failed to fetch installation status:', err);
                // Continue polling even if one request fails
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [installationId, installing, onInstallationComplete]);

    const checkPrerequisites = async () => {
        setCheckingPrerequisites(true);
        setPrerequisitesError(null);
        try {
            const result = await ddClient.extension.vm?.service?.post(
                '/api/install/prerequisites/check'
            );
            if (result && result.ready) {
                setPrerequisitesReady(true);
            } else {
                setPrerequisitesReady(false);
                setPrerequisitesError('Prerequisites check failed. Please ensure kubectl and helm are installed and accessible.');
            }
        } catch (err: any) {
            setPrerequisitesReady(false);
            setPrerequisitesError(err.message || 'Failed to check prerequisites');
        } finally {
            setCheckingPrerequisites(false);
        }
    };

    const handleStartInstallation = async () => {
        setInstalling(true);
        setError(null);
        setInstallationStatus(null);

        try {
            const result = await ddClient.extension.vm?.service?.post(
                '/api/install/start',
                {
                    kubernetesServerAddr: '', // Auto-detect
                }
            );

            if (result && result.installationId) {
                setInstallationId(result.installationId);
                ddClient.desktopUI.toast.info('Installation started...');
            } else {
                throw new Error('Failed to start installation');
            }
        } catch (err: any) {
            setInstalling(false);
            setError(err.message || 'Failed to start installation');
            ddClient.desktopUI.toast.error(err.message || 'Failed to start installation');
        }
    };

    const handleClose = () => {
        if (!installing) {
            setInstallationId(null);
            setInstallationStatus(null);
            setError(null);
            setPrerequisitesReady(null);
            setPrerequisitesError(null);
            onClose();
        }
    };

    const getStepStatus = (step: InstallationStep) => {
        switch (step.status) {
            case 'completed':
                return 'completed';
            case 'failed':
                return 'error';
            case 'in_progress':
                return 'active';
            default:
                return 'pending';
        }
    };

    const getStepIcon = (step: InstallationStep) => {
        switch (step.status) {
            case 'completed':
                return <CheckCircle color="success" />;
            case 'failed':
                return <ErrorIcon color="error" />;
            case 'in_progress':
                return <CircularProgress size={20} />;
            default:
                return <HourglassEmpty color="disabled" />;
        }
    };

    const activeStep = installationStatus?.steps.findIndex(
        (step) => step.status === 'in_progress' || step.status === 'failed'
    ) ?? -1;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'rgba(22, 27, 34, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
            }}
        >
            <DialogTitle>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Install OpenYurt
                </Typography>
            </DialogTitle>
            <DialogContent>
                {checkingPrerequisites && (
                    <Box sx={{ py: 2, textAlign: 'center' }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Checking prerequisites...
                        </Typography>
                    </Box>
                )}

                {!checkingPrerequisites && prerequisitesReady === false && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            {prerequisitesError || 'Prerequisites check failed. Please ensure kubectl and helm are installed and accessible.'}
                        </Typography>
                    </Alert>
                )}

                {!checkingPrerequisites && prerequisitesReady && !installing && (
                    <Box>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Prerequisites check passed. Ready to install OpenYurt.
                        </Alert>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            This will install the following OpenYurt components:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="yurt-manager"
                                    secondary="Node lifecycle & CSR management"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="yurthub"
                                    secondary="Edge-cloud communication proxy"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="raven-agent"
                                    secondary="Cross-network connectivity"
                                />
                            </ListItem>
                        </List>
                    </Box>
                )}

                {installing && installationStatus && (
                    <Box>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Installation in progress... {installationStatus.progress}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={installationStatus.progress}
                            sx={{ mb: 3, height: 8, borderRadius: 1 }}
                        />
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {installationStatus.steps.map((step, index) => (
                                <Step key={step.name} completed={step.status === 'completed'}>
                                    <StepLabel
                                        error={step.status === 'failed'}
                                        icon={getStepIcon(step)}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {step.description || step.name}
                                        </Typography>
                                        {step.error && (
                                            <Typography
                                                variant="caption"
                                                color="error"
                                                sx={{ display: 'block', mt: 0.5 }}
                                            >
                                                {step.error}
                                            </Typography>
                                        )}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                )}

                {installing && !installationStatus && (
                    <Box sx={{ py: 2, textAlign: 'center' }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Starting installation...
                        </Typography>
                    </Box>
                )}

                {!checkingPrerequisites && !installing && prerequisitesReady === null && (
                    <Alert severity="info">
                        Please wait while we check prerequisites...
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    disabled={installing}
                    color="inherit"
                >
                    {installing ? 'Installing...' : 'Close'}
                </Button>
                {prerequisitesReady && !installing && (
                    <Button
                        onClick={handleStartInstallation}
                        variant="contained"
                        color="primary"
                    >
                        Start Installation
                    </Button>
                )}
                {!prerequisitesReady && !checkingPrerequisites && (
                    <Button
                        onClick={checkPrerequisites}
                        variant="outlined"
                        color="primary"
                    >
                        Retry Prerequisites Check
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

