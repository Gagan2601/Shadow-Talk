import React from 'react';
import { Snackbar } from '@mui/material';

interface CustomSnackbarProps {
    open: boolean;
    message: string;
    onClose: () => void;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({ open, message, onClose }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={onClose}
            message={message}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            ContentProps={{
                sx: {
                    backgroundColor: 'red',
                    color: 'white',
                },
            }}
        />
    );
};

export default CustomSnackbar;
