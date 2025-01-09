import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  existingTags?: string[];
}

export default function TagInput({ value, onChange, placeholder, existingTags = [] }: TagInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setInput(inputValue);

    if (inputValue.trim()) {
      const filtered = existingTags
        .filter(tag => 
          tag.toLowerCase().includes(inputValue.toLowerCase()) && 
          !value.includes(tag)
        );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInput('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div className="min-h-[38px] flex flex-wrap gap-2 p-1 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-md focus-within:ring-2 focus-within:ring-[rgb(var(--color-primary-400))] focus-within:border-[rgb(var(--color-primary-400))]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-1 bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))] text-sm rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 p-1 bg-transparent text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-tertiary))] focus:ring-0 text-sm"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-[rgb(var(--color-bg-secondary))] shadow-lg rounded-md border border-[rgb(var(--color-border-primary))] max-h-48 overflow-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full text-left px-4 py-2 text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}