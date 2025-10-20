import { CloudQueue as CloudIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import React from 'react';

export const Header: React.FC = () => {
    return (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
            <CloudIcon sx={{ fontSize: 60, color: '#2196F3', mb: 2 }} />
            <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #2196F3 30%, #00BCD4 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                Docker Extension Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
                Manage and monitor your Docker containers with ease
            </Typography>
        </Box>
    );
};

