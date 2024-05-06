'use client'
import * as React from 'react';
import { TextField, Button } from '@mui/material';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const HomePage: React.FC = () => {
    const [roomName, setRoomName] = React.useState('');
    const [username, setUsername] = React.useState('');

    const handleRoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRoomName(event.target.value);
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Chat with Anyone</h1>
            <p className={styles.description}>
                Join a public chat room and connect with people around the world.
            </p>
            <TextField
                className={`${styles.textField} customTextField`}
                label="Enter Room Name"
                variant="outlined"
                value={roomName}
                onChange={handleRoomChange}
                sx={{
                    "&.MuiInputLabel-root": {
                        color: 'yellow',
                    },
                    "&.MuiOutlinedInput-input": {
                        color: 'yellow',
                    },
                    "&.customTextField >.MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: 'yellow',
                            color: 'yellow',
                            '&:focus': {
                                borderColor: 'gold',
                                color: 'gold',
                            },
                            '&:hover': {
                                borderColor: 'goldenrod',
                                color: 'goldenrod',
                            },
                        },
                    },
                }}
            />
            <TextField
                className={`${styles.textField} customTextField`}
                label="Enter Username"
                variant="outlined"
                value={username}
                onChange={handleUsernameChange}
                sx={{
                    "&.MuiInputLabel-root": {
                        color: 'yellow',
                    },
                    "&.MuiOutlinedInput-input": {
                        color: 'yellow',
                    },
                    "&.customTextField >.MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: 'yellow',
                            color: 'yellow',
                            '&:focus': {
                                borderColor: 'gold',
                                color: 'gold',
                            },
                            '&:hover': {
                                borderColor: 'goldenrod',
                                color: 'goldenrod',
                            },
                        },
                    },
                }}
            />
            <Link href={`/chat/${roomName}/${username}`}>
                <Button variant="contained" color="primary" className={styles.joinButton}>
                    Join Chat
                </Button>
            </Link>
        </div>
    );
};

export default HomePage;