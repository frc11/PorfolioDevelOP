"use client"
import React from 'react';

export function VideoCard() {
    return (
        <video
            src="/video/Woman_engrossed_in_screen_delpmaspu_.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
        />
    )
}
