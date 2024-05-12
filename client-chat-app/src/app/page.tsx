'use client'
import * as React from 'react';
import { TextField, Button, Snackbar } from '@mui/material';
import Link from 'next/link';
import styles from './styles/Home.module.css';
import { Stars } from './components/ChatBackground';

const checkIfRoomNameValid = (roomName: string) => {
  return roomName.length >= 3 && roomName.length <= 10 && !roomName.includes(' ');
};

export default function Home() {
  const [roomName, setRoomName] = React.useState('');
  const [isRoomNameValid, setIsRoomNameValid] = React.useState(false);
  const [hasInteractedWithRoomName, setHasInteractedWithRoomName] = React.useState(false);
  const [openToast, setOpenToast] = React.useState(false)

  const handleRoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRoomName = event.target.value;
    setRoomName(newRoomName);
    setIsRoomNameValid(checkIfRoomNameValid(newRoomName));
    setHasInteractedWithRoomName(true);
  };

  const handleJoinClick = () => {
    if (!isRoomNameValid) {
      setOpenToast(true);
    }
  };

  const handleCloseToast = () => {
    setOpenToast(false);
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
        <Link href={isRoomNameValid ? `/chat/${roomName}` : ''}
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
}
