'use client'
import * as React from 'react';
import { TextField, Button, Switch, FormControlLabel } from '@mui/material';
import styles from './styles/Home.module.css';
import { Stars } from './components/ChatBackground';
import TopLoader from './components/TopLoader';
import CustomSnackbar from './components/CustomSnackbar';

const checkIfRoomNameValid = (roomName: string): boolean => {
  return roomName.length >= 3 && roomName.length <= 10 && !roomName.includes(' ');
};

export default function Home() {
  const [roomName, setRoomName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isRoomNameValid, setIsRoomNameValid] = React.useState(false);
  const [hasInteractedWithRoomName, setHasInteractedWithRoomName] = React.useState(false);
  const [openToast, setOpenToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isPrivateRoom, setIsPrivateRoom] = React.useState(false);

  const handleRoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRoomName = event.target.value;
    setRoomName(newRoomName);
    setIsRoomNameValid(checkIfRoomNameValid(newRoomName));
    setHasInteractedWithRoomName(true);
  };

  const handleJoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isRoomNameValid) {
      setToastMessage('Room name must be at least 3 characters long with no spaces');
      setOpenToast(true);
      return;
    }
    handleRoomJoin();

  };

  const handleRoomJoin = () => {
    setLoading(true);
    const queryParams = isPrivateRoom ? `?password=${encodeURIComponent(password)}` : '';
    setTimeout(() => {
      window.location.href = `/chat/${roomName}${queryParams}`;
    }, 1000);
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
          Join a chat room or create a private one.
        </p>
        <div className="flex flex-col items-center mb-4 w-full">
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
          {isPrivateRoom && (
            <TextField
              className={`${styles.textField1} customTextField`}
              label="Enter Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          )}

          <div className="flex items-center gap-2 mb-4">
            <FormControlLabel
              className={`${styles.switch} customTextField`}
              control={
                <Switch
                  checked={isPrivateRoom}
                  onChange={(e) => setIsPrivateRoom(e.target.checked)}
                  sx={{
                    width: 42,
                    height: 26,
                    padding: 0,
                    '& .MuiSwitch-switchBase': {
                      padding: 0,
                      '&.Mui-checked': {
                        transform: 'translateX(16px)',
                        color: '#fff',
                        '& + .MuiSwitch-track': {
                          backgroundColor: '#4CAF50',
                          opacity: 1,
                          borderRadius: '13px',
                        },
                      },
                    },
                    '& .MuiSwitch-thumb': {
                      boxSizing: 'border-box',
                      width: 25,
                      height: 25,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 13,
                      backgroundColor: 'transparent',
                      opacity: 1,
                      border: '1px solid grey',
                    },
                  }}
                />
              }
              label="Private Room"
              labelPlacement="end"
              sx={{
                '& .MuiTypography-root': {
                  color: 'white',
                  marginLeft: '8px',
                },
              }}
            />
          </div>
          <div className="flex-row items-center">
            <Button
              variant="contained"
              className={styles.joinButton}
              onClick={handleJoinClick}
              style={{ marginTop: '1rem', marginRight: '1rem' }}
            >
              Join Chat
            </Button>
            <Button
              variant="outlined"
              className={styles.availableRoomsButton}
              style={{ marginTop: '1rem' }}
              onClick={() => window.location.href = '/rooms'}
            >
              Available Rooms
            </Button>
          </div>
        </div>

      </div>
      <CustomSnackbar open={openToast} message={toastMessage} onClose={() => setOpenToast(false)} />
    </>
  );
}
