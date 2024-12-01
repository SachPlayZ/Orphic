"use client";

import React from "react";
import DeFolioLogo from "../components/DeFolioLogo";
import { SpotlightBackground } from "../components/ui/evervault-card";

export default function Home() {
  return (
    <SpotlightBackground className="w-full min-h-screen bg-black group">
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <DeFolioLogo />
      </div>
    </SpotlightBackground>
  );
}
