import { useState, useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, Zap, Download, Copy, Check } from 'lucide-react';
import { ListInput } from './ListInput';
import { Button } from './Button';
import { HistoryPanel } from './HistoryPanel';
import { createPairs } from '../utils/randomizer';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface Pair {
  task: string;
  person: string;
}

interface HistoryItem {
  id: string;
  content: string;
  timestamp: number;
}

export const DualListMatcher = () => {
  const [listA, setListA] = useState<string[]>([]);
  const [listB, setListB] = useState<string[]>([]);
  const [labelA, setLabelA] = useState('Tasks');
  const [labelB, setLabelB] = useState('People');
  const [availableA, setAvailableA] = useState<string[]>([]);
  const [availableB, setAvailableB] = useState<string[]>([]);
  const [matches, setMatches] = useState<Pair[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animatedCandidateA, setAnimatedCandidateA] = useState<string>('');
  const [animatedCandidateB, setAnimatedCandidateB] = useState<string>('');
  const [matchProgress, setMatchProgress] = useState(0);
  const [matchTotal, setMatchTotal] = useState(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedListA = storage.load<string[]>(STORAGE_KEYS.DUAL_LIST_A);
    const savedListB = storage.load<string[]>(STORAGE_KEYS.DUAL_LIST_B);
    const savedHistory = storage.load<HistoryItem[]>(STORAGE_KEYS.DUAL_HISTORY);

    if (savedListA && savedListA.length > 0) {
      setListA(savedListA);
      setAvailableA(savedListA);
    }

    if (savedListB && savedListB.length > 0) {
      setListB(savedListB);
      setAvailableB(savedListB);
    }

    if (savedHistory) {
      setHistory(savedHistory);
    }
  }, []);

  useEffect(() => {
    if (listA.length > 0) {
      storage.save(STORAGE_KEYS.DUAL_LIST_A, listA);
    }
  }, [listA]);

  useEffect(() => {
    if (listB.length > 0) {
      storage.save(STORAGE_KEYS.DUAL_LIST_B, listB);
    }
  }, [listB]);

  useEffect(() => {
    storage.save(STORAGE_KEYS.DUAL_HISTORY, history);
  }, [history]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const handleListAChange = (newItems: string[]) => {
    setListA(newItems);
    setAvailableA(newItems);
    setMatches([]);
    setIsComplete(false);
  };

  const handleListBChange = (newItems: string[]) => {
    setListB(newItems);
    setAvailableB(newItems);
    setMatches([]);
    setIsComplete(false);
  };

  const handleMatchNext = () => {
    if (availableA.length === 0 || availableB.length === 0 || isAnimating) return;

    setIsAnimating(true);
    setAnimatedCandidateA('');
    setAnimatedCandidateB('');

    let cycleCountA = 0;
    let cycleCountB = 0;
    let itemIndexA = 0;
    let itemIndexB = 0;
    const animationDuration = 1500;
    const startTime = Date.now();
    const cyclesPerSecond = 8;

    const cycle = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const speed = cyclesPerSecond * (1 - easeOutProgress * 0.85);
      const targetCycles = (elapsed / 1000) * speed;

      if (Math.floor(targetCycles) > cycleCountA) {
        cycleCountA = Math.floor(targetCycles);
        itemIndexA = (itemIndexA + 1) % availableA.length;
        setAnimatedCandidateA(availableA[itemIndexA]);
      }

      if (Math.floor(targetCycles) > cycleCountB) {
        cycleCountB = Math.floor(targetCycles);
        itemIndexB = (itemIndexB + 1) % availableB.length;
        setAnimatedCandidateB(availableB[itemIndexB]);
      }

      if (progress < 1) {
        animationTimeoutRef.current = setTimeout(cycle, 16);
      } else {
        const pairs = createPairs([availableA[0]], [availableB[0]]);
        const newMatch = { task: pairs[0][0], person: pairs[0][1] };

        setAnimatedCandidateA(newMatch.task);
        setAnimatedCandidateB(newMatch.person);
        setMatches([...matches, newMatch]);

        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          content: `${newMatch.task} → ${newMatch.person}`,
          timestamp: Date.now(),
        };
        setHistory([historyItem, ...history]);

        const newAvailableA = availableA.slice(1);
        const newAvailableB = availableB.slice(1);

        setAvailableA(newAvailableA);
        setAvailableB(newAvailableB);

        if (newAvailableA.length === 0 || newAvailableB.length === 0) {
          setIsComplete(true);
        }

        setTimeout(() => {
          setAnimatedCandidateA('');
          setAnimatedCandidateB('');
          setIsAnimating(false);
        }, 500);
      }
    };

    cycle();
  };

  const handleMatchAll = () => {
    if (availableA.length === 0 || availableB.length === 0 || isAnimating) return;

    setIsAnimating(true);
    const pairs = createPairs(availableA, availableB);
    const newMatches = pairs.map(([task, person]) => ({ task, person }));
    setMatchTotal(newMatches.length);
    setMatchProgress(0);

    let currentIndex = 0;
    const animateNextMatch = () => {
      if (currentIndex < newMatches.length) {
        const match = newMatches[currentIndex];

        setMatches((prev) => [...prev, match]);
        const historyItem: HistoryItem = {
          id: `${Date.now()}-${currentIndex}`,
          content: `${match.task} → ${match.person}`,
          timestamp: Date.now() + currentIndex,
        };
        setHistory((prev) => [historyItem, ...prev]);

        setMatchProgress(currentIndex + 1);
        currentIndex++;

        animationTimeoutRef.current = setTimeout(animateNextMatch, 300);
      } else {
        setAvailableA([]);
        setAvailableB([]);
        setIsComplete(true);
        setMatchProgress(0);
        setMatchTotal(0);
        setIsAnimating(false);
      }
    };

    animateNextMatch();
  };

  const handleReset = () => {
    setAvailableA(listA);
    setAvailableB(listB);
    setMatches([]);
    setIsComplete(false);
  };

  const handleClearAll = () => {
    setListA([]);
    setListB([]);
    setAvailableA([]);
    setAvailableB([]);
    setMatches([]);
    setHistory([]);
    setIsComplete(false);
    storage.remove(STORAGE_KEYS.DUAL_LIST_A);
    storage.remove(STORAGE_KEYS.DUAL_LIST_B);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleExport = () => {
    const text = matches.map((m) => `${m.task} → ${m.person}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-assignments.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    const text = matches.map((m) => `${m.task} → ${m.person}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const canMatch = availableA.length > 0 && availableB.length > 0;
  const canReset = matches.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="mb-4">
              <input
                type="text"
                value={labelA}
                onChange={(e) => setLabelA(e.target.value)}
                className="text-sm font-semibold text-gray-700 border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 outline-none transition-colors px-1"
                placeholder="List A Label"
              />
            </div>
            <ListInput
              label={labelA}
              placeholder="Enter items (comma-separated or line-by-line)"
              items={listA}
              onChange={handleListAChange}
              minItems={1}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="mb-4">
              <input
                type="text"
                value={labelB}
                onChange={(e) => setLabelB(e.target.value)}
                className="text-sm font-semibold text-gray-700 border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 outline-none transition-colors px-1"
                placeholder="List B Label"
              />
            </div>
            <ListInput
              label={labelB}
              placeholder="Enter items (comma-separated or line-by-line)"
              items={listB}
              onChange={handleListBChange}
              minItems={1}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Matching Controls
                </label>
              </div>

              {canMatch && (
                <p className="text-sm text-gray-600">
                  {Math.min(availableA.length, availableB.length)} match
                  {Math.min(availableA.length, availableB.length) !== 1 ? 'es' : ''}{' '}
                  available
                </p>
              )}

              {isComplete && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Matching complete!
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleMatchNext}
                  disabled={!canMatch || isAnimating}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} />
                  Match Next
                </Button>

                <Button
                  onClick={handleMatchAll}
                  disabled={!canMatch || isAnimating}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  Match All
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  disabled={!canReset}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset
                </Button>

                <Button
                  variant="danger"
                  onClick={handleClearAll}
                  disabled={listA.length === 0 && listB.length === 0}
                  className="flex-1"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Current Matches ({matches.length})
              </h3>
              {matches.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-1 text-xs p-2"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleExport}
                    className="flex items-center gap-1 text-xs p-2"
                  >
                    <Download size={14} />
                  </Button>
                </div>
              )}
            </div>

            {isAnimating && (animatedCandidateA || animatedCandidateB) && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-blue-600 font-medium mb-1">
                      {labelA}
                    </p>
                    <p className="text-lg font-bold text-blue-700 break-words transition-all duration-75 min-h-[2rem] flex items-center justify-center">
                      {animatedCandidateA}
                    </p>
                  </div>
                  <ArrowRight size={20} className="text-blue-600 flex-shrink-0 animate-pulse" />
                  <div className="flex-1 text-center">
                    <p className="text-xs text-blue-600 font-medium mb-1">
                      {labelB}
                    </p>
                    <p className="text-lg font-bold text-blue-700 break-words transition-all duration-75 min-h-[2rem] flex items-center justify-center">
                      {animatedCandidateB}
                    </p>
                  </div>
                </div>
                {matchTotal > 0 && (
                  <div className="mt-3 text-center text-xs text-blue-600">
                    {matchProgress} / {matchTotal}
                  </div>
                )}
              </div>
            )}

            {matches.length === 0 && !isAnimating && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">
                  No matches yet. Click "Match Next" or "Match All" to start.
                </p>
              </div>
            )}

            {matches.length > 0 && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {matches.map((match, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg animate-[slideIn_0.3s_ease-out]"
                  >
                    <span className="text-sm text-gray-700 flex-1">
                      {match.task}
                    </span>
                    <ArrowRight size={16} className="text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-700 flex-1 text-right">
                      {match.person}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <HistoryPanel
            title="Match History"
            items={history}
            onClear={handleClearHistory}
            emptyMessage="Match history will appear here"
          />
        </div>
      </div>
    </div>
  );
};
