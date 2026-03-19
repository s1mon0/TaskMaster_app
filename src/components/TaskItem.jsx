import React, { useState } from 'react';
import { Circle, CheckCircle2, Calendar, AlignLeft, GripVertical, Check, X, Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TaskItem({ task, onToggle, onClick, onDelete, onEdit, isMyDay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);
  
  const style = { 
    transform: CSS.Translate.toString(transform), 
    transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)', 
    zIndex: isDragging ? 10 : 1, 
    opacity: isDragging ? 0.9 : 1,
    position: 'relative'
  };

  const todayString = new Date().toISOString().split('T')[0];
  const isOverdue = task.due_date && task.due_date < todayString && !task.is_done;
  const isToday = task.due_date === todayString && !task.is_done;

  const handleSave = (e) => {
    e.stopPropagation();
    if (editValue.trim() && editValue !== task.text) {
      onEdit(task.id, editValue);
    } else {
      setEditValue(task.text);
    }
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} onClick={() => !isEditing && onClick(task)} className={`group flex items-center justify-between p-3.5 sm:p-4 mb-2 bg-white dark:bg-[#1c1c1e] rounded-xl transition-all cursor-pointer border ${isDragging ? 'shadow-2xl border-gray-300 dark:border-gray-600 z-50' : 'shadow-sm border-transparent hover:border-gray-100 dark:hover:border-[#2c2c2e] hover:shadow-md'}`}>
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {!isMyDay && (
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 p-1 -ml-2 touch-none">
            <GripVertical size={18} />
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onToggle(task, e); }} className={`flex-shrink-0 focus:outline-none z-10 transition-transform active:scale-90 ${isMyDay ? 'ml-1' : ''}`}>
          {task.is_done ? <CheckCircle2 size={26} className="text-[#007aff] fill-[#007aff]/10 dark:fill-[#007aff]/20" /> : <Circle size={26} className={`group-hover:text-gray-400 dark:group-hover:text-gray-500 ${isOverdue ? 'text-[#ff3b30]/50 dark:text-[#ff453a]/50' : 'text-gray-300 dark:text-gray-600'}`} />}
        </button>
        <div className="flex flex-col flex-1 justify-center min-w-0">
          <div className="flex items-start gap-2">
            {isEditing ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(e); if (e.key === 'Escape') { setIsEditing(false); setEditValue(task.text); } }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent border-b border-[#007aff] outline-none text-[16px] sm:text-[17px] text-[#1c1c1e] dark:text-[#f5f5f7] py-0.5"
              />
            ) : (
              <span className={`text-[16px] sm:text-[17px] font-medium transition-all break-words whitespace-normal leading-snug ${task.is_done ? 'text-gray-400 dark:text-gray-600 line-through' : isOverdue ? 'text-[#ff3b30] dark:text-[#ff453a]' : 'text-[#1c1c1e] dark:text-[#f5f5f7]'}`}>
                {task.text}
              </span>
            )}
            {task.color && !isEditing && <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 shadow-sm" style={{ backgroundColor: task.color }}></div>}
          </div>
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

      <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="p-2 rounded-xl text-[#34c759] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200"><Check size={18} /></button>
            <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditValue(task.text); }} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200"><X size={18} /></button>
          </>
        ) : (
          <>
            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-2 rounded-xl text-gray-400 hover:text-[#007aff] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200">
              <Pencil size={18} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(task.id, e); }} className="p-2 rounded-xl text-gray-400 hover:text-[#ff3b30] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200">
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}