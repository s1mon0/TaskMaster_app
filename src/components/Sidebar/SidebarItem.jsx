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
    transform: isDragging ? `${CSS.Translate.toString(transform)} scale(1.02)` : CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : 'transform 120ms cubic-bezier(0.25, 1, 0.5, 1), opacity 120ms ease',
    opacity: isDragging ? 0.45 : 1,
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : undefined,
    position: 'relative',
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isEditing && onClick(list.id)}
      // ZMĚNA ZDE: Na mobilu větší px-4 a py-3.5, na PC zpět na px-3 py-2.5
      className={`group flex items-center gap-3 md:gap-2 px-4 py-3.5 md:px-3 md:py-2.5 rounded-2xl md:rounded-xl cursor-pointer transition-all ${
        isActive
          ? 'bg-[#007aff] text-white shadow-sm'
          : 'hover:bg-white dark:hover:bg-[#1c1c1e] text-gray-700 dark:text-gray-300'
      }`}
    >
      {/* Grip */}
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing touch-none p-0.5 shrink-0 transition-opacity
          opacity-100 md:opacity-0 md:group-hover:opacity-100
          ${isActive ? 'text-white/50' : 'text-gray-300 dark:text-gray-600'}`}
      >
        <GripVertical size={14} />
      </div>

      {/* Čistá Lucide Ikona - na mobilu o něco větší */}
      <div className={`shrink-0 ${isActive ? 'text-white' : 'text-[#007aff] dark:text-[#0a84ff]'}`}>
        {IconComponent && <IconComponent size={20} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5} />}
      </div>

      {/* Název - na mobilu text-[17px], na počítači text-[15px] */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(e); if (e.key === 'Escape') setIsEditing(false); }}
            className={`bg-transparent border-b outline-none w-full text-[15px] ${
              isActive ? 'text-white border-white/50' : 'text-[#1c1c1e] dark:text-white border-[#007aff]'
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`truncate text-[17px] md:text-[15px] font-medium block ${isActive ? 'text-white' : ''}`}>
            {list.name}
          </span>
        )}
      </div>

      {/* Počet nedokončených tasků */}
      {taskCount > 0 && !isEditing && (
        <span className={`text-[12px] font-semibold shrink-0 min-w-[20px] text-center ${
          isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
        }`}>
          {taskCount}
        </span>
      )}

      {/* Edit/Delete — při hover */}
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