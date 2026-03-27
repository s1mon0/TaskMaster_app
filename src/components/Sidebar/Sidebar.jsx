import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, Moon, Star, Calendar, Infinity as AllIcon, LogOut, Plus, ChevronDown, 
  Briefcase, ShoppingCart, Dumbbell, Home, Book, Plane, Music, Target, ClipboardList, List 
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Funkce, která vrátí elegantní Lucide komponentu místo Emoji
function getListIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('práce') || n.includes('work')) return Briefcase;
  if (n.includes('nákup') || n.includes('shop')) return ShoppingCart;
  if (n.includes('workout') || n.includes('gym') || n.includes('fitness')) return Dumbbell;
  if (n.includes('doma') || n.includes('home') || n.includes('domov')) return Home;
  if (n.includes('čtení') || n.includes('kniha') || n.includes('book')) return Book;
  if (n.includes('cestování') || n.includes('trip') || n.includes('výlet')) return Plane;
  if (n.includes('hudba') || n.includes('music')) return Music;
  if (n.includes('cíl') || n.includes('goal')) return Target;
  if (n.includes('úkoly') || n.includes('tasks')) return ClipboardList;
  return List; // Výchozí ikona, čisté odrážky
}

export default function Sidebar({
  lists, activeListId, onListClick, onCreateList, onDeleteList, onEditList,
  isDarkMode, toggleDarkMode, tasks, newListName, setNewListName,
  user, onSignOut,
}) {
  const todayString = new Date().toISOString().split('T')[0];
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [listsCollapsed, setListsCollapsed] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCreatingList && inputRef.current) inputRef.current.focus();
  }, [isCreatingList]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onCreateList(e);
    setIsCreatingList(false);
  };

  const todayCount = tasks.filter(t =>
    !t.is_done && (t.due_date === todayString || (t.due_date && t.due_date < todayString))
  ).length;
  const scheduledCount = tasks.filter(t => !t.is_done && t.due_date).length;
  const allCount = tasks.filter(t => !t.is_done).length;

  const taskCountForList = (listId) =>
    tasks.filter(t => t.list_id === listId && !t.is_done).length;

  const getTileClass = (id, isRow = false) => {
    const isActive = activeListId === id;
    const layoutClass = isRow ? 'flex-row items-center p-3.5 h-16' : 'flex-col p-4';
    const base = `rounded-3xl cursor-pointer transition-all duration-300 ease-out border flex justify-between ${layoutClass}`;
    const hover = 'hover:scale-[1.02] hover:shadow-xl hover:border-transparent active:scale-100';
    return isActive
      ? `${base} bg-white dark:bg-[#2c2c2e] shadow-lg border-transparent scale-[1.02]`
      : `${base} bg-gray-100 dark:bg-[#1c1c1e] border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#2c2c2e] ${hover}`;
  };

  // Získáme ikonu pro nový seznam, abychom ji zobrazili v inputu
  const NewListIcon = getListIcon(newListName);

  return (
    <div className={`w-full md:w-80 lg:w-[360px] bg-[#f2f2f7] dark:bg-[#000000] flex flex-col h-full ${
      activeListId ? 'hidden md:flex' : 'flex'
    } z-10 transition-colors duration-300`}>

      {/* ── HEADER ── */}
      <div
        className="px-6 pb-4 flex items-center justify-between border-b border-gray-200/50 dark:border-white/5"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#1c1c1e] shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#007aff] to-[#5856d6] flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-[#1c1c1e]">
                <span className="text-sm font-bold">
                  {(user?.user_metadata?.full_name || user?.email || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#f2f2f7] dark:border-black rounded-full" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-bold text-gray-900 dark:text-white truncate leading-tight">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Uživatel'}
            </span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              TaskMaster Cloud
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-[#1c1c1e] text-gray-600 dark:text-gray-400 transition-colors">
            {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button onClick={onSignOut} title="Odhlásit se"
            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={19} />
          </button>
        </div>
      </div>

      {/* ── SCROLLOVATELNÝ OBSAH ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {/* Chytré přehledy */}
        <div>
          <p className="px-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-3 tracking-widest">
            Přehledy
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => onListClick('my-day')} className={getTileClass('my-day')}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-[#ff9500] p-2.5 rounded-full text-white shadow-sm">
                  <Star size={18} className="fill-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{todayCount}</span>
              </div>
              <span className={`font-semibold text-[14px] ${activeListId === 'my-day' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                Můj den
              </span>
            </div>

            <div onClick={() => onListClick('scheduled')} className={getTileClass('scheduled')}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-[#007aff] p-2.5 rounded-full text-white shadow-sm">
                  <Calendar size={18} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{scheduledCount}</span>
              </div>
              <span className={`font-semibold text-[14px] ${activeListId === 'scheduled' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                Plánované
              </span>
            </div>

            <div onClick={() => onListClick('all')} className={`${getTileClass('all', true)} col-span-2`}>
              <div className="flex items-center gap-3">
                <div className="bg-gray-500 p-2.5 rounded-full text-white shadow-sm">
                  <AllIcon size={18} />
                </div>
                <span className={`font-semibold text-[14px] ${activeListId === 'all' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                  Všechny
                </span>
              </div>
              <span className={`text-2xl font-bold tracking-tight mr-1 ${activeListId === 'all' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {allCount}
              </span>
            </div>
          </div>
        </div>

        {/* ── MOJE SEZNAMY ── */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <button
              onClick={() => setListsCollapsed(!listsCollapsed)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${listsCollapsed ? '-rotate-90' : ''}`}
              />
              Seznamy
              {lists.length > 0 && (
                <span className="ml-1 bg-gray-200 dark:bg-[#2c2c2e] text-gray-500 dark:text-gray-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {lists.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCreatingList(true)}
              className="p-1.5 rounded-lg hover:bg-gray-200/60 dark:hover:bg-[#1c1c1e] text-gray-400 hover:text-[#007aff] transition-colors"
              title="Přidat seznam"
            >
              <Plus size={16} />
            </button>
          </div>

          {isCreatingList && (
            <form onSubmit={handleCreateSubmit} className="px-1 mb-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#007aff] dark:text-[#0a84ff]">
                  <NewListIcon size={18} strokeWidth={2.5} />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onBlur={() => { if (!newListName.trim()) setIsCreatingList(false); }}
                  onKeyDown={(e) => e.key === 'Escape' && setIsCreatingList(false)}
                  placeholder="Název seznamu..."
                  className="w-full bg-white dark:bg-[#1c1c1e] py-3 pl-10 pr-20 outline-none text-[#1c1c1e] dark:text-white placeholder:text-gray-400 rounded-xl shadow-sm border border-[#007aff]/50 focus:border-[#007aff] transition-all text-[15px] font-medium"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  {newListName.trim() ? (
                    <button type="submit"
                      className="bg-[#007aff] text-white px-2.5 py-1 rounded-lg text-xs font-semibold active:scale-95">
                      Přidat
                    </button>
                  ) : (
                    <button type="button"
                      onMouseDown={(e) => { e.preventDefault(); setIsCreatingList(false); }}
                      className="text-gray-400 text-xs font-semibold px-2 py-1">
                      Zrušit
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {!listsCollapsed && (
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
                    taskCount={taskCountForList(list.id)}
                    IconComponent={getListIcon(list.name)}
                  />
                ))}
                {lists.length === 0 && !isCreatingList && (
                  <button
                    onClick={() => setIsCreatingList(true)}
                    className="w-full py-6 text-center text-sm text-gray-400 dark:text-gray-600 hover:text-[#007aff] transition-colors"
                  >
                    + Vytvořit první seznam
                  </button>
                )}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}