'use client'
import { FC, useMemo } from "react";
import { useEffect, useState } from "react";
import { socket } from "../../../../socket";
import styles from "../../../styles/Chat.module.css"
import { Stars } from "@/app/components/ChatBackground";
import Loading from "@/app/components/Loader";

interface RoomName {
    params: {
        roomName: string;
        username: string;
    }
}

const Chat: FC<RoomName> = ({ params }) => {
    const room: string = params.roomName;
    const username: string = params.username;
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket.emit("join-room", room);
    }, [room]);
    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected", socket.id);
            setLoading(false);
        });
        socket.on("recieve-message", (data: { text: string; sender: string }) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });
        socket.on("welcome", (s: string) => {
            console.log(s);
        });
        socket.on("disconnect", () => {
            socket.disconnect();
        });
        return () => {
            socket.off("connect");
            socket.off("recieve-message");
            socket.off("welcome");
            socket.off("disconnect");
        };
    }, [room]);

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

    if (loading) {
        return <Loading />;
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        socket.emit("message", { sender: username, text: message, room });
        setMessage("");
    };

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


    return (
        <>
            {stars}
            <div className={styles.chatContainer}>
                <header className={styles.chatHeader}>
                    <h1 className={styles.roomName}>{room}</h1>
                </header>
                <div className={styles.messageList}>
                    {messages.map((m, i) => (
                        <div key={i} className={`${styles.message} ${m.sender === username ? styles.highlight : ''}`}>
                            <span className={styles.sender}>{m.sender}:</span>
                            <span className={styles.text}>{m.text}</span>
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
                        Send
                    </button>
                </form>
            </div>
        </>
    );
};

export default Chat;