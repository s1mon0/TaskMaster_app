import React, { useState } from 'react';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SidebarItem({ list, isActive, onClick, onDelete, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(list.name);

  const handleSave = (e) => {
    e?.stopPropagation();
    if (editValue.trim() && editValue !== list.name) {
      onEdit(list.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : 'transform 120ms cubic-bezier(0.25, 1, 0.5, 1), opacity 120ms ease',
    opacity: isDragging ? 0.45 : 1,
    scale: isDragging ? '1.02' : '1',
    zIndex: isDragging ? 999 : undefined,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isEditing && onClick(list.id)}
      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
        isActive
          ? 'bg-[#007aff] text-white'
          : 'hover:bg-gray-200/60 dark:hover:bg-[#2c2c2e]'
      }`}
    >
      <div className="flex items-center flex-1 overflow-hidden">
        {/* ✅ FIX: Grip handle vždy viditelný na mobilu (hover nefunguje na touch)
            touch-none je nutné pro správný drag na iOS */}
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing touch-none mr-1.5 p-1 -ml-1 transition-opacity
            opacity-100 md:opacity-0 md:group-hover:opacity-100
            ${isActive ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <GripVertical size={16} />
        </div>

        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave(e)}
            className={`bg-transparent border-b outline-none w-full text-base ${
              isActive
                ? 'text-white border-white/50'
                : 'text-[#1c1c1e] dark:text-white border-[#007aff]'
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{list.name}</span>
        )}
      </div>

      {/* ✅ FIX: Tlačítka vždy viditelná na mobilu */}
      <div
        className={`flex items-center gap-1 transition-opacity
          opacity-100 md:opacity-0 md:group-hover:opacity-100
          ${isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="p-1 hover:text-[#007aff] active:scale-90 transition-transform"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
          className="p-1 hover:text-red-500 active:scale-90 transition-transform"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}