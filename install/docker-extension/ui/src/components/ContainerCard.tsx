import {
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from '@mui/material';
import React from 'react';

interface Container {
    Id: string;
    Names: string[];
    Image: string;
    State: string;
    Status: string;
}

interface ContainerCardProps {
    container: Container;
}

const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
        case 'running':
            return 'success';
        case 'exited':
            return 'error';
        case 'paused':
            return 'warning';
        default:
            return 'default';
    }
};

export const ContainerCard: React.FC<ContainerCardProps> = ({ container }) => {
    return (
        <Card
            sx={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                },
            }}
        >
            <CardContent>
                <Stack spacing={2}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                wordBreak: 'break-all',
                                fontWeight: 600,
                            }}
                        >
                            {container.Names[0]?.replace('/', '') || 'Unnamed'}
                        </Typography>
                        <Chip
                            label={container.State}
                            color={getStatusColor(container.State) as any}
                            size="small"
                        />
                    </Stack>

                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                        >
                            Image
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                            {container.Image}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                        >
                            Status
                        </Typography>
                        <Typography variant="body2">
                            {container.Status}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                        >
                            Container ID
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                wordBreak: 'break-all',
                            }}
                        >
                            {container.Id.substring(0, 12)}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

