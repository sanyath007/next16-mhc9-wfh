import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/tailwindcss';

interface Option {
    value: string;
    label: string;
}

interface TagInputProps {
    options: Option[];
    value: string[]; // Array of selected values
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
    error?: string;
    disabled?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
    options,
    value = [],
    onChange,
    placeholder = 'เลือก...',
    className = '',
    error,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (optionValue: string) => {
        if (disabled) return;
        
        const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
        
        onChange(newValue);
    };

    const removeTag = (e: React.MouseEvent, tagValue: string) => {
        e.stopPropagation();
        if (disabled) return;
        onChange(value.filter((v) => v !== tagValue));
    };

    const handleAddCustomTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!value.includes(inputValue.trim())) {
                onChange([...value, inputValue.trim()]);
            }
            setInputValue('');
        }
    };

    const filteredOptions = options.filter(opt => 
        !value.includes(opt.value) && 
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "min-h-[42px] w-full px-2 py-1 border rounded-lg flex flex-wrap gap-2 items-center transition-all cursor-pointer",
                    disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white hover:border-teal-400",
                    isOpen ? "ring-2 ring-teal-500/20 border-teal-500 shadow-sm" : "border-gray-300",
                    error ? "border-rose-500 ring-rose-500/20" : ""
                )}
            >
                {value.length === 0 && (
                    <span className="text-sm text-gray-400 pl-2">{placeholder}</span>
                )}
                {value.length > 0 && value.map((v) => {
                    const label = options.find(opt => opt.value === v)?.label || v;

                    return (
                        <span
                            key={v}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg border border-teal-100 animate-in fade-in zoom-in-95 duration-200"
                        >
                            {label}
                            <button
                                type="button"
                                onClick={(e) => removeTag(e, v)}
                                className="hover:text-rose-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    );
                })}

                <input
                    type="hidden"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    placeholder={value.length === 0 ? placeholder : ""}
                    disabled={disabled}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />

                <div className="ml-auto pl-2 flex items-center gap-1 text-gray-400">
                    <ChevronDown size={18} className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")} />
                </div>
            </div>

            {/* Dropdown Options */}
            {isOpen && (filteredOptions.length > 0 || inputValue.trim()) && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto py-1">
                        {filteredOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    toggleOption(option.value);
                                    setInputValue('');
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center justify-between"
                            >
                                {option.label}
                                {value.includes(option.value) && <Check size={16} className="text-teal-500" />}
                            </button>
                        ))}
                        
                        {inputValue.trim() && !options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase()) && !value.includes(inputValue.trim()) && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange([...value, inputValue.trim()]);
                                    setInputValue('');
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-teal-600 hover:bg-teal-50 font-medium transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} />
                                เพิ่ม "{inputValue}"
                            </button>
                        )}
                    </div>
                </div>
            )}
            
            {error && <p className="mt-1 text-xs text-rose-500 pl-1">{error}</p>}
        </div>
    );
};

export default TagInput;
