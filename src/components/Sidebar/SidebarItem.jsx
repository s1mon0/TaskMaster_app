import React, { useState } from 'react';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SidebarItem({ list, isActive, onClick, onDelete, onEdit, taskCount = 0, IconComponent }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: list.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(list.name);

  const handleSave = (e) => {
    e?.stopPropagation();
    if (editValue.trim() && editValue !== list.name) onEdit(list.id, editValue.trim());
    setIsEditing(false);
  };

  const style = {
    transform: isDragging
      ? `${CSS.Translate.toString(transform)} scale(1.02)`
      : CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : 'transform 120ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.45 : 1,
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : undefined,
    position: 'relative',
    zIndex: isDragging ? 999 : 'auto',
    // touch-action pan-y = scroll funguje, drag kit si ho vezme jen při grip
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isEditing && onClick(list.id)}
      // FIX: odstraněny hover: třídy z Tailwindu – šedivěly při touch scrollu.
      // Hover efekt je řešen třídou list-item-hover v index.css přes @media (hover:hover)
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
        isActive
          ? 'bg-[#007aff] text-white shadow-sm'
          : 'list-item-hover text-gray-700 dark:text-gray-300'
      }`}
    >
      {/* Grip – touch-none POUZE zde, ne na celém řádku → scroll funguje */}
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing touch-none p-0.5 shrink-0 transition-opacity
          opacity-100 md:opacity-0 md:group-hover:opacity-100
          ${isActive ? 'text-white/50' : 'text-gray-300 dark:text-gray-600'}`}
      >
        <GripVertical size={14} />
      </div>

      {/* Ikona seznamu */}
      {IconComponent && (
        <div className={`shrink-0 ${isActive ? 'text-white' : 'text-[#007aff] dark:text-[#0a84ff]'}`}>
          <IconComponent size={18} strokeWidth={2.5} />
        </div>
      )}

      {/* Název */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave(e);
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className={`bg-transparent border-b outline-none w-full text-[15px] ${
              isActive ? 'text-white border-white/50' : 'text-[#1c1c1e] dark:text-white border-[#007aff]'
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`truncate text-[15px] font-medium block ${isActive ? 'text-white' : ''}`}>
            {list.name}
          </span>
        )}
      </div>

      {/* Počet nedokončených tasků */}
      {taskCount > 0 && !isEditing && (
        <span className={`text-[12px] font-semibold shrink-0 min-w-[18px] text-center ${
          isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
        }`}>
          {taskCount}
        </span>
      )}

      {/* Edit/Delete – jen na desktopu při hover, na mobilu při group-hover (tap) */}
      <div className={`flex items-center gap-0.5 transition-opacity shrink-0
        opacity-0 group-hover:opacity-100
        ${isActive ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 transition-all"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
          className="p-1 rounded-md hover:bg-red-500/20 hover:text-red-500 active:scale-90 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}