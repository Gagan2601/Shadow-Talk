'use client'
import { FC, useMemo } from "react";
import { useEffect, useState, useRef } from "react";
import { socket } from "../../../socket";
import styles from "../../styles/Chat.module.css"
import { Stars } from "@/app/components/ChatBackground";
import { CopyURLButton } from "@/app/components/CopyButton";
import { Send as SendIcon } from '@mui/icons-material';
import CustomSnackbar from "@/app/components/CustomSnackbar";

interface RoomName {
    params: {
        roomName: string;
    }
}

const Chat: FC<RoomName> = ({ params }) => {
    const room: string = params.roomName;
    const [username, setUsername] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<{ text: string; sender?: string; type?: string }[]>([]);
    const [rateLimitCount, setRateLimitCount] = useState(0);
    const [openToast, setOpenToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [lastMessageRef, setLastMessageRef] = useState<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const userColors = useRef<Map<string, string>>(new Map());
    const [onlineUsers, setOnlineUsers] = useState<{ username: string }[]>([]);

    useEffect(() => {
        const getUsername = () => {
            let user = window.prompt("Enter your username (no spaces, max 12 characters)");
            while (user && (user.includes(" ") || user.length > 12)) {
                user = window.prompt("Invalid username. Enter your username (no spaces, max 12 characters)");
            }
            if (user) {
                setUsername(user);
            } else {
                window.location.href = '/';
            }
        };
        getUsername();
    }, []);

    useEffect(() => {
        console.log("Joining room:", room);
        socket.emit("join-room", { room, username });
    }, [room, username])

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected", socket.id);
        });
        socket.on("receive-message", (data: { text: string; sender: string }) => {
            console.log("Received message:", data);
            setMessages((prevMessages) => [...prevMessages, data]);
        });
        socket.on("welcome", (s: string) => {
            console.log(s);
        });
        socket.on("user-joined", (s: string) => {
            console.log(s, "joined the room");
            setMessages((prevMessages) => [...prevMessages, { text: `${s} joined the room`, type: "join" }]);
        });
        socket.on("user-left", (s: string) => {
            console.log(s, "left the room");
            setMessages((prevMessages) => [...prevMessages, { text: `${s} left the room`, type: "leave" }]);
        });
        socket.on("update-users", (users: { username: string }[]) => {
            setOnlineUsers(users);
        });
        socket.on("disconnect", () => {
            socket.disconnect();
        });
        return () => {
            socket.off("connect");
            socket.off("receive-message");
            socket.off("welcome");
            socket.off("user-joined");
            socket.off("user-left");
            socket.off("update-users");
            socket.off("disconnect");
            console.log("Chat component unmounted");
        };
    }, []);

    useEffect(() => {
        if (lastMessageRef) {
            lastMessageRef.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const stars = useMemo(() => {
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!message.trim()) {
            setToastMessage('Message must not be empty');
            setOpenToast(true);
            return;
        }
        if (rateLimitCount < 10) {
            socket.emit("message", { sender: username, text: message, room });
            setMessage("");
            setTimeout(() => adjustTextareaHeight(true), 0);
            setRateLimitCount(rateLimitCount + 1);
        } else {
            setToastMessage('Rate limit exceeded. Please try again in 1 minute.');
            setOpenToast(true);
        }
    };

    useEffect(() => {
        const resetCounter = setInterval(() => {
            setRateLimitCount(0);
        }, 60 * 1000);

        return () => {
            clearInterval(resetCounter);
        };
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            const confirmationMessage = "Are you sure you want to leave the room?";
            event.returnValue = confirmationMessage;

            // Emit "leave-room" event to the server
            socket.emit("leave-room", { room, username });

            return confirmationMessage;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [room, username, socket]);

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>, onChange: (value: string) => void) => {
        event.preventDefault();

        const pastedText = event.clipboardData.getData("text/plain");
        const pastedTextWithFormatting = event.clipboardData.getData("text/html");

        if (pastedTextWithFormatting) {
            const div = document.createElement("div");
            div.innerHTML = pastedTextWithFormatting;
            const text = div.textContent || "";
            const formattedText = div.innerText || text;

            onChange(formattedText);
        } else {
            onChange(pastedText);
        }
    };

    const handleLeaveRoom = () => {
        if (window.confirm("Are you sure you want to leave the room?")) {
            socket.emit("leave-room", { room, username });
            window.location.href = '/';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    const adjustTextareaHeight = (reset: boolean = false) => {
        if (inputRef.current) {
            inputRef.current.style.height = reset ? "24px" : "auto";
            const newHeight = Math.min(inputRef.current.scrollHeight, 5 * 24); // 5 rows max, assuming 24px per row
            inputRef.current.style.height = `${newHeight}px`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        adjustTextareaHeight(e.target.value === "");
    };

    const getUserColor = (user: string) => {
        if (!userColors.current.has(user)) {
            const colors = ['#FF5733', '#33FF57', '#3357FF', '#F7DC6F', '#A569BD'];
            const color = colors[userColors.current.size % colors.length];
            userColors.current.set(user, color);
        }
        return userColors.current.get(user);
    };

    return (
        <>
            {stars}
            <div className={styles.chatContainer}>
                <header className={styles.chatHeader}>
                    <h1 className={styles.roomName}>{room}</h1>
                    <div className={styles.onlineUsers}>
                        <h2>Online Users:</h2>
                        <ul>
                            {onlineUsers.map((user, index) => (
                                <li key={index}>{user.username}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex gap-4 flex-row-reverse ">
                        <button className={styles.leaveButton} onClick={handleLeaveRoom}>Leave Room</button>
                        <CopyURLButton className={styles.copyButton} />
                    </div>
                </header>
                <div className={styles.messageList}>
                    {messages.map((m, i) => (
                        <div key={i} className={`${styles.message} ${m.type === 'join' ? styles.joinMessage : ''} ${m.type === 'leave' ? styles.leaveMessage : ''}`} ref={i === messages.length - 1 ? setLastMessageRef : null} >
                            {m.sender && (
                                <div className={styles.sender} style={{ color: getUserColor(m.sender) }}>
                                    {m.sender} :
                                </div>
                            )}
                            <div className={styles.text}>{m.text}</div>

                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className={styles.chatForm}>
                    <h1 className={styles.username}>{username}</h1>
                    <textarea
                        ref={inputRef}
                        value={message}
                        onChange={handleChange}
                        onPaste={(e) => handlePaste(e, setMessage)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        className={styles.chatInput}
                        placeholder="Type a message..."
                        style={{ resize: 'none', overflowY: 'auto' }}
                    />
                    <button type="submit" className={styles.sendButton}>
                        <SendIcon />
                    </button>
                </form>
            </div>
            <CustomSnackbar open={openToast} message={toastMessage} onClose={() => setOpenToast(false)} />
        </>
    );
};

export default Chat;