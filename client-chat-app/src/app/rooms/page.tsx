// pages/rooms.tsx
'use client'
import React from 'react';
import { AllRooms } from '../components/AllRooms';
import { Stars } from '../components/ChatBackground';

export default function Rooms() {
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
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
            {stars}
            <div className="z-10 w-full max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-white mb-6">
                    Available Rooms
                </h1>
                <p className="text-gray-300 text-lg mb-8">
                    Join any existing room.
                </p>
                <div className="bg-gray-800 bg-opacity-70 p-6 rounded-lg shadow-lg">
                    <AllRooms />
                </div>
            </div>
        </div>
    );
}
