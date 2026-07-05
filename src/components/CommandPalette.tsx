import { useState, useEffect, useRef } from 'react';
import { Search, Settings, RefreshCw, Command, CornerDownLeft } from 'lucide-react';
import { SkillFile } from '../lib/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  skills: SkillFile[];
  onSelectSkill: (skill: SkillFile) => void;
  onRescan: () => void;
  onGoToSettings: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  skills,
  onSelectSkill,
  onRescan,
  onGoToSettings
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Toggle open shortcut listener
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setSearch('');
    }
  }, [isOpen]);

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(search.toLowerCase()) ||
    skill.description.toLowerCase().includes(search.toLowerCase()) ||
    skill.id.toLowerCase().includes(search.toLowerCase())
  );

  const items = [
    ...filteredSkills.map(s => ({
      type: 'skill' as const,
      id: s.id,
      label: s.name,
      sublabel: s.description,
      data: s
    })),
    { type: 'action' as const, id: 'rescan', label: 'Rescan Library', sublabel: 'Poll local directory for updates', icon: RefreshCw, action: onRescan },
    { type: 'action' as const, id: 'settings', label: 'Settings', sublabel: 'Configure paths and injection rules', icon: Settings, action: onGoToSettings }
  ];

  // Key event bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = items[selectedIndex];
        if (selected) {
          triggerItem(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, items]);

  // Scroll to active index
  useEffect(() => {
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const triggerItem = (item: typeof items[number]) => {
    if (item.type === 'skill') {
      onSelectSkill(item.data);
    } else if (item.type === 'action' && item.action) {
      item.action();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15%] p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-cyber-bg-dark border border-cyber-border-dark rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[380px] font-sans">
        {/* Search Header */}
        <div className="flex items-center gap-2 px-3.5 border-b border-cyber-border-dark bg-cyber-bg-dark">
          <Search className="size-4 text-cyber-text-muted-dark shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full h-11 bg-transparent border-0 outline-none text-cyber-text-primary-dark placeholder-cyber-text-muted-dark text-sm font-sans"
            placeholder="Type a command or search skills..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="flex items-center gap-1 border border-cyber-border-dark rounded bg-cyber-surface-dark px-1.5 py-0.5 text-[9px] text-cyber-text-muted-dark font-sans font-semibold">
            <Command className="size-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Scrollable List */}
        <div ref={listRef} className="overflow-y-auto flex-1 p-2 bg-cyber-bg-dark">
          {items.length === 0 ? (
            <div className="py-6 text-center text-xs text-cyber-text-muted-dark font-sans">
              No matching commands or skills found.
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {items.map((item, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    data-active={isActive}
                    onClick={() => triggerItem(item)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-cyber-blue text-white' 
                        : 'text-cyber-text-primary-dark hover:bg-cyber-surface-dark'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      {item.type === 'skill' ? (
                        <div className="flex items-center gap-1.5 overflow-hidden w-full">
                          <span className="font-semibold text-xs truncate shrink-0">{item.label}</span>
                          <span className={`text-[10px] truncate ${isActive ? 'text-white/70' : 'text-cyber-text-muted-dark'}`}>
                            {item.sublabel}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 font-sans">
                          {item.icon && <item.icon className="size-3.5" />}
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs">{item.label}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-1 opacity-80 text-[9px] font-sans font-semibold shrink-0 pl-2">
                        <span>Enter</span>
                        <CornerDownLeft className="size-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer shortcuts */}
        <div className="px-3.5 py-2.5 bg-cyber-surface-dark border-t border-cyber-border-dark flex items-center justify-between text-[9px] text-cyber-text-muted-dark font-sans font-medium">
          <div className="flex items-center gap-2">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
}
