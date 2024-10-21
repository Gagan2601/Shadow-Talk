import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import { Lock, LockOpen } from '@mui/icons-material';
import { socket } from '../../socket';
import styles from "../styles/Home.module.css"

interface RoomInfo {
  name: string;
  isPrivate: boolean;
  userCount: number;
}

export const AllRooms: React.FC = () => {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    socket.emit('get-rooms');

    socket.on('update-rooms', (updatedRooms: RoomInfo[]) => {
      setRooms(updatedRooms);
    });

    socket.on('join-error', (message: string) => {
      setError(message);
    });

    return () => {
      socket.off('update-rooms');
      socket.off('join-error');
    };
  }, [rooms]);

  const handleJoinRoom = (roomName: string, isPrivate: boolean) => {
    setSelectedRoom(roomName);
    if (isPrivate) {
      setPassword('');
      setError('');
      setOpenPasswordDialog(true);
    } else {
      navigateToRoom(roomName);
    }
  };

  const navigateToRoom = (roomName: string, password?: string) => {
    let queryParams = '';
    if (password) {
      localStorage.setItem(`room_password_${roomName}`, password);
      queryParams = `?password=${encodeURIComponent(password)}`;
    }
    window.location.href = `/chat/${roomName}${queryParams}`;
  };

  const handlePasswordSubmit = () => {
    if (selectedRoom && password) {
      // First verify if password is correct
      socket.emit('verify-room-password', {
        room: selectedRoom,
        password: password
      });

      socket.once('password-verify-result', (result: { success: boolean, message?: string }) => {
        if (result.success) {
          navigateToRoom(selectedRoom, password);
          setOpenPasswordDialog(false);
          setPassword('');
          setError('');
        } else {
          setError(result.message || 'Incorrect password');
        }
      });
    }
  };

  const handleDialogClose = () => {
    setOpenPasswordDialog(false);
    setPassword('');
    setError('');
    setSelectedRoom(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <Card key={room.name} className="bg-gray-800 text-white">
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <Typography variant="h6">{room.name}</Typography>
              <Chip
                icon={room.isPrivate ? <Lock /> : <LockOpen />}
                label={room.isPrivate ? "Private" : "Public"}
                color={room.isPrivate ? "secondary" : "primary"}
                size="small"
              />
            </div>
            <Typography variant="body2" className="mb-2">
              Users Online: {room.userCount}
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleJoinRoom(room.name, room.isPrivate)}
              className={styles.availableRoomsButton}
            >
              Join Room
            </Button>
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={openPasswordDialog}
        onClose={handleDialogClose}
        PaperProps={{
          style: { backgroundColor: '#000000', color: '#ffffff' },
          component: 'form',
          onSubmit: (e: React.FormEvent) => {
            e.preventDefault();
            handlePasswordSubmit();
          }
        }}
      >
        <DialogTitle style={{ color: '#ffffff' }}>Enter Room Password</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" className="mb-2">
              {error}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            InputLabelProps={{ style: { color: '#ffffff' } }} // Change label color
            InputProps={{
              style: {
                color: '#ffffff',
              }, // Change input text color
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#ffffff', // White border for the fieldset
                },
                '&:hover fieldset': {
                  borderColor: '#ffffff', // White border on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffffff', // White border when focused
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} style={{ color: '#ffffff' }}>Cancel</Button>
          <Button type="submit" style={{ color: '#ffffff' }}>Join</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};