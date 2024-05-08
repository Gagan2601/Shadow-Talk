'use client'
import * as React from 'react';
import { TextField, Button, Snackbar } from '@mui/material';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import Background from './HomeBackground';

const checkIfUsernameValid = (username: string) => {
    return username.length >= 3 && !username.includes(' ');
};

const checkIfRoomNameValid = (roomName: string) => {
    return roomName.length >= 3 && !roomName.includes(' ');
};

const HomePage: React.FC = () => {
    const [roomName, setRoomName] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [isUsernameValid, setIsUsernameValid] = React.useState(false);
    const [isRoomNameValid, setIsRoomNameValid] = React.useState(false);
    const [hasInteractedWithRoomName, setHasInteractedWithRoomName] = React.useState(false);
    const [hasInteractedWithUserName, setHasInteractedWithUserName] = React.useState(false);
    const [openToast, setOpenToast] = React.useState(false)

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newUsername = event.target.value;
        setUsername(newUsername);
        setIsUsernameValid(checkIfUsernameValid(newUsername));
        setHasInteractedWithUserName(true);
    };

    const handleRoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRoomName = event.target.value;
        setRoomName(newRoomName);
        setIsRoomNameValid(checkIfRoomNameValid(newRoomName));
        setHasInteractedWithRoomName(true);
    };

    const handleJoinClick = () => {
        if (!isUsernameValid || !isRoomNameValid) {
            setOpenToast(true);
        }
    };

    const handleCloseToast = () => {
        setOpenToast(false);
    };

    return (
        <>
            <Background />
            <div className={styles.container}>
                <h1 className={styles.title}>Shadow <span className={styles.titleMain}>Talk</span></h1>
                <p className={styles.description}>
                    Join a public chat room and connect with people around the world.
                </p>
                <TextField
                    className={`${styles.textField} customTextField`}
                    label="Enter Room Name"
                    variant="outlined"
                    value={roomName}
                    onChange={handleRoomChange}
                    error={hasInteractedWithRoomName && !isRoomNameValid}
                    helperText={hasInteractedWithRoomName && !isRoomNameValid ? 'Room name must be at least 3 characters long with no spaces' : ''}
                />
                <TextField
                    className={`${styles.textField} customTextField`}
                    label="Enter Username"
                    variant="outlined"
                    value={username}
                    onChange={handleUsernameChange}
                    error={hasInteractedWithUserName && !isUsernameValid}
                    helperText={hasInteractedWithUserName && !isUsernameValid ? 'Username must be at least 3 characters long with no spaces' : ''}
                />
                <Link href={isUsernameValid && isRoomNameValid ? `/chat/${roomName}/${username}` : ''}
                    passHref>
                    <Button variant="contained" className={styles.joinButton} onClick={handleJoinClick}>
                        Join Chat
                    </Button>
                </Link>
            </div>
            <Snackbar
                open={openToast}
                autoHideDuration={3000}
                onClose={handleCloseToast}
                message="Username or Room name is invalid. Please check and try again."
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                ContentProps={{
                    sx: {
                        backgroundColor: 'red',
                        color: 'white',
                    },
                }}
            />
        </>
    );
};

export default HomePage;