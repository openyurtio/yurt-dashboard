import {
    CheckCircle,
    Error as ErrorIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
} from '@mui/material';
import React from 'react';

export interface Service {
    id: string;
    name: string;
    description: string;
    icon: string;
    status: 'healthy' | 'error' | 'warning';
}

interface ServiceCardProps {
    service: Service;
}

const getStatusIcon = (status: Service['status']) => {
    switch (status) {
        case 'healthy':
            return <CheckCircle sx={{ fontSize: 24, color: '#4caf50' }} />;
        case 'error':
            return <ErrorIcon sx={{ fontSize: 24, color: '#f44336' }} />;
        case 'warning':
            return <ErrorIcon sx={{ fontSize: 24, color: '#ff9800' }} />;
        default:
            return <SettingsIcon sx={{ fontSize: 24 }} />;
    }
};

const getServiceIcon = (iconName: string) => {
    // Map icon names to emoji or symbols
    const iconMap: Record<string, string> = {
        manager: '⚙️',
        hub: '🔗',
        agent: '🔄',
        kubelet: '📦',
        proxy: '🔀',
        dns: '🌐',
        dashboard: '📊',
    };
    return iconMap[iconName] || '🔧';
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    return (
        <Card
            sx={{
                mb: 2,
                transition: 'all 0.2s',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)',
                    borderColor: 'rgba(33, 150, 243, 0.5)',
                },
            }}
        >
            <CardContent sx={{ py: 2.5, px: 3 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                        <Box
                            sx={{
                                fontSize: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {getServiceIcon(service.icon)}
                        </Box>
                        <Box flex={1}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    mb: 0.5,
                                }}
                            >
                                {service.name}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: '0.875rem' }}
                            >
                                {service.description}
                            </Typography>
                        </Box>
                    </Stack>
                    <Box>{getStatusIcon(service.status)}</Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

