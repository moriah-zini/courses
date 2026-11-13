import React, { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle2, ShoppingBag, Loader2 } from 'lucide-react';

// REPLACE THIS with your deployed Google Apps Script Web App URL
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwfCdVbzvN04RPoRmZ0LGDy6SNpJh6lqHMBU04QhOXuKu6FqA57ZZDYJSLeuPvqS9Pi/exec';

export default function SharedGroceryList() {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Load items when the app opens
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsSyncing(true);
    try {
      // ==========================================
      // REAL GOOGLE SHEETS INTEGRATION (GET)
      // ==========================================
      const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL);
      const data = await response.json();
      setItems(data);
      
      // --- MOCK DATA FOR NOW ---
      setTimeout(() => {
        setItems([
          { id: '1', text: 'Milk', checked: false },
          { id: '2', text: 'Eggs', checked: false },
          { id: '3', text: 'Apples', checked: true },
        ]);
        setIsSyncing(false);
      }, 800);
      
    } catch (error) {
      console.error("Error loading items:", error);
      setIsSyncing(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      checked: false
    };

    // Optimistic UI update: instantly show it on the screen
    setItems(prev => [...prev, newItem]);
    setInputValue('');
    setIsSyncing(true);

    try {
      // ==========================================
      // REAL GOOGLE SHEETS INTEGRATION (POST - ADD)
      // ==========================================
      await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: 'POST',
        // using no-cors or standard depending on your Apps Script setup
        body: JSON.stringify({ action: 'add', item: newItem })
      });
      
      // --- MOCK DELAY FOR NOW ---
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggle = async (id) => {
    const itemToToggle = items.find(i => i.id === id);
    if (!itemToToggle) return;

    const updatedItem = { ...itemToToggle, checked: !itemToToggle.checked };

    // Optimistic UI update: instantly toggle on the screen
    setItems(prev => prev.map(i => i.id === id ? updatedItem : i));
    setIsSyncing(true);

    try {
      // ==========================================
      // REAL GOOGLE SHEETS INTEGRATION (POST - UPDATE)
      // ==========================================
      await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'update', item: updatedItem })
      });
      
      // --- MOCK DELAY FOR NOW ---
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Separate the list into unchecked and checked
  const uncheckedItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-6 px-4 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-indigo-600">
            <ShoppingBag size={28} strokeWidth={2.5} />
            <h1 className="text-2xl font-bold text-slate-900">Our Groceries</h1>
          </div>
          {isSyncing && (
            <div className="flex items-center text-xs text-slate-400 space-x-1 bg-slate-200/50 px-2 py-1 rounded-full">
              <Loader2 size={14} className="animate-spin" />
              <span>Syncing</span>
            </div>
          )}
        </header>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new item..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 shadow-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center shrink-0"
          >
            <Plus size={24} />
          </button>
        </form>

        {/* Lists Container */}
        <div className="space-y-6">
          
          {/* Unchecked Items (To Buy) */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
              To Buy ({uncheckedItems.length})
            </h2>
            
            {uncheckedItems.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-slate-100 text-center text-slate-400 italic shadow-sm">
                Nothing left to buy!
              </div>
            ) : (
              <ul className="space-y-2">
                {uncheckedItems.map(item => (
                  <li 
                    key={item.id}
                    className="flex items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors cursor-pointer"
                    onClick={() => handleToggle(item.id)}
                  >
                    <div className="text-slate-300 mr-4">
                      <Circle size={24} />
                    </div>
                    <span className="text-slate-800 font-medium text-lg flex-1">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Checked Items (Completed) */}
          {checkedItems.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
                Completed ({checkedItems.length})
              </h2>
              <ul className="space-y-2">
                {checkedItems.map(item => (
                  <li 
                    key={item.id}
                    className="flex items-center p-3 bg-slate-100/50 rounded-xl border border-slate-100 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => handleToggle(item.id)}
                  >
                    <div className="text-emerald-500 mr-4">
                      <CheckCircle2 size={24} />
                    </div>
                    <span className="text-slate-500 line-through text-lg flex-1">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}