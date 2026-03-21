import React, { useState } from 'react';
import { Circle, CheckCircle2, GripVertical, Pencil, Trash2, Calendar, AlignLeft } from 'lucide-react';
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

  // Logika pro termíny
  const todayString = new Date().toISOString().split('T')[0];
  const isOverdue = task.due_date && task.due_date < todayString && !task.is_done;
  const isToday = task.due_date === todayString && !task.is_done;

  return (
    <div ref={setNodeRef} style={style} onClick={() => !isEditing && onClick(task)} className="group flex items-center justify-between p-4 mb-2 bg-white dark:bg-[#1c1c1e] rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-[#2c2c2e] shadow-sm cursor-pointer transition-all">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        
        {/* Ikonka pro přesun (bez touch-none, protože to CodeGPT vyřešil chytřeji) */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 p-1 -ml-2">
          <GripVertical size={18} />
        </div>
        
        {/* Odškrtávací kolečko */}
        <button onClick={(e) => { e.stopPropagation(); onToggle(task); }} className="flex-shrink-0 transition-transform active:scale-90">
          {task.is_done ? (
            <CheckCircle2 className="text-[#007aff] fill-[#007aff]/10" size={26} />
          ) : (
            <Circle className={`group-hover:text-gray-400 transition-colors ${isOverdue ? 'text-[#ff3b30]/50 dark:text-[#ff453a]/50' : 'text-gray-300 dark:text-gray-600'}`} size={26} />
          )}
        </button>
        
        <div className="flex flex-col flex-1 justify-center min-w-0">
          {/* Hlavní text úkolu a editační pole */}
          <div className="flex items-start gap-2">
            {isEditing ? (
              <input 
                autoFocus 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)} 
                onBlur={handleSave} 
                onKeyDown={(e) => e.key === 'Enter' && handleSave(e)}
                className="bg-transparent outline-none flex-1 border-b border-[#007aff] text-[16px] text-[#1c1c1e] dark:text-white py-0.5" 
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={`text-[16px] sm:text-[17px] font-medium transition-all break-words whitespace-normal leading-snug flex-1 ${task.is_done ? 'line-through text-gray-400 dark:text-gray-600' : isOverdue ? 'text-[#ff3b30] dark:text-[#ff453a]' : 'text-[#1c1c1e] dark:text-[#f5f5f7]'}`}>
                {task.text}
              </span>
            )}
            {/* Barevný štítek (kolečko) */}
            {task.color && !isEditing && <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 shadow-sm" style={{ backgroundColor: task.color }}></div>}
          </div>

          {/* Zobrazení termínu a poznámky pod úkolem */}
          {(task.due_date || task.notes) && !isEditing && (
             <div className="flex items-center gap-3 mt-1.5 text-[13px] text-gray-400 dark:text-gray-500">
               {task.due_date && (
                 <span className={`flex items-center gap-1 ${isOverdue ? 'text-[#ff3b30] dark:text-[#ff453a] font-bold' : isToday ? 'text-[#ff9500] font-medium' : ''}`}>
                   <Calendar size={12}/> 
                   {isOverdue ? 'Zpožděno: ' : ''}{new Date(task.due_date).toLocaleDateString('cs-CZ')}
                 </span>
               )}
               {task.notes && <span className="flex items-center gap-1"><AlignLeft size={12}/> Poznámka</span>}
             </div>
          )}
        </div>
      </div>
      
      {/* Tlačítka pro editaci a smazání vpravo */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-2 rounded-xl text-gray-400 hover:text-[#007aff] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200"><Pencil size={18} /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-2 rounded-xl text-gray-400 hover:text-[#ff3b30] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200"><Trash2 size={18} /></button>
      </div>
    </div>
  );
}