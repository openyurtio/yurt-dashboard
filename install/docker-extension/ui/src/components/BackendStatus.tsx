import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import React from 'react';

interface BackendStatusProps {
    message: string;
    loading: boolean;
    error: string;
    onRefresh: () => void;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({
    message,
    loading,
    error,
    onRefresh,
}) => {
    return (
        <Card sx={{ mb: 4 }}>
            <CardContent>
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Backend Connection Status
                        </Typography>
                        {loading ? (
                            <Box display="flex" alignItems="center" gap={1}>
                                <CircularProgress size={20} />
                                <Typography color="text.secondary">
                                    Connecting...
                                </Typography>
                            </Box>
                        ) : error ? (
                            <Alert severity="error" icon={<ErrorIcon />}>
                                {error}
                            </Alert>
                        ) : (
                            <Stack direction="row" spacing={2} alignItems="center">
                                <CheckCircleIcon color="success" />
                                <Typography color="success.main" fontWeight={600}>
                                    Connected
                                </Typography>
                                <Chip
                                    label={message}
                                    color="primary"
                                    size="small"
                                    variant="outlined"
                                />
                            </Stack>
                        )}
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

