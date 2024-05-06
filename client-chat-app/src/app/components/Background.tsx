
'use client'
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import './Background.css'

const ParticlesBg = dynamic(() => import("particles-bg"), { ssr: false });
const Background = () => {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    return (
        <>
            <div className="background-container">
                {isClient && (
                    <ParticlesBg color="#ffffff" type="cobweb" bg={true} />
                )}
            </div>
        </>
    );
}

export default Background