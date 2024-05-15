// pages/index.js or pages/home.js
'use client'
import * as React from 'react';
import { TextField, Button } from '@mui/material';
import styles from './styles/Home.module.css';
import { Stars } from './components/ChatBackground';
import TopLoader from './components/TopLoader';
import CustomSnackbar from './components/CustomSnackbar';

const checkIfRoomNameValid = (roomName: string): boolean => {
  return roomName.length >= 3 && roomName.length <= 10 && !roomName.includes(' ');
};

export default function Home() {
  const [roomName, setRoomName] = React.useState('');
  const [isRoomNameValid, setIsRoomNameValid] = React.useState(false);
  const [hasInteractedWithRoomName, setHasInteractedWithRoomName] = React.useState(false);
  const [openToast, setOpenToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleRoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRoomName = event.target.value;
    setRoomName(newRoomName);
    setIsRoomNameValid(checkIfRoomNameValid(newRoomName));
    setHasInteractedWithRoomName(true);
  };

  const handleJoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isRoomNameValid) {
      setToastMessage('Room name must be at least 3 characters long with no spaces');
      setOpenToast(true);
    } else {
      setLoading(true);
      setTimeout(() => {
        window.location.href = `/chat/${roomName}`;
      }, 1000);
    }
  };

  const stars = React.useMemo(() => {
    return (
      <div className="w-full absolute inset-0 h-screen">
        <Stars
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
    );
  }, []);

  return (
    <>
      {stars}
      <TopLoader isLoading={loading} />
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
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              borderColor: 'white',
              borderRadius: '10px',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
              '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: 'red',
              },
            },
          }}
          InputLabelProps={{
            style: { color: 'white' }
          }}
        />
        <Button
          variant="contained"
          className={styles.joinButton}
          onClick={handleJoinClick}
        >
          Join Chat
        </Button>
      </div>
      <CustomSnackbar open={openToast} message={toastMessage} onClose={() => setOpenToast(false)} />
    </>
  );
}
