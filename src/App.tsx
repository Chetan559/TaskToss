import { useState } from "react";
import { Shuffle, Users } from "lucide-react";
import { SingleListPicker } from "./components/SingleListPicker";
import { DualListMatcher } from "./components/DualListMatcher";

type Mode = "single" | "dual";

function App() {
  const [mode, setMode] = useState<Mode>("single");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TaskToss - Random Picker
          </h1>
          <p className="text-gray-600">
            Pick random items or create task assignments effortlessly
          </p>
        </header>

        <div className="mb-6">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
            <button
              onClick={() => setMode("single")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                mode === "single"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Shuffle size={18} />
              Single List
            </button>
            <button
              onClick={() => setMode("dual")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                mode === "dual"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Users size={18} />
              Task Matching
            </button>
          </div>
        </div>

        <div className="animate-[fadeIn_0.3s_ease-in-out]">
          {mode === "single" ? <SingleListPicker /> : <DualListMatcher />}
        </div>
      </div>
    </div>
  );
}

export default App;
