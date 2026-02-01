import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { parseListInput } from '../utils/randomizer';

interface ListInputProps {
  label: string;
  placeholder?: string;
  items: string[];
  onChange: (items: string[]) => void;
  minItems?: number;
}

export const ListInput = ({
  label,
  placeholder,
  items,
  onChange,
  minItems = 1
}: ListInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setInputValue(items.join('\n'));
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError('');

    const parsed = parseListInput(value);
    onChange(parsed);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
    setInputValue(newItems.join('\n'));
  };

  const handleClear = () => {
    setInputValue('');
    onChange([]);
  };

  const validateAndBlur = () => {
    if (items.length < minItems) {
      setError(`Please add at least ${minItems} item${minItems > 1 ? 's' : ''}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          {label}
          <span className="ml-2 text-xs font-normal text-gray-500">
            ({items.length} item{items.length !== 1 ? 's' : ''})
          </span>
        </label>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <textarea
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={validateAndBlur}
        placeholder={placeholder || 'Enter items (comma-separated or line-by-line)'}
        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm group"
            >
              <span>{item}</span>
              <button
                onClick={() => handleRemoveItem(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
