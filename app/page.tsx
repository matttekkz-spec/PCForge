"use client";

import { useMemo, useState } from "react";

type Part = {
  name: string;
  price: number;
  category: string;
  brand: string;
  score?: number;
  power?: number;
  socket?: string;
  ram?: string;
};

const PARTS: Part[] = [
  // CPU
  { name: "Ryzen 5 7600", price: 159, category: "CPU", brand: "AMD", score: 76, power: 65, socket: "AM5" },
  { name: "Ryzen 7 7800X3D", price: 299, category: "CPU", brand: "AMD", score: 95, power: 120, socket: "AM5" },
  { name: "Ryzen 9 9950X3D", price: 549, category: "CPU", brand: "AMD", score: 100, power: 170, socket: "AM5" },
  { name: "Core i5-14600KF", price: 189, category: "CPU", brand: "Intel", score: 84, power: 181, socket: "LGA1700" },

  // GPU
  { name: "RTX 4060 8GB", price: 279, category: "GPU", brand: "NVIDIA", score: 70, power: 115 },
  { name: "RTX 5070 12GB", price: 549, category: "GPU", brand: "NVIDIA", score: 88, power: 250 },
  { name: "RX 7900 XT 20GB", price: 649, category: "GPU", brand: "AMD", score: 94, power: 315 },
  { name: "RTX 5080 16GB", price: 999, category: "GPU", brand: "NVIDIA", score: 100, power: 360 },

  // RAM
  { name: "16GB DDR5-6000", price: 55, category: "RAM", brand: "Crucial", ram: "DDR5" },
  { name: "32GB DDR5-6000 CL30", price: 95, category: "RAM", brand: "Crucial", ram: "DDR5" },
  { name: "64GB DDR5-6400", price: 175, category: "RAM", brand: "Crucial Pro", ram: "DDR5" },

  // Motherboards
  { name: "B650 Gaming WiFi", price: 139, category: "Motherboard", brand: "MSI", socket: "AM5", ram: "DDR5" },
  { name: "X870 AORUS Elite WiFi", price: 211, category: "Motherboard", brand: "Gigabyte", socket: "AM5", ram: "DDR5" },
  { name: "B760 Gaming WiFi", price: 145, category: "Motherboard", brand: "MSI", socket: "LGA1700", ram: "DDR5" },

  // Storage
  { name: "1TB NVMe SSD", price: 65, category: "Storage", brand: "Kingston" },
  { name: "2TB NVMe SSD", price: 110, category: "Storage", brand: "Netac" },

  // PSU
  { name: "650W 80+ Gold", price: 75, category: "PSU", brand: "Corsair", power: 650 },
  { name: "850W 80+ Gold", price: 105, category: "PSU", brand: "Corsair", power: 850 },
  { name: "1000W 80+ Gold", price: 149, category: "PSU", brand: "Corsair", power: 1000 },

  // Cooling
  { name: "Tower Air Cooler", price: 35, category: "Cooling", brand: "Thermalright" },
  { name: "240mm ARGB AIO", price: 99, category: "Cooling", brand: "Lian Li" },
  { name: "360mm ARGB AIO", price: 139, category: "Cooling", brand: "Lian Li" },

  // Case
  { name: "O11 Dynamic Mini", price: 99, category: "Case", brand: "Lian Li" },
  { name: "XT Pro ARGB", price: 79, category: "Case", brand: "Phanteks" },
];

const CATEGORIES = [
  "CPU",
  "GPU",
  "RAM",
  "Motherboard",
  "Storage",
  "PSU",
  "Cooling",
  "Case",
];

export default function PCForge() {
  const [selectedParts, setSelectedParts] = useState<Record<string, string>>({});

  // Get parts grouped by category
  const partsByCategory = useMemo(() => {
    const grouped: Record<string, Part[]> = {};
    CATEGORIES.forEach(cat => {
      grouped[cat] = PARTS.filter(p => p.category === cat);
    });
    return grouped;
  }, []);

  // Get currently selected parts
  const currentBuild = useMemo(() => {
    return CATEGORIES.map(cat => {
      const partName = selectedParts[cat];
      const part = PARTS.find(p => p.name === partName);
      return part;
    }).filter(Boolean) as Part[];
  }, [selectedParts]);

  // Calculate totals
  const { totalCost, totalPower, avgScore, warnings } = useMemo(() => {
    const cost = currentBuild.reduce((sum, p) => sum + p.price, 0);
    const power = currentBuild.reduce((sum, p) => sum + (p.power || 0), 0);
    const scores = currentBuild.filter(p => p.score).map(p => p.score!);
    const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(0) : "N/A";

    const warns: string[] = [];

    // Check socket compatibility
    const cpu = currentBuild.find(p => p.category === "CPU");
    const mobo = currentBuild.find(p => p.category === "Motherboard");
    if (cpu && mobo && cpu.socket !== mobo.socket) {
      warns.push("⚠️ CPU socket doesn't match motherboard");
    }

    // Check RAM compatibility
    if (mobo && currentBuild.some(p => p.category === "RAM")) {
      const ram = currentBuild.find(p => p.category === "RAM");
      if (mobo.ram !== ram?.ram) {
        warns.push("⚠️ RAM type doesn't match motherboard");
      }
    }

    // Check power supply
    const psu = currentBuild.find(p => p.category === "PSU");
    if (psu && power > psu.power! * 0.8) {
      warns.push(`⚠️ Power draw (${power}W) is high for ${psu.power}W PSU`);
    }

    return { totalCost: cost, totalPower: power, avgScore, warnings: warns };
  }, [currentBuild]);

  const handleSelectPart = (category: string, partName: string) => {
    setSelectedParts(prev => ({
      ...prev,
      [category]: partName
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">⚙️ PC Forge</h1>
          <p className="text-slate-400">Build your perfect PC</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Parts Selection */}
          <div className="lg:col-span-2 space-y-4">
            {CATEGORIES.map(category => (
              <div key={category} className="bg-slate-700 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 text-blue-400">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {partsByCategory[category].map(part => (
                    <button
                      key={part.name}
                      onClick={() => handleSelectPart(category, part.name)}
                      className={`p-3 rounded text-left transition-all ${
                        selectedParts[category] === part.name
                          ? "bg-blue-600 ring-2 ring-blue-400"
                          : "bg-slate-600 hover:bg-slate-500"
                      }`}
                    >
                      <div className="font-medium">{part.name}</div>
                      <div className="text-sm text-slate-300">{part.brand} • ${part.price}</div>
                      {part.score && (
                        <div className="text-xs text-yellow-400 mt-1">Score: {part.score}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Build Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-700 rounded-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">Build Summary</h3>

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="mb-4 space-y-2">
                  {warnings.map((warn, i) => (
                    <div key={i} className="text-sm text-yellow-300 bg-slate-600 p-2 rounded">
                      {warn}
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Parts */}
              <div className="mb-6 space-y-2">
                <h4 className="font-semibold text-slate-300 mb-3">Selected Parts:</h4>
                {CATEGORIES.map(cat => {
                  const part = currentBuild.find(p => p.category === cat);
                  return (
                    <div key={cat} className="text-sm">
                      <div className="text-slate-400">{cat}</div>
                      {part ? (
                        <div className="text-blue-300 font-medium">{part.name}</div>
                      ) : (
                        <div className="text-slate-500 italic">Not selected</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="border-t border-slate-600 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Cost:</span>
                  <span className="text-xl font-bold text-green-400">${totalCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Power Draw:</span>
                  <span className="font-medium">{totalPower}W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Avg Score:</span>
                  <span className="font-medium">{avgScore}</span>
                </div>
              </div>

              {/* Clear Build */}
              <button
                onClick={() => setSelectedParts({})}
                className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm font-medium"
              >
                Clear Build
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
