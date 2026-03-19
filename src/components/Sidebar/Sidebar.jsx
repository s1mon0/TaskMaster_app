import React from 'react';
import { LayoutList, Sun, Moon, Star, Calendar, Infinity as AllIcon } from 'lucide-react';
import SidebarItem from './SidebarItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function Sidebar({ lists, activeListId, onListClick, onCreateList, onDeleteList, onEditList, isDarkMode, toggleDarkMode, tasks }) {
  const todayString = new Date().toISOString().split('T')[0];
  
  // Výpočty pro dlaždice
  const todayCount = tasks.filter(t => !t.is_done && (t.due_date === todayString || (t.due_date && t.due_date < todayString))).length;
  const scheduledCount = tasks.filter(t => !t.is_done && t.due_date).length;
  const allCount = tasks.filter(t => !t.is_done).length;

  return (
    <div className={`w-full md:w-80 lg:w-[360px] bg-[#f2f2f7] dark:bg-[#000000] flex flex-col h-full ${activeListId ? 'hidden md:flex' : 'flex'} z-10`}>
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#007aff] p-2 rounded-xl text-white"><LayoutList size={22} /></div>
          <h1 className="text-[28px] font-bold tracking-tight">TaskMaster</h1>
        </div>
        <button onClick={toggleDarkMode} className="p-2.5 rounded-full bg-white dark:bg-[#1c1c1e] shadow-sm">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
        {/* Apple Style Dlaždice */}
        <div className="grid grid-cols-2 gap-3 px-2">
          <div onClick={() => onListClick('my-day')} className={`p-3 rounded-2xl cursor-pointer transition-all ${activeListId === 'my-day' ? 'bg-white dark:bg-[#1c1c1e] shadow-md' : 'bg-gray-200/50 dark:bg-[#1c1c1e]/50'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="bg-[#ff9500] p-2 rounded-full text-white"><Star size={18} /></div>
              <span className="text-2xl font-bold">{todayCount}</span>
            </div>
            <span className="font-semibold text-gray-500">Můj den</span>
          </div>
          <div onClick={() => onListClick('scheduled')} className={`p-3 rounded-2xl cursor-pointer transition-all ${activeListId === 'scheduled' ? 'bg-white dark:bg-[#1c1c1e] shadow-md' : 'bg-gray-200/50 dark:bg-[#1c1c1e]/50'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="bg-[#007aff] p-2 rounded-full text-white"><Calendar size={18} /></div>
              <span className="text-2xl font-bold">{scheduledCount}</span>
            </div>
            <span className="font-semibold text-gray-500">Plánované</span>
          </div>
          <div onClick={() => onListClick('all')} className={`p-3 rounded-2xl cursor-pointer transition-all col-span-2 ${activeListId === 'all' ? 'bg-white dark:bg-[#1c1c1e] shadow-md' : 'bg-gray-200/50 dark:bg-[#1c1c1e]/50'}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-gray-500 p-2 rounded-full text-white"><AllIcon size={18} /></div>
                <span className="font-semibold text-gray-500">Všechny</span>
              </div>
              <span className="text-2xl font-bold">{allCount}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="px-4 text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2.5">Moje seznamy</p>
          <SortableContext items={lists.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1 px-1">
              {lists.map(list => (
                <SidebarItem key={list.id} list={list} isActive={activeListId === list.id} onClick={onListClick} onDelete={onDeleteList} onEdit={onEditList} />
              ))}
            </div>
          </SortableContext>
          <form onSubmit={onCreateList} className="mt-4 px-1">
            <input type="text" placeholder="Nový seznam..." className="w-full bg-transparent py-3 px-4 outline-none focus:bg-white dark:focus:bg-[#1c1c1e] rounded-xl transition-all"/>
          </form>
        </div>
      </div>
    </div>
  );
}