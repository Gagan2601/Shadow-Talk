'use client'
import { FC, useMemo } from "react";
import { useEffect, useState } from "react";
import { socket } from "../../../socket";
import styles from "../../styles/Chat.module.css"
import { Stars } from "@/app/components/ChatBackground";
// import Loading from "@/app/components/Loader";
import { CopyURLButton } from "@/app/components/CopyButton";
import { Send as SendIcon } from '@mui/icons-material';

interface RoomName {
    params: {
        roomName: string;
    }
}

const Chat: FC<RoomName> = ({ params }) => {
    const room: string = params.roomName;
    const [username, setUsername] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [rateLimitCount, setRateLimitCount] = useState(0);
    const [userColors, setUserColors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const getUsername = () => {
            const user = window.prompt("Enter your username");
            if (user) {
                setUsername(user);
            }
        };
        getUsername();
    }, []);

    useEffect(() => {
        if (!userColors[username]) {
            const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
            setUserColors((prevUserColors) => ({ ...prevUserColors, [username]: randomColor }));
        }
    }, [username, userColors]);

    useEffect(() => {
        console.log("Joining room:", room);
        socket.emit("join-room", { room, username });
    }, [room, username])


    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected", socket.id);
            setLoading(false);
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
            setMessages((prevMessages) => [...prevMessages, { text: `${s} joined the room`, sender: "system" }]);
        });
        socket.on("user-left", (s: string) => {
            console.log(s, "left the room");
            setMessages((prevMessages) => [...prevMessages, { text: `${s} left the room`, sender: "system" }]);
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
            socket.off("disconnect");
            console.log("Chat component unmounted");
        };
    }, []);

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
        if (rateLimitCount < 10) {
            socket.emit("message", { sender: username, text: message, room });
            setMessage("");
            setRateLimitCount(rateLimitCount + 1);
        } else {
            alert("Rate limit exceeded. Please try again in 1 minute.");
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

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, onChange: (value: string) => void) => {
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
            window.history.back();
        }
    };

    return (
        <>
            {stars}
            <div className={styles.chatContainer}>
                <header className={styles.chatHeader}>
                    <h1 className={styles.roomName}>{room}</h1>
                    <div className="flex flex-col gap-4 md:flex-row-reverse">
                        <button className={styles.leaveButton} onClick={handleLeaveRoom}>Leave Room</button>
                        <CopyURLButton className={styles.copyButton} />
                    </div>
                </header>
                <div className={styles.messageList}>
                    {messages.map((m, i) => (
                        <div key={i} className={`${styles.message} `}>
                            <div
                                className={styles.sender}
                                style={{ color: userColors[m.sender] || "#fff" }}
                            >
                                {m.sender}:
                            </div>
                            <div className={styles.text}>{m.text}</div>

                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className={styles.chatForm}>
                    <h1 className={styles.username}>{username}</h1>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onPaste={(e) => {
                            handlePaste(e, setMessage);
                        }}
                        className={styles.chatInput}
                        placeholder="Type a message..."
                    />
                    <button type="submit" className={styles.sendButton}>
                        <SendIcon />
                    </button>
                </form>
            </div>
        </>
    );
};

export default Chat;