import React, { useState } from 'react';
import { GripVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SidebarItem({ list, isActive, onClick, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(list.name);

  const handleSave = (e) => {
    e.stopPropagation();
    if (editValue.trim() && editValue !== list.name) {
      onEdit(list.id, editValue);
    }
    setIsEditing(false);
  };

  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} onClick={() => !isEditing && onClick(list.id)} className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer ${isActive ? 'bg-[#007aff] text-white' : 'hover:bg-gray-200/60 dark:hover:bg-[#2c2c2e]'}`}>
      <div className="flex items-center flex-1 overflow-hidden">
        {/* OPRAVA: Pridané touch-none pre mobil a správny kurzor */}
        <div {...attributes} {...listeners} className={`cursor-grab active:cursor-grabbing touch-none mr-1.5 p-1 -ml-1 transition-opacity opacity-0 group-hover:opacity-100 ${isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>
          <GripVertical size={16} />
        </div>
        
        {isEditing ? (
          <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave(e)} className={`bg-transparent border-b outline-none w-full ${isActive ? 'text-white border-white/50' : 'text-[#1c1c1e] dark:text-white border-[#007aff]'}`} onClick={(e) => e.stopPropagation()}/>
        ) : (
          <span className="truncate">{list.name}</span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}><Pencil size={14} /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}