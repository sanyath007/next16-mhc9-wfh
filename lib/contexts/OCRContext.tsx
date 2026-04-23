"use client";

import { createContext, useState } from "react";

export const OCRContext = createContext<any | null>(null);

export const OCRProvider = ({ children }: { children: React.ReactNode }) => {
    const [ocrResult, setOcrResult] = useState<string>("");
    return (
        <OCRContext.Provider value={{ ocrResult, setOcrResult }}>
            {children}
        </OCRContext.Provider>
    )
}