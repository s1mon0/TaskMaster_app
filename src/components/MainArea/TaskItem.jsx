import React, { useState } from 'react';
import { Circle, CheckCircle2, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TaskItem({ task, onToggle, onClick, onDelete, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

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
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    // ✅ FIX: Zabraňuje "přilepení" elementu při drag na iOS
    touchAction: isDragging ? 'none' : undefined,
  };

  // Barva štítku
  const dotColor = task.color || null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isEditing && onClick(task)}
      className="group flex items-center justify-between p-4 mb-2 bg-white dark:bg-[#1c1c1e] rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-[#2c2c2e] shadow-sm active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Grip handle – touch-none zabraňuje scrollu při drag */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 p-1 -ml-2 touch-none shrink-0"
        >
          <GripVertical size={18} />
        </div>

        {/* Toggle done */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task); }}
          className="shrink-0 active:scale-90 transition-transform"
        >
          {task.is_done
            ? <CheckCircle2 className="text-[#007aff]" size={24} />
            : <Circle className="text-gray-300" size={24} />
          }
        </button>

        {/* Štítek (barevná tečka) */}
        {dotColor && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
          />
        )}

        {/* Text / edit */}
        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave(e)}
            className="bg-transparent outline-none flex-1 border-b border-[#007aff] text-[#1c1c1e] dark:text-white text-base min-w-0"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={`flex-1 truncate text-base ${
              task.is_done
                ? 'line-through text-gray-400'
                : 'text-[#1c1c1e] dark:text-[#f5f5f7]'
            }`}
          >
            {task.text}
          </span>
        )}
      </div>

      {/* ✅ FIX: Na mobilu (md:) vždy viditelné, na desktopu jen při hover
          Protože na dotykovém displeji hover nefunguje → tlačítka by byla nedostupná */}
      <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
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