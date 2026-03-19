import React from 'react';
import { Sun, Moon, Star, Calendar, Infinity as AllIcon } from 'lucide-react';
import SidebarItem from './SidebarItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function Sidebar({
  lists, activeListId, onListClick, onCreateList, onDeleteList, onEditList,
  isDarkMode, toggleDarkMode, tasks, newListName, setNewListName,
}) {
  const todayString = new Date().toISOString().split('T')[0];

  const todayCount = tasks.filter(t =>
    !t.is_done && (t.due_date === todayString || (t.due_date && t.due_date < todayString))
  ).length;
  const scheduledCount = tasks.filter(t => !t.is_done && t.due_date).length;
  const allCount = tasks.filter(t => !t.is_done).length;

  const getTileClass = (id, isRow = false) => {
    const isActive = activeListId === id;
    const layoutClass = isRow ? 'flex-row items-center p-3.5 h-16' : 'flex-col p-4';
    const base = `rounded-3xl cursor-pointer transition-all duration-300 ease-out border flex justify-between ${layoutClass}`;
    const hover = 'hover:scale-[1.02] hover:shadow-xl hover:border-transparent active:scale-100';

    return isActive
      ? `${base} bg-white dark:bg-[#2c2c2e] shadow-lg border-transparent scale-[1.02]`
      : `${base} bg-gray-100 dark:bg-[#1c1c1e] border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#2c2c2e] ${hover}`;
  };

  return (
    <div
      className={`w-full md:w-80 lg:w-[360px] bg-[#f2f2f7] dark:bg-[#000000] flex flex-col h-full ${
        activeListId ? 'hidden md:flex' : 'flex'
      } z-10 transition-colors duration-300`}
    >
      {/* ✅ FIX: safe-area-inset-top pro Dynamic Island / notch na iPhonu */}
      <div
        className="px-6 pb-4 flex items-center justify-end"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}
      >
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full bg-white dark:bg-[#1c1c1e] shadow-sm hover:scale-105 active:scale-95 transition-transform text-gray-800 dark:text-gray-200"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-10 pb-10">
        {/* Chytré přehledy */}
        <div>
          <p className="px-4 text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-3.5 tracking-wider">
            Chytré přehledy
          </p>
          <div className="grid grid-cols-2 gap-4">

            <div onClick={() => onListClick('my-day')} className={getTileClass('my-day')}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-[#ff9500] p-2.5 rounded-full text-white shadow-sm">
                  <Star size={20} className="fill-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {todayCount}
                </span>
              </div>
              <span className={`font-semibold text-[15px] ${
                activeListId === 'my-day' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
              }`}>
                Můj den
              </span>
            </div>

            <div onClick={() => onListClick('scheduled')} className={getTileClass('scheduled')}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-[#007aff] p-2.5 rounded-full text-white shadow-sm">
                  <Calendar size={20} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {scheduledCount}
                </span>
              </div>
              <span className={`font-semibold text-[15px] ${
                activeListId === 'scheduled' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
              }`}>
                Plánované
              </span>
            </div>

            <div
              onClick={() => onListClick('all')}
              className={`${getTileClass('all', true)} col-span-2`}
            >
              <div className="flex items-center gap-3.5">
                <div className="bg-gray-500 p-2.5 rounded-full text-white shadow-sm">
                  <AllIcon size={20} />
                </div>
                <span className={`font-semibold text-[15px] ${
                  activeListId === 'all' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Všechny
                </span>
              </div>
              <span className={`text-2xl font-bold tracking-tight mr-1 ${
                activeListId === 'all' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
              }`}>
                {allCount}
              </span>
            </div>
          </div>
        </div>

        {/* Moje seznamy */}
        <div>
          <p className="px-4 text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-3 tracking-wider">
            Moje seznamy
          </p>
          <SortableContext items={lists.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-0.5 px-1">
              {lists.map(list => (
                <SidebarItem
                  key={list.id}
                  list={list}
                  isActive={activeListId === list.id}
                  onClick={onListClick}
                  onDelete={onDeleteList}
                  onEdit={onEditList}
                />
              ))}
            </div>
          </SortableContext>

          <form onSubmit={onCreateList} className="mt-5 px-1 relative">
            {/* ✅ FIX: text-base = 16px zabraňuje zoom na iOS */}
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Nový seznam..."
              className="w-full bg-transparent py-3.5 pl-4 pr-16 outline-none text-[#1c1c1e] dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#1c1c1e] rounded-xl transition-all border border-transparent focus:border-gray-200 dark:focus:border-gray-800 focus:shadow-sm text-base"
            />
            {newListName.trim() && (
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#007aff] font-semibold text-sm active:opacity-60"
              >
                Přidat
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}