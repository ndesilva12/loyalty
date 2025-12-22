'use client';

import { useState } from 'react';
import { Type, Globe, User, FileText, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ObjectType } from '@/types';

interface BulkAddFormProps {
  onSubmit: (items: Array<{
    email: string | null;
    name: string;
    placeholderImageUrl: string;
    description: string | null;
    itemType: ObjectType;
    linkUrl: string | null;
    itemCategory: string | null;
  }>) => Promise<void>;
  onCancel: () => void;
  itemCategories?: string[];
}

export default function BulkAddForm({ onSubmit, onCancel, itemCategories = [] }: BulkAddFormProps) {
  const [itemType, setItemType] = useState<ObjectType | null>(null);
  const [itemCategory, setItemCategory] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsePreview, setParsePreview] = useState<Array<{ name: string; description?: string; image?: string; linkUrl?: string }>>([]);

  const exampleText = {
    text: `Apple, A popular fruit, https://example.com/apple.jpg
Banana, Yellow tropical fruit
Orange`,
    link: `https://example.com/page1, My Page Title, https://example.com/thumb1.jpg
https://example.com/page2, Another Page
https://example.com/page3`,
    user: `John Doe, Engineering Lead, https://example.com/john.jpg
Jane Smith, Product Manager
Bob Wilson`,
  };

  const parseInput = (text: string, type: ObjectType) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: Array<{ name: string; description?: string; image?: string; linkUrl?: string }> = [];

    for (const line of lines) {
      // Split by comma or semicolon
      const parts = line.split(/[,;]/).map(p => p.trim()).filter(p => p);

      if (parts.length === 0) continue;

      if (type === 'link') {
        // For links: URL, name (optional), image (optional)
        const linkUrl = parts[0];
        const name = parts[1] || linkUrl;
        const image = parts[2] || '';
        parsed.push({ name, linkUrl, image, description: '' });
      } else {
        // For text/user: name, description (optional), image (optional)
        const name = parts[0];
        const description = parts[1] || '';
        const image = parts[2] || '';
        parsed.push({ name, description, image });
      }
    }

    return parsed;
  };

  const handleTextChange = (text: string) => {
    setBulkText(text);
    if (itemType && text.trim()) {
      const preview = parseInput(text, itemType);
      setParsePreview(preview);
    } else {
      setParsePreview([]);
    }
  };

  const handleTypeChange = (type: ObjectType) => {
    setItemType(type);
    if (bulkText.trim()) {
      const preview = parseInput(bulkText, type);
      setParsePreview(preview);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!itemType) {
      setError('Please select an item type');
      return;
    }

    if (!bulkText.trim()) {
      setError('Please enter at least one item');
      return;
    }

    const parsed = parseInput(bulkText, itemType);
    if (parsed.length === 0) {
      setError('No valid items found. Check your format.');
      return;
    }

    setLoading(true);
    try {
      const items = parsed.map(item => ({
        email: null,
        name: item.name,
        placeholderImageUrl: item.image || '',
        description: item.description || null,
        itemType,
        linkUrl: item.linkUrl || null,
        itemCategory,
      }));

      await onSubmit(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm backdrop-blur-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Item Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Item Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('text')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all backdrop-blur-sm ${
              itemType === 'text'
                ? 'bg-lime-500/20 border-lime-500/50 text-lime-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <Type className="w-5 h-5" />
            <span className="text-xs font-medium">Text</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('link')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all backdrop-blur-sm ${
              itemType === 'link'
                ? 'bg-lime-500/20 border-lime-500/50 text-lime-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-medium">Link</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('user')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all backdrop-blur-sm ${
              itemType === 'user'
                ? 'bg-lime-500/20 border-lime-500/50 text-lime-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">User</span>
          </button>
        </div>
      </div>

      {/* Category Selector */}
      {itemType && itemCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setItemCategory(null)}
              className={`px-3 py-1.5 rounded-xl border transition-all backdrop-blur-sm text-xs ${
                itemCategory === null
                  ? 'bg-lime-500/20 border-lime-500/50 text-lime-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {itemCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setItemCategory(category)}
                className={`px-3 py-1.5 rounded-xl border transition-all backdrop-blur-sm text-xs ${
                  itemCategory === category
                    ? 'bg-lime-500/20 border-lime-500/50 text-lime-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Input */}
      {itemType && (
        <>
          <div className="border-t border-white/10 pt-4" />

          {/* Format Instructions */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400">
            <div className="flex items-center gap-2 mb-2 text-gray-300 font-medium">
              <FileText className="w-4 h-4" />
              Format: One item per line
            </div>
            {itemType === 'link' ? (
              <p>URL, Name (optional), Image URL (optional)</p>
            ) : (
              <p>Name, Description (optional), Image URL (optional)</p>
            )}
            <p className="mt-1 text-gray-500">
              Separate fields with comma (,) or semicolon (;)
            </p>
          </div>

          {/* Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Items
              </label>
              <button
                type="button"
                onClick={() => handleTextChange(exampleText[itemType])}
                className="text-xs text-lime-400 hover:text-lime-300 transition-colors"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`Enter items, one per line...\n\nExample:\n${exampleText[itemType]}`}
              rows={6}
              className="w-full px-3 py-2 border rounded-xl text-white bg-white/5 backdrop-blur-sm border-white/20 focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 placeholder:text-gray-600 font-mono text-sm resize-none"
            />
          </div>

          {/* Preview */}
          {parsePreview.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-300 mb-2">
                Preview ({parsePreview.length} items)
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-white/5 border border-white/10 rounded-xl">
                {parsePreview.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-4">{i + 1}.</span>
                    <span className="text-white font-medium truncate flex-1">{item.name}</span>
                    {item.description && (
                      <span className="text-gray-500 truncate max-w-[100px]">{item.description}</span>
                    )}
                    {item.image && (
                      <span className="text-lime-400/60 text-[10px]">+img</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={!itemType || !bulkText.trim()}
          className="flex-1"
        >
          Add {parsePreview.length > 0 ? `${parsePreview.length} Items` : 'Items'}
        </Button>
      </div>
    </form>
  );
}
