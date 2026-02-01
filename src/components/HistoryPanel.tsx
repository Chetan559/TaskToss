import { Trash2 } from 'lucide-react';
import { Button } from './Button';

interface HistoryItem {
  id: string;
  content: string;
  timestamp: number;
}

interface HistoryPanelProps {
  title: string;
  items: HistoryItem[];
  onClear: () => void;
  emptyMessage?: string;
}

export const HistoryPanel = ({
  title,
  items,
  onClear,
  emptyMessage = 'No history yet'
}: HistoryPanelProps) => {
  if (items.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
        <Button variant="ghost" onClick={onClear} className="p-1">
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="max-h-64 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div
              key={item.id}
              className="px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm text-gray-800">{item.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
