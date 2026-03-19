import React, { useState } from 'react';
import { Circle, CheckCircle2, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TaskItem({ task, onToggle, onClick, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);

  const handleSave = (e) => {
    e.stopPropagation();
    if (editValue.trim() && editValue !== task.text) {
      onEdit(task.id, editValue);
    }
    setIsEditing(false);
  };

  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} onClick={() => !isEditing && onClick(task)} className="group flex items-center justify-between p-4 mb-2 bg-white dark:bg-[#1c1c1e] rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-[#2c2c2e] shadow-sm">
      <div className="flex items-center gap-3 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-300"><GripVertical size={18} /></div>
        <button onClick={(e) => { e.stopPropagation(); onToggle(task); }}>
          {task.is_done ? <CheckCircle2 className="text-[#007aff]" size={24} /> : <Circle className="text-gray-300" size={24} />}
        </button>
        {isEditing ? (
          <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={handleSave} className="bg-transparent outline-none flex-1 border-b border-[#007aff] text-[#1c1c1e] dark:text-white" onClick={(e) => e.stopPropagation()}/>
        ) : (
          <span className={`flex-1 ${task.is_done ? 'line-through text-gray-400' : ''}`}>{task.text}</span>
        )}
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="text-gray-400 hover:text-[#007aff]"><Pencil size={18} /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
      </div>
    </div>
  );
}