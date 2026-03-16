import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Plus, Trash2, Circle, CheckCircle2, LayoutList, Loader2, Calendar, AlignLeft, X, GripVertical, Sun, Moon, Star, Tag, AlertTriangle } from 'lucide-react';
import { supabase } from './supabase'; 

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TAG_COLORS = [
  { id: '', bg: 'bg-gray-200 dark:bg-gray-700', border: 'border-transparent' },
  { id: '#ff3b30', bg: 'bg-[#ff3b30]', border: 'border-[#ff3b30]' },
  { id: '#ff9500', bg: 'bg-[#ff9500]', border: 'border-[#ff9500]' },
  { id: '#34c759', bg: 'bg-[#34c759]', border: 'border-[#34c759]' },
  { id: '#007aff', bg: 'bg-[#007aff]', border: 'border-[#007aff]' },
  { id: '#af52de', bg: 'bg-[#af52de]', border: 'border-[#af52de]' },
];

// --- KOMPONENTA PRO SEZNAM ---
function SortableListItem({ list, isActive, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list.id });
  const style = { transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 50 : 1, opacity: isDragging ? 0.9 : 1, position: 'relative' };

  return (
    <div ref={setNodeRef} style={style} onClick={() => onClick(list.id)} className={`group flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer ${isDragging ? 'bg-white dark:bg-[#2c2c2e] shadow-xl scale-[1.02] border border-gray-200 dark:border-gray-700' : isActive ? 'bg-[#007aff] text-white shadow-md' : 'hover:bg-gray-200/50 dark:hover:bg-[#2c2c2e] active:bg-gray-300 dark:active:bg-[#3a3a3c]'}`}>
      <div className="flex items-center flex-1 overflow-hidden">
        <div {...attributes} {...listeners} className={`cursor-grab active:cursor-grabbing touch-none mr-2 p-1 -ml-1 transition-opacity opacity-0 group-hover:opacity-100 ${isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>
          <GripVertical size={16} />
        </div>
        <span className="text-[15px] font-medium truncate pr-2 flex-1">{list.name}</span>
      </div>
      {/* OPRAVA: Ikonka koše je na mobilech vidět vždy (opacity-100), na PC se ukáže na hover (sm:opacity-0 sm:group-hover:opacity-100) */}
      <button onClick={(e) => { e.stopPropagation(); onDelete(list.id, e); }} className={`p-1 rounded-md transition-colors flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 ${isActive ? 'text-white/80 hover:bg-white/20' : 'text-gray-400 hover:text-[#ff3b30] hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
        <Trash2 size={18} />
      </button>
    </div>
  );
}

// --- KOMPONENTA PRO ÚKOL ---
function SortableTaskItem({ task, onToggle, onClick, onDelete, isMyDay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 50 : 1, position: 'relative', opacity: isDragging ? 0.9 : 1 };

  return (
    <div ref={setNodeRef} style={style} onClick={() => onClick(task)} className={`group flex items-center justify-between p-3.5 -mx-3.5 rounded-xl transition-colors border cursor-pointer ${isDragging ? 'bg-white dark:bg-[#1c1c1e] shadow-xl border-gray-200 dark:border-gray-800 scale-[1.02]' : 'hover:bg-gray-50 dark:hover:bg-[#1c1c1e] border-transparent hover:border-gray-100 dark:hover:border-[#2c2c2e]'}`}>
      <div className="flex items-center gap-3.5 flex-1 overflow-hidden">
        {!isMyDay && (
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 p-1 -ml-2 touch-none">
            <GripVertical size={18} />
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onToggle(task, e); }} className={`flex-shrink-0 focus:outline-none z-10 ${isMyDay ? 'ml-1' : ''}`}>
          {task.is_done ? <CheckCircle2 size={24} className="text-[#007aff] fill-[#007aff]/10 dark:fill-[#007aff]/20" /> : <Circle size={24} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500" />}
        </button>
        <div className="flex flex-col truncate flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[17px] transition-all truncate ${task.is_done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-[#1c1c1e] dark:text-[#f5f5f7]'}`}>{task.text}</span>
            {task.color && <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: task.color }}></div>}
          </div>
          {(task.due_date || task.notes) && (
             <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-gray-500">
               {task.due_date && <span className={`flex items-center gap-1 ${task.due_date === new Date().toISOString().split('T')[0] && !task.is_done ? 'text-[#ff9500] font-medium' : ''}`}><Calendar size={12}/> {new Date(task.due_date).toLocaleDateString('cs-CZ')}</span>}
               {task.notes && <span className="flex items-center gap-1"><AlignLeft size={12}/> Poznámka</span>}
             </div>
          )}
        </div>
      </div>
      
      {/* OPRAVA: Ikonka koše pro smazání úkolu přímo z řádku */}
      <button onClick={(e) => { e.stopPropagation(); onDelete(task.id, e); }} className="p-1.5 ml-2 rounded-md transition-colors flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#ff3b30] hover:bg-gray-200 dark:hover:bg-gray-700">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function App() {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeListId, setActiveListId] = useState('my-day'); 
  const [newListName, setNewListName] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dbError, setDbError] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('taskmaster_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskmaster_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskmaster_theme', 'light');
    }
  }, [isDarkMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setIsLoading(true);
    setDbError(null); 
    try {
      const { data: listsData, error: listsError } = await supabase.from('lists').select('*').order('position', { ascending: true }).order('created_at', { ascending: true });
      if (listsError) throw new Error("Chyba při načítání seznamů: " + listsError.message);

      const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*').order('position', { ascending: true }).order('created_at', { ascending: true });
      if (tasksError) throw new Error("Chyba při načítání úkolů: " + tasksError.message);

      setLists(listsData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error("Kritická chyba:", error);
      setDbError(error.message || "Nepodařilo se připojit k Supabase.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setDbError(null);
    const { data, error } = await supabase.from('lists').insert([{ name: newListName.trim(), position: lists.length }]).select();
    if (error) { setDbError("Nepodařilo se vytvořit seznam: " + error.message); return; }
    if (data) { setLists([...lists, data[0]]); setNewListName(''); setActiveListId(data[0].id); }
  };

  const handleDeleteList = async (id, e) => {
    setDbError(null);
    const { error } = await supabase.from('lists').delete().eq('id', id);
    if (error) { setDbError("Nepodařilo se smazat seznam: " + error.message); return; }
    const updatedLists = lists.filter(l => l.id !== id);
    setLists(updatedLists); setTasks(tasks.filter(t => t.list_id !== id));
    if (activeListId === id) setActiveListId('my-day');
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setDbError(null);
    let targetListId = activeListId;
    let targetDate = null;

    if (activeListId === 'my-day') {
      if (lists.length === 0) { setDbError("Musíš mít alespoň jeden seznam."); return; }
      targetListId = lists[0].id;
      targetDate = new Date().toISOString().split('T')[0];
    }

    const activeTasksCount = tasks.filter(t => t.list_id === targetListId).length;
    const { data, error } = await supabase.from('tasks').insert([{ list_id: targetListId, text: newTaskText.trim(), position: activeTasksCount, due_date: targetDate }]).select();
    if (error) { setDbError("Nepodařilo se vytvořit úkol: " + error.message); return; }
    if (data) { setTasks([...tasks, data[0]]); setNewTaskText(''); }
  };

  const handleToggleTask = async (taskToToggle, e) => {
    const newStatus = !taskToToggle.is_done;
    setTasks(tasks.map(t => t.id === taskToToggle.id ? { ...t, is_done: newStatus } : t));
    const { error } = await supabase.from('tasks').update({ is_done: newStatus }).eq('id', taskToToggle.id);
    if (error) setDbError("Chyba při aktualizaci úkolu: " + error.message);
  };

  // NOVÁ FUNKCE PRO SMAZÁNÍ ÚKOLU
  const handleDeleteTask = async (id, e) => {
    if (e) e.stopPropagation();
    setDbError(null);
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { setDbError("Nepodařilo se smazat úkol: " + error.message); return; }
    
    setTasks(tasks.filter(t => t.id !== id));
    
    // Pokud jsme smazali úkol, který je zrovna otevřený v okně, tak okno zavřeme
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(null);
    }
  };

  const handleSaveTaskDetails = async () => {
    if (!selectedTask) return;
    setTasks(tasks.map(t => t.id === selectedTask.id ? selectedTask : t));
    const { error } = await supabase.from('tasks').update({ due_date: selectedTask.due_date, notes: selectedTask.notes, color: selectedTask.color }).eq('id', selectedTask.id);
    if (error) setDbError("Chyba při ukládání detailů: " + error.message);
    setSelectedTask(null);
  };

  const handleListDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lists.findIndex(l => l.id === active.id);
    const newIndex = lists.findIndex(l => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrderedLists = arrayMove(lists, oldIndex, newIndex);
    const newAllLists = newOrderedLists.map((l, index) => ({ ...l, position: index }));
    setLists(newAllLists);
    for (let i = 0; i < newOrderedLists.length; i++) {
      if (newOrderedLists[i].position !== i) await supabase.from('lists').update({ position: i }).eq('id', newOrderedLists[i].id);
    }
  };

  const handleTaskDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id || activeListId === 'my-day') return;
    const activeTasksForDrag = tasks.filter(t => t.list_id === activeListId).sort((a, b) => a.position - b.position);
    const oldIndex = activeTasksForDrag.findIndex(t => t.id === active.id);
    const newIndex = activeTasksForDrag.findIndex(t => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrderedTasks = arrayMove(activeTasksForDrag, oldIndex, newIndex);
    const newAllTasks = tasks.map(t => {
      if (t.list_id === activeListId) return { ...t, position: newOrderedTasks.findIndex(nt => nt.id === t.id) };
      return t;
    });
    setTasks(newAllTasks);
    for (let i = 0; i < newOrderedTasks.length; i++) {
      if (newOrderedTasks[i].position !== i) await supabase.from('tasks').update({ position: i }).eq('id', newOrderedTasks[i].id);
    }
  };

  const isMyDay = activeListId === 'my-day';
  const todayString = new Date().toISOString().split('T')[0];
  const displayedTasks = isMyDay ? tasks.filter(t => t.due_date === todayString) : tasks.filter(t => t.list_id === activeListId).sort((a, b) => a.position - b.position);
  const displayedListName = isMyDay ? 'Můj den' : lists.find(l => l.id === activeListId)?.name;
  const progressPercent = displayedTasks.length === 0 ? 0 : Math.round((displayedTasks.filter(t => t.is_done).length / displayedTasks.length) * 100);

  if (isLoading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f2f2f7] dark:bg-[#000000]"><Loader2 className="animate-spin h-14 w-14 text-[#007aff]/60" /></div>;

  return (
    <div className="flex min-h-[100dvh] w-full bg-white dark:bg-[#000000] text-[#1c1c1e] dark:text-[#f5f5f7] font-sans antialiased relative transition-colors duration-300 overflow-x-hidden">
      
      {dbError && (
        <div className="absolute top-0 left-0 w-full z-[100] bg-red-500 text-white p-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            <span className="font-medium">Chyba: {dbError}</span>
          </div>
          <button onClick={() => setDbError(null)} className="p-1 hover:bg-red-600 rounded transition-colors"><X size={18}/></button>
        </div>
      )}

      {/* --- ZÓNA 1: SEZNAMY --- */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleListDragEnd}>
        <div className={`w-full md:w-80 lg:w-96 bg-[#f2f2f7] dark:bg-[#151515] border-r border-gray-200 dark:border-[#2c2c2e] flex-col h-full ${activeListId && activeListId !== 'my-day' ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-6 pt-10 pb-4 border-b border-gray-100 dark:border-[#2c2c2e] flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <LayoutList size={28} className="text-[#007aff]" />
                  <h1 className="text-2xl font-bold tracking-tight">TaskMaster</h1>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2c2c2e] text-gray-500 dark:text-gray-400 transition-colors">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
          </div>
            
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            <div>
              <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Chytré přehledy</p>
              <div onClick={() => setActiveListId('my-day')} className={`flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer ${isMyDay ? 'bg-[#007aff] text-white shadow-md' : 'hover:bg-gray-200/50 dark:hover:bg-[#2c2c2e] active:bg-gray-300 dark:active:bg-[#3a3a3c]'}`}>
                <div className="flex items-center gap-3">
                  <Star size={20} className={isMyDay ? 'text-white' : 'text-[#ff9500]'} />
                  <span className="text-[15px] font-medium">Můj den</span>
                </div>
                {tasks.filter(t => t.due_date === todayString && !t.is_done).length > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isMyDay ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    {tasks.filter(t => t.due_date === todayString && !t.is_done).length}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Moje seznamy</p>
              <SortableContext items={lists.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {lists.map((list) => (
                    <SortableListItem key={list.id} list={list} isActive={activeListId === list.id} onClick={setActiveListId} onDelete={handleDeleteList} />
                  ))}
                </div>
              </SortableContext>
              
              <form onSubmit={handleCreateList} className="mt-2 relative flex items-center gap-2">
                <input type="text" placeholder="Nový seznam..." value={newListName} onChange={(e) => setNewListName(e.target.value)} className="w-full bg-transparent dark:bg-transparent rounded-xl py-3 pl-3 pr-16 outline-none text-[15px] border border-transparent focus:bg-white dark:focus:bg-[#1c1c1e] focus:border-gray-200 dark:focus:border-[#2c2c2e] focus:ring-2 focus:ring-[#007aff]/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"/>
                {newListName.trim() && <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#007aff] font-semibold text-[15px]">Přidat</button>}
              </form>
            </div>
          </div>
        </div>
      </DndContext>

      {/* --- ZÓNA 2: ÚKOLY --- */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTaskDragEnd}>
        <div className={`flex-1 bg-white dark:bg-[#000000] flex-col h-full relative ${!activeListId && window.innerWidth < 768 ? 'hidden' : 'flex'}`}>
          {activeListId ? (
            <>
              <div className="p-6 md:px-10 md:pt-10 border-b border-gray-100 dark:border-[#1c1c1e]">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setActiveListId(null)} className="md:hidden flex items-center text-[#007aff] pr-2 -ml-2"><ChevronLeft size={28} /></button>
                  <h2 className={`text-3xl md:text-4xl font-bold tracking-tight truncate max-w-lg ${isMyDay ? 'text-[#ff9500]' : ''}`}>
                    {displayedListName}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-[#1c1c1e] rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ease-out rounded-full ${isMyDay ? 'bg-[#ff9500]' : 'bg-[#007aff]'}`} style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-500 w-10 text-right">{progressPercent}%</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:px-10">
                <div className="max-w-3xl">
                  {displayedTasks.length === 0 ? (
                    <div className="pt-20 text-center text-gray-400 dark:text-gray-600">
                      {isMyDay ? <Star size={48} className="mx-auto mb-4 opacity-30 text-[#ff9500]" /> : <LayoutList size={48} className="mx-auto mb-4 opacity-30" />}
                      <p>Žádné úkoly k zobrazení.</p>
                    </div>
                  ) : (
                    <SortableContext items={displayedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      {displayedTasks.map((task) => (
                        <SortableTaskItem key={task.id} task={task} onToggle={handleToggleTask} onClick={setSelectedTask} onDelete={handleDeleteTask} isMyDay={isMyDay} />
                      ))}
                    </SortableContext>
                  )}
                </div>
              </div>

              <div className="p-6 md:px-10 bg-white dark:bg-[#000000] border-t border-gray-100 dark:border-[#1c1c1e]">
                <form onSubmit={handleAddTask} className="relative max-w-3xl">
                  <input type="text" placeholder={isMyDay ? "Přidat nový úkol na dnešek..." : "Přidat nový úkol..."} value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} className="w-full bg-[#f2f2f7] dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-[#f5f5f7] rounded-xl py-3 pl-4 pr-12 outline-none text-[17px] focus:bg-white dark:focus:bg-[#2c2c2e] focus:ring-2 focus:ring-[#007aff]/30 border border-transparent focus:border-[#007aff]/30 transition-all placeholder:text-gray-500"/>
                  <button type="submit" className={`absolute right-2 top-[22px] -translate-y-1/2 text-white rounded-lg p-1.5 active:scale-95 transition-transform ${isMyDay ? 'bg-[#ff9500] hover:bg-[#e08300]' : 'bg-[#007aff] hover:bg-[#0062cc]'}`}><Plus size={20} /></button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">Vyberte seznam vlevo</div>
          )}
        </div>
      </DndContext>

      {/* --- MODAL DETAILU ÚKOLU --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2c2c2e] flex items-center justify-between bg-gray-50/50 dark:bg-[#1c1c1e]">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-[#f5f5f7] truncate pr-4">Detail úkolu</h3>
              <button onClick={() => setSelectedTask(null)} className="p-2 bg-gray-200/50 dark:bg-[#2c2c2e] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Název</label>
                <input type="text" value={selectedTask.text} onChange={(e) => setSelectedTask({...selectedTask, text: e.target.value})} className="w-full text-lg font-medium outline-none border-b border-transparent focus:border-[#007aff] pb-1 transition-colors bg-transparent dark:text-white"/>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar size={14}/> Termín</label>
                  <input type="date" value={selectedTask.due_date || ''} onChange={(e) => setSelectedTask({...selectedTask, due_date: e.target.value})} className="w-full bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-xl p-3 outline-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-[#007aff]/30 transition-all [color-scheme:light] dark:[color-scheme:dark]"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Tag size={14}/> Štítek</label>
                  <div className="flex items-center gap-2 bg-[#f2f2f7] dark:bg-[#2c2c2e] p-3 rounded-xl">
                    {TAG_COLORS.map(color => (
                      <button key={color.id} onClick={() => setSelectedTask({...selectedTask, color: color.id})} className={`w-6 h-6 rounded-full border-2 transition-all ${color.bg} ${selectedTask.color === color.id ? 'scale-110 border-gray-400 dark:border-white shadow-sm' : color.border}`}/>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><AlignLeft size={14}/> Poznámky</label>
                <textarea placeholder="Přidejte popis nebo detaily..." value={selectedTask.notes || ''} onChange={(e) => setSelectedTask({...selectedTask, notes: e.target.value})} className="w-full bg-[#f2f2f7] dark:bg-[#2c2c2e] dark:text-white rounded-xl p-3 outline-none text-[15px] focus:ring-2 focus:ring-[#007aff]/30 transition-all min-h-[120px] resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"/>
              </div>
            </div>
            
            {/* OPRAVA: Dvě tlačítka v detailu (Smazat a Uložit) */}
            <div className="p-6 pt-2 flex gap-3">
              <button onClick={() => handleDeleteTask(selectedTask.id)} className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3.5 rounded-2xl active:scale-95 transition-transform hover:bg-red-200 dark:hover:bg-red-900/50">
                <Trash2 size={20} />
              </button>
              <button onClick={handleSaveTaskDetails} className="flex-1 bg-[#007aff] text-white font-semibold text-[17px] py-3.5 rounded-2xl active:scale-95 transition-transform shadow-md shadow-blue-500/20">
                Uložit změny
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}