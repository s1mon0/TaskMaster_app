import React from 'react';
import { X, Trash2 } from 'lucide-react';

const TAG_COLORS = [
  { id: '', bg: 'bg-gray-200 dark:bg-gray-800', border: 'border-transparent' },
  { id: '#ff3b30', bg: 'bg-[#ff3b30]', border: 'border-[#ff3b30]' },
  { id: '#ff9500', bg: 'bg-[#ff9500]', border: 'border-[#ff9500]' },
  { id: '#34c759', bg: 'bg-[#34c759]', border: 'border-[#34c759]' },
  { id: '#007aff', bg: 'bg-[#007aff]', border: 'border-[#007aff]' },
  { id: '#af52de', bg: 'bg-[#af52de]', border: 'border-[#af52de]' },
];

export default function TaskDetailModal({ task, onClose, onSave, onDelete, onChange }) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-[#f5f5f7]">Detail úkolu</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-[#2c2c2e] rounded-full active:scale-90"><X size={20} /></button>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase mb-2.5 block">Název úkolu</label>
            <input type="text" value={task.text} onChange={(e) => onChange({...task, text: e.target.value})} className="w-full text-xl md:text-2xl font-semibold outline-none border-b-2 border-transparent focus:border-[#007aff] bg-transparent"/>
          </div>
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-1">
              <label className="text-[12px] font-bold text-gray-400 uppercase mb-2.5 block">Termín</label>
              <input type="date" value={task.due_date || ''} onChange={(e) => onChange({...task, due_date: e.target.value})} className="w-full bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-xl p-3.5 outline-none font-medium [color-scheme:light] dark:[color-scheme:dark]"/>
            </div>
            <div>
              <label className="text-[12px] font-bold text-gray-400 uppercase mb-2.5 block">Štítek</label>
              <div className="flex items-center gap-2.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] p-3.5 rounded-xl">
                {TAG_COLORS.map(color => (
                  <button key={color.id} onClick={() => onChange({...task, color: color.id})} className={`w-6 h-6 rounded-full border-2 transition-all ${color.bg} ${task.color === color.id ? 'scale-125 border-gray-400 dark:border-white shadow-sm' : color.border}`}/>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase mb-2.5 block">Poznámky</label>
            <textarea placeholder="Přidejte detaily..." value={task.notes || ''} onChange={(e) => onChange({...task, notes: e.target.value})} className="w-full bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-xl p-4 outline-none min-h-[140px] resize-none"/>
          </div>
        </div>
        <div className="p-6 md:p-8 pt-0 flex gap-3">
          <button onClick={() => onDelete(task.id)} className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-2xl active:scale-95"><Trash2 size={22} /></button>
          <button onClick={onSave} className="flex-1 bg-[#007aff] text-white font-semibold py-4 rounded-2xl active:scale-95 shadow-lg">Uložit změny</button>
        </div>
      </div>
    </div>
  );
}