import React, { useState } from 'react';
import { Circle, CheckCircle2, GripVertical, Pencil, Trash2, Calendar, AlignLeft } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TaskItem({ task, onToggle, onClick, onDelete, onEdit, isManualSort = true }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !isManualSort,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);

  const handleSave = (e) => {
    e?.stopPropagation();
    if (editValue.trim() && editValue !== task.text) {
      onEdit(task.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const style = {
    transform: isDragging
      ? `${CSS.Translate.toString(transform)} scale(1.03)`
      : CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : 'transform 120ms cubic-bezier(0.25, 1, 0.5, 1), opacity 120ms ease',
    opacity: isDragging ? 0.45 : 1,
    boxShadow: isDragging ? '0 12px 40px rgba(0,0,0,0.18)' : undefined,
    position: 'relative',
    zIndex: isDragging ? 999 : 'auto',
    touchAction: 'none',
  };

  const dotColor = task.color || null;
  const todayString = new Date().toISOString().split('T')[0];
  const isOverdue = task.due_date && task.due_date < todayString && !task.is_done;
  const isToday = task.due_date === todayString && !task.is_done;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isEditing && onClick(task)}
      // Odstraněno min-w-0, přidáno h-auto pro přizpůsobení výšce textu
      className="group flex items-start justify-between p-4 mb-2 bg-white dark:bg-[#1c1c1e] rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-[#2c2c2e] shadow-sm active:scale-[0.99] transition-transform cursor-pointer h-auto"
    >
      <div className="flex items-start gap-3 flex-1">

        {/* Grip */}
        {isManualSort && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 p-1 -ml-2 mt-0.5 touch-none shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <GripVertical size={18} />
          </div>
        )}

        {/* Toggle done */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task); }}
          className="shrink-0 mt-0.5 active:scale-90 transition-transform"
        >
          {task.is_done
            ? <CheckCircle2 className="text-[#007aff]" size={24} />
            : <Circle className={`transition-colors ${isOverdue ? 'text-[#ff3b30]/50 dark:text-[#ff453a]/50' : 'text-gray-300'}`} size={24} />
          }
        </button>

        {/* Text + datum/poznámka pod sebou */}
        <div className="flex flex-col flex-1 justify-center">
          <div className="flex items-start gap-2">
            {/* Barevný štítek (zarovnaný nahoru s textem) */}
            {dotColor && !isEditing && (
              <span
                className="w-2 h-2 rounded-full shrink-0 mt-2"
                style={{ backgroundColor: dotColor }}
              />
            )}

            {/* Text / edit input */}
            {isEditing ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave(e)}
                className="bg-transparent outline-none flex-1 border-b border-[#007aff] text-[#1c1c1e] dark:text-white text-base py-0.5 w-full"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                // OPRAVA ZDE: Odstraněno truncate, přidáno break-words a whitespace-normal
                className={`flex-1 text-base break-words whitespace-normal leading-snug py-0.5 ${
                  task.is_done
                    ? 'line-through text-gray-400'
                    : isOverdue
                      ? 'text-[#ff3b30] dark:text-[#ff453a]'
                      : 'text-[#1c1c1e] dark:text-[#f5f5f7]'
                }`}
              >
                {task.text}
              </span>
            )}
          </div>

          {/* Termín + poznámka pod textem */}
          {(task.due_date || task.notes) && !isEditing && (
            // OPRAVA ZDE: Odstraněno truncate i min-w-0, aby se i poznámka mohla zalamovat nebo aspoň nezmizela
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[13px] text-gray-400 dark:text-gray-500">
              {task.due_date && (
                <span className={`flex items-center gap-1 shrink-0 ${
                  isOverdue
                    ? 'text-[#ff3b30] dark:text-[#ff453a] font-bold'
                    : isToday
                      ? 'text-[#ff9500] font-medium'
                      : ''
                }`}>
                  <Calendar size={12} />
                  {isOverdue ? 'Zpožděno: ' : ''}
                  {new Date(task.due_date).toLocaleDateString('cs-CZ')}
                </span>
              )}
              {task.notes && (
                // OPRAVA ZDE: Odstraněno truncate
                <span className="flex items-center gap-1 break-words whitespace-normal leading-snug">
                  <AlignLeft size={12} className="shrink-0" /> Poznámka
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit/Delete */}
      <div className="flex items-start gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 ml-3 mt-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="text-gray-400 hover:text-[#007aff] active:scale-90 transition-transform p-1"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="text-gray-400 hover:text-red-500 active:scale-90 transition-transform p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}