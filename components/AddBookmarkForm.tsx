import React, { useState, useCallback } from 'react';
import { suggestTagsAndDescription } from '../services/geminiService';

interface AddBookmarkFormProps {
  onAdd: (url: string, title: string, description: string, tags: string[]) => void;
  onCancel: () => void;
}

export const AddBookmarkForm: React.FC<AddBookmarkFormProps> = ({ onAdd, onCancel }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAutoSuggest = useCallback(async () => {
    if (!url && !title) return;
    
    setIsAnalyzing(true);
    try {
      const result = await suggestTagsAndDescription(url, title, description);
      
      if (result.tags && result.tags.length > 0) {
        // Merge with existing tags, unique only
        const currentTags = tagsStr.split(' ').filter(t => t.trim() !== '');
        const newTags = Array.from(new Set([...currentTags, ...result.tags]));
        setTagsStr(newTags.join(' '));
      }
      
      if (result.suggestedDescription && !description) {
        setDescription(result.suggestedDescription);
      }
    } catch (e) {
      console.error("AI suggestion failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  }, [url, title, description, tagsStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsStr.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    onAdd(url, title, description, tags);
    // Reset form
    setUrl('');
    setTitle('');
    setDescription('');
    setTagsStr('');
  };

  return (
    <div className="bg-blue-50 p-5 mb-6 rounded-md border border-blue-100 shadow-sm">
      <h3 className="font-bold text-sm mb-4 text-blue-900 uppercase tracking-wide">Save a new bookmark</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-blue-800 mb-1.5">URL</label>
            <input 
              required
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white border border-blue-200 p-2 text-sm rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="https://..."
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-blue-800 mb-1.5">Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-blue-200 p-2 text-sm rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="Page Title"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-blue-800 mb-1.5">Description</label>
          <input 
            type="text" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border border-blue-200 p-2 text-sm rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="Notes or summary..."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-blue-800">Tags (space separated)</label>
            <button 
              type="button"
              onClick={handleAutoSuggest}
              disabled={isAnalyzing || (!url && !title)}
              className={`text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${isAnalyzing ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isAnalyzing ? 'Scanning page...' : '✨ Auto-suggest tags'}
            </button>
          </div>
          <input 
            type="text" 
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            className="w-full bg-white border border-blue-200 p-2 text-sm rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="tech news webdev..."
          />
        </div>

        <div className="flex gap-3 mt-2 pt-2 border-t border-blue-100">
          <button 
            type="submit" 
            className="bg-blue-600 text-white text-sm font-bold py-1.5 px-5 rounded shadow-sm hover:bg-blue-700 active:translate-y-0.5 transition-all"
          >
            Save
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-blue-500 text-sm hover:text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};