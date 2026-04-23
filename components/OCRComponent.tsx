"use client";

import React from 'react'
import Tesseract from 'tesseract.js'
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist/legacy/build/pdf.mjs';

GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

const OCRComponent = () => {
    const [ocrText, setOcrText] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [progress, setProgress] = React.useState<number>(0);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setIsLoading(true);
        setProgress(0);

        try {
            if (file.type === 'application/pdf') {
                const pdf = await getDocument(URL.createObjectURL(file)).promise;
                console.log(pdf);
                let fullText = '';

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({ canvasContext: context!, canvas, viewport }).promise;
                    const text = await Tesseract.recognize(canvas, 'tha+eng', {
                        logger: (m) => {
                            if (m.status === 'recognizing text') {
                                setProgress((prev) => prev + file.size / pdf.numPages);
                            }
                        }
                    });

                    fullText += `\n\n--- Page ${pageNum} ---\n\n${text.data.text}`;
                }

                setOcrText(fullText);
            } else {
                Tesseract.recognize(file, 'tha+eng', {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress((prev) => prev + file.size);
                        }
                    }
                }).then((result) => {
                    setOcrText(result.data.text);
                });
            }
        } catch (error) {
            console.error('Error during OCR processing:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="image/*, application/pdf"
                className=""
                onChange={handleFileChange}
            />

            {isLoading && <p>Processing... Progress: {progress} bytes</p>}
            {/* {isLoading && <div className="progress-bar" style={{ width: `${progress * 100}%` }}></div>} */}

            <pre className="mt-4 p-4 bg-gray-100 rounded">{ocrText}</pre>

            {!isLoading && ocrText && (
                <button
                    onClick={() => navigator.clipboard.writeText(ocrText)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Copy Text
                </button>
            )}
        </div>
    )
}

export default OCRComponent