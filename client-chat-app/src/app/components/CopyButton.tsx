"use client";

import React, { useState } from "react";
import { copyToClipboard } from "@/app/utils/copyToClipboard";

interface CopyURLButtonProps {
    className?: string;
}

export const CopyURLButton: React.FC<CopyURLButtonProps> = ({ className }) => {
    const [buttonText, setButtonText] = useState<string>("Copy Room Link");

    const handleCopyToClipboard = async () => {
        try {
            await copyToClipboard();
            console.log("Success");
            setButtonText("Copied Successfully!");
            setTimeout(() => {
                setButtonText("Copy Room Link");
            }, 3000);
        } catch (err) {
            setButtonText("Unable to copy");
            setTimeout(() => {
                setButtonText("Copy Room Link");
            }, 3000);
        }
    };

    return (
        <button
            onClick={handleCopyToClipboard}
            className={className}
        >
            {buttonText}
        </button>
    );
};