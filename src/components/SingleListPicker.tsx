import { useState, useEffect, useRef } from 'react';
import { Shuffle, RotateCcw, Download, Copy, Check } from 'lucide-react';
import { ListInput } from './ListInput';
import { Button } from './Button';
import { HistoryPanel } from './HistoryPanel';
import { pickRandom } from '../utils/randomizer';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface HistoryItem {
  id: string;
  content: string;
  timestamp: number;
}

export const SingleListPicker = () => {
  const [items, setItems] = useState<string[]>([]);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [currentPick, setCurrentPick] = useState<string>('');
  const [removeAfterPick, setRemoveAfterPick] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedCandidate, setAnimatedCandidate] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedItems = storage.load<string[]>(STORAGE_KEYS.SINGLE_LIST);
    const savedHistory = storage.load<HistoryItem[]>(STORAGE_KEYS.SINGLE_HISTORY);

    if (savedItems && savedItems.length > 0) {
      setItems(savedItems);
      setAvailableItems(savedItems);
    }

    if (savedHistory) {
      setHistory(savedHistory);
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      storage.save(STORAGE_KEYS.SINGLE_LIST, items);
    }
  }, [items]);

  useEffect(() => {
    storage.save(STORAGE_KEYS.SINGLE_HISTORY, history);
  }, [history]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const handleItemsChange = (newItems: string[]) => {
    setItems(newItems);
    setAvailableItems(newItems);
    setCurrentPick('');
  };

  const handlePick = () => {
    if (availableItems.length === 0 || isAnimating) return;

    const picked = pickRandom(availableItems);
    setIsAnimating(true);
    setCurrentPick('');
    setAnimatedCandidate('');

    let cycleCount = 0;
    let itemIndex = 0;
    const animationDuration = 1800;
    const startTime = Date.now();
    const cyclesPerSecond = 8;

    const cycle = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Ease-out: start fast, slow down
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);

      // Calculate speed: starts at ~8 items/sec, slows to ~1 item/sec
      const speed = cyclesPerSecond * (1 - easeOutProgress * 0.85);
      const targetCycles = (elapsed / 1000) * speed;

      if (Math.floor(targetCycles) > cycleCount) {
        cycleCount = Math.floor(targetCycles);
        itemIndex = (itemIndex + 1) % availableItems.length;
        setAnimatedCandidate(availableItems[itemIndex]);
      }

      if (progress < 1) {
        animationTimeoutRef.current = setTimeout(cycle, 16);
      } else {
        setAnimatedCandidate(picked);
        setCurrentPick(picked);

        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          content: picked,
          timestamp: Date.now(),
        };
        setHistory([historyItem, ...history]);

        if (removeAfterPick) {
          const newAvailable = availableItems.filter((item) => item !== picked);
          setAvailableItems(newAvailable);
        }

        setTimeout(() => {
          setAnimatedCandidate('');
          setIsAnimating(false);
        }, 500);
      }
    };

    cycle();
  };

  const handleReset = () => {
    setAvailableItems(items);
    setCurrentPick('');
  };

  const handleClearAll = () => {
    setItems([]);
    setAvailableItems([]);
    setCurrentPick('');
    setHistory([]);
    storage.remove(STORAGE_KEYS.SINGLE_LIST);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleExport = () => {
    const text = items.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-picker-list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    const text = items.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const canPick = availableItems.length >= 1;
  const canReset = availableItems.length < items.length || currentPick !== '';

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <ListInput
              label="Your List"
              placeholder="Enter items (comma-separated or line-by-line)&#10;e.g., Apple, Banana, Cherry"
              items={items}
              onChange={handleItemsChange}
              minItems={2}
            />

            {items.length > 0 && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-2 text-sm"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleExport}
                  className="flex items-center gap-2 text-sm"
                >
                  <Download size={16} />
                  Download
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Pick Options
                </label>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={removeAfterPick}
                    onChange={(e) => setRemoveAfterPick(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      removeAfterPick ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        removeAfterPick ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-700">
                  Remove item after pick
                </span>
              </label>

              {removeAfterPick && availableItems.length < items.length && (
                <p className="text-sm text-gray-600">
                  {availableItems.length} of {items.length} items remaining
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handlePick}
                  disabled={!canPick || isAnimating}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Shuffle size={18} />
                  Pick Random
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleReset}
                  disabled={!canReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset
                </Button>
              </div>

              <Button
                variant="danger"
                onClick={handleClearAll}
                disabled={items.length === 0}
                className="w-full"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 min-h-[200px] flex flex-col items-center justify-center">
            {!currentPick && !isAnimating && (
              <p className="text-gray-400 text-sm">
                No pick yet. Click "Pick Random" to get started.
              </p>
            )}

            {isAnimating && animatedCandidate && (
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-400 mb-3">
                  PICKING...
                </p>
                <p className="text-2xl font-bold text-blue-500 break-words transition-all duration-75 min-h-[3rem] flex items-center justify-center">
                  {animatedCandidate}
                </p>
              </div>
            )}

            {currentPick && !isAnimating && (
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500 mb-2">
                  PICKED
                </p>
                <p className="text-5xl font-bold text-blue-600 break-words animate-pulse min-h-[4rem] flex items-center justify-center">
                  {currentPick}
                </p>
                <div className="mt-4 w-32 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto animate-pulse" />
              </div>
            )}
          </div>

          <HistoryPanel
            title="Pick History"
            items={history}
            onClear={handleClearHistory}
            emptyMessage="Pick history will appear here"
          />
        </div>
      </div>
    </div>
  );
};
