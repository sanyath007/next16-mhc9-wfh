"use client";

import { useContext } from "react";
import { OCRContext } from "../contexts/OCRContext";

export function useOCR() {
    const context = useContext(OCRContext);
    if (!context) {
        throw new Error("useOCR must be used within an OCRProvider");
    }
    return context;
}