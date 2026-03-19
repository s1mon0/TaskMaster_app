import React, { useState } from 'react';
import { GripVertical, Check, X, Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SidebarItem({ list, isActive, onClick, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(list.name);
  
  const style = { 
    transform: CSS.Translate.toString(transform), 
    transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)', 
    zIndex: isDragging ? 100 : 1, 
    opacity: isDragging ? 0.8 : 1,
    position: 'relative'
  };

  const handleSave = (e) => {
    e.stopPropagation();
    if (editValue.trim() && editValue !== list.name) {
      onEdit(list.id, editValue);
    } else {
      setEditValue(list.name);
    }
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} onClick={() => !isEditing && onClick(list.id)} className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${isDragging ? 'bg-white dark:bg-[#2c2c2e] shadow-xl border border-gray-200 dark:border-gray-700' : isActive ? 'bg-[#007aff] text-white shadow-sm' : 'hover:bg-gray-200/60 dark:hover:bg-[#2c2c2e] active:bg-gray-300 dark:active:bg-[#3a3a3c]'}`}>
      <div className="flex items-center flex-1 overflow-hidden">
        <div {...attributes} {...listeners} className={`cursor-grab active:cursor-grabbing touch-none mr-1.5 p-1 -ml-1 transition-opacity opacity-0 group-hover:opacity-100 ${isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>
          <GripVertical size={16} />
        </div>
        
        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(e); if (e.key === 'Escape') { setIsEditing(false); setEditValue(list.name); } }}
            onClick={(e) => e.stopPropagation()}
            className={`flex-1 bg-transparent border-b outline-none text-[15px] font-medium py-0.5 ${isActive ? 'border-white/50 text-white' : 'border-[#007aff] text-[#1c1c1e] dark:text-[#f5f5f7]'}`}
          />
        ) : (
          <span className="text-[15px] font-medium truncate pr-2 flex-1">{list.name}</span>
        )}
      </div>

      <div className="flex items-center flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <>
            <button onClick={handleSave} className={`p-1.5 rounded-lg ${isActive ? 'text-white hover:bg-white/20' : 'text-[#34c759] hover:bg-gray-200 dark:hover:bg-gray-700'}`}><Check size={16} /></button>
            <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditValue(list.name); }} className={`p-1.5 rounded-lg ${isActive ? 'text-white/80 hover:bg-white/20' : 'text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}><X size={16} /></button>
          </>
        ) : (
          <>
            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className={`p-1.5 rounded-lg mr-0.5 ${isActive ? 'text-white/80 hover:bg-white/20' : 'text-gray-400 hover:text-[#007aff] hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              <Pencil size={15} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(list.id, e); }} className={`p-1.5 rounded-lg ${isActive ? 'text-white/80 hover:bg-white/20' : 'text-gray-400 hover:text-[#ff3b30] hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}