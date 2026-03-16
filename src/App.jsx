import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Plus, Trash2, Circle, CheckCircle2, LayoutList, Loader2, Calendar, AlignLeft, X, GripVertical, Sun, Moon, Star, Tag, AlertTriangle } from 'lucide-react';
import { supabase } from './supabase'; 

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TAG_COLORS = [
  { id: '', bg: 'bg-gray-200 dark:bg-gray-800', border: 'border-transparent' },
  { id: '#ff3b30', bg: 'bg-[#ff3b30]', border: 'border-[#ff3b30]' },
  { id: '#ff9500', bg: 'bg-[#ff9500]', border: 'border-[#ff9500]' },
  { id: '#34c759', bg: 'bg-[#34c759]', border: 'border-[#34c759]' },
  { id: '#007aff', bg: 'bg-[#007aff]', border: 'border-[#007aff]' },
  { id: '#af52de', bg: 'bg-[#af52de]', border: 'border-[#af52de]' },
];

function SortableListItem({ list, isActive, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list.id });
  const style = { transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 50 : 1, opacity: isDragging ? 0.9 : 1, position: 'relative' };

  return (
    <div ref={setNodeRef} style={style} onClick={() => onClick(list.id)} className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${isDragging ? 'bg-white dark:bg-[#2c2c2e] shadow-xl border border-gray-200 dark:border-gray-700 opacity-90 relative z-50' : isActive ? 'bg-[#007aff] text-white shadow-sm' : 'hover:bg-gray-200/60 dark:hover:bg-[#2c2c2e] active:bg-gray-300 dark:active:bg-[#3a3a3c]'}`}>
      <div className="flex items-center flex-1 overflow-hidden">
        <div {...attributes} {...listeners} className={`cursor-grab active:cursor-grabbing touch-none mr-1.5 p-1 -ml-1 transition-opacity opacity-0 group-hover:opacity-100 ${isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>
          <GripVertical size={16} />
        </div>
        <span className="text-[15px] font-medium truncate pr-2 flex-1">{list.name}</span>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(list.id, e); }} className={`p-1.5 rounded-lg transition-colors flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 ${isActive ? 'text-white/80 hover:bg-white/20' : 'text-gray-400 hover:text-[#ff3b30] hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
        <Trash2 size={16} />
      </button>
    </div>
  );

function SortableTaskItem({ task, onToggle, onClick, onDelete, isMyDay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 50 : 1, position: 'relative', opacity: isDragging ? 0.9 : 1 };

  return (
    <div ref={setNodeRef} style={style} onClick={() => onClick(task)} className={`group flex items-center justify-between p-3.5 sm:p-4 mb-2 bg-white dark:bg-[#1c1c1e] rounded-xl transition-all cursor-pointer border ${isDragging ? 'shadow-2xl border-gray-300 dark:border-gray-600 opacity-90 relative z-50' : 'shadow-sm border-transparent hover:border-gray-100 dark:hover:border-[#2c2c2e] hover:shadow-md'}`}>
      
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {!isMyDay && (
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 p-1 -ml-2 touch-none">
            <GripVertical size={18} />
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onToggle(task, e); }} className={`flex-shrink-0 focus:outline-none z-10 transition-transform active:scale-90 ${isMyDay ? 'ml-1' : ''}`}>
          {task.is_done ? <CheckCircle2 size={26} className="text-[#007aff] fill-[#007aff]/10 dark:fill-[#007aff]/20" /> : <Circle size={26} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500" />}
        </button>
        
        <div className="flex flex-col flex-1 justify-center min-w-0">
          <div className="flex items-start gap-2">
            <span className={`text-[16px] sm:text-[17px] font-medium transition-all break-words whitespace-normal leading-snug ${task.is_done ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-[#1c1c1e] dark:text-[#f5f5f7]'}`}>
              {task.text}
            </span>
            {task.color && <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 shadow-sm" style={{ backgroundColor: task.color }}></div>}
          </div>
          {(task.due_date || task.notes) && (
             <div className="flex items-center gap-3 mt-1.5 text-[13px] text-gray-400 dark:text-gray-500">
               {task.due_date && <span className={`flex items-center gap-1 ${task.due_date === new Date().toISOString().split('T')[0] && !task.is_done ? 'text-[#ff9500] font-medium' : ''}`}><Calendar size={12}/> {new Date(task.due_date).toLocaleDateString('cs-CZ')}</span>}
               {task.notes && <span className="flex items-center gap-1"><AlignLeft size={12}/> Poznámka</span>}
             </div>
          )}
        </div>
      </div>
      
      <button onClick={(e) => { e.stopPropagation(); onDelete(task.id, e); }} className="p-2 ml-2 rounded-xl transition-colors flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#ff3b30] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200">
        <Trash2 size={18} />
      </button>
    </div>
  );
      
      <button onClick={(e) => { e.stopPropagation(); onDelete(task.id, e); }} className="p-2 ml-2 rounded-xl transition-colors flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#ff3b30] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200">
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
    
    // Zahození klávesnice na mobilu, aby se layout nerozbil
    document.activeElement?.blur(); 
    
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

  const handleDeleteTask = async (id, e) => {
    if (e) e.stopPropagation();
    setDbError(null);
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { setDbError("Nepodařilo se smazat úkol: " + error.message); return; }
    
    setTasks(tasks.filter(t => t.id !== id));
    if (selectedTask && selectedTask.id === id) setSelectedTask(null);
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

  if (isLoading) return <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#f2f2f7] dark:bg-[#000000]"><Loader2 className="animate-spin h-14 w-14 text-[#007aff]/60" /></div>;

  // OPRAVA SCROLLOVÁNÍ: h-[100dvh] a overflow-hidden na hlavním obalu
  return (
    <div className="flex h-[100dvh] w-full bg-[#f2f2f7] dark:bg-[#000000] text-[#1c1c1e] dark:text-[#f5f5f7] font-sans antialiased overflow-hidden selection:bg-[#007aff]/30 transition-colors duration-300">
      
      {dbError && (
        <div className="absolute top-0 left-0 w-full z-[100] bg-red-500 text-white p-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            <span className="font-medium">Chyba: {dbError}</span>
          </div>
          <button onClick={() => setDbError(null)} className="p-1 hover:bg-red-600 rounded transition-colors"><X size={18}/></button>
        </div>
      )}

      {/* --- ZÓNA 1: SIDEBAR (Seznamy) --- */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleListDragEnd}>
        <div className={`w-full md:w-80 lg:w-[360px] bg-[#f2f2f7] dark:bg-[#000000] flex-col h-full ${activeListId ? 'hidden md:flex' : 'flex'} z-10`}>
          <div className="px-6 pt-12 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="bg-[#007aff] p-2 rounded-xl shadow-sm text-white">
                    <LayoutList size={22} />
                  </div>
                  <h1 className="text-[28px] font-bold tracking-tight">TaskMaster</h1>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-full bg-white dark:bg-[#1c1c1e] shadow-sm hover:shadow-md text-gray-500 dark:text-gray-400 transition-all active:scale-95">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
          </div>
            
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 pb-10">
            <div>
              <p className="px-4 text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Chytré přehledy</p>
              <div onClick={() => setActiveListId('my-day')} className={`flex items-center justify-between p-3.5 mx-1 rounded-2xl transition-all cursor-pointer ${isMyDay ? 'bg-white dark:bg-[#1c1c1e] shadow-sm text-[#007aff]' : 'hover:bg-gray-200/50 dark:hover:bg-[#1c1c1e] active:bg-gray-300 dark:active:bg-[#2c2c2e]'}`}>
                <div className="flex items-center gap-3.5">
                  <div className={`p-1.5 rounded-lg ${isMyDay ? 'bg-[#007aff]/10 dark:bg-[#007aff]/20' : 'bg-transparent'}`}>
                    <Star size={20} className={isMyDay ? 'text-[#007aff]' : 'text-[#ff9500]'} />
                  </div>
                  <span className={`text-[16px] font-medium ${isMyDay ? 'text-[#1c1c1e] dark:text-white' : ''}`}>Můj den</span>
                </div>
                {tasks.filter(t => t.due_date === todayString && !t.is_done).length > 0 && (
                  <span className={`text-[13px] font-bold px-2.5 py-1 rounded-full ${isMyDay ? 'bg-[#007aff]/10 text-[#007aff] dark:text-[#007aff]' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                    {tasks.filter(t => t.due_date === todayString && !t.is_done).length}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="px-4 text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Moje seznamy</p>
              <SortableContext items={lists.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-0.5 px-1">
                  {lists.map((list) => (
                    <SortableListItem key={list.id} list={list} isActive={activeListId === list.id} onClick={setActiveListId} onDelete={handleDeleteList} />
                  ))}
                </div>
              </SortableContext>
              
              <form onSubmit={handleCreateList} className="mt-4 px-1 relative flex items-center gap-2">
                <input type="text" placeholder="Nový seznam..." value={newListName} onChange={(e) => setNewListName(e.target.value)} className="w-full bg-transparent dark:bg-transparent rounded-2xl py-3.5 pl-4 pr-16 outline-none text-[16px] border border-transparent focus:bg-white dark:focus:bg-[#1c1c1e] focus:shadow-sm transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"/>
                {newListName.trim() && <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#007aff] font-semibold text-[15px] hover:text-[#0056b3] transition-colors">Přidat</button>}
              </form>
            </div>
          </div>
        </div>
      </DndContext>

      {/* --- ZÓNA 2: HLAVNÍ PLOCHA (Úkoly) - APPLE INSET DESIGN --- */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTaskDragEnd}>
        {/* OPRAVA: Inset vzhled na PC (padding a rounded), plný displej na mobilu */}
        <div className={`flex-1 flex-col h-full relative ${!activeListId ? 'hidden md:flex' : 'flex'} md:p-3 md:pl-0 lg:p-4 lg:pl-0`}>
          
          <div className="flex-1 bg-[#f2f2f7] dark:bg-[#000000] md:bg-white md:dark:bg-[#151515] md:rounded-3xl md:shadow-sm md:border md:border-gray-200/50 dark:md:border-gray-800 flex flex-col overflow-hidden relative">
            
            {activeListId ? (
              <>
                {/* Hlavička úkolů */}
                <div className="px-6 pt-12 pb-6 md:px-12 md:pt-14 bg-[#f2f2f7] dark:bg-[#000000] md:bg-white md:dark:bg-[#151515] z-10 sticky top-0">
                  <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => setActiveListId(null)} className="md:hidden flex items-center text-[#007aff] pr-3 -ml-3 active:opacity-50"><ChevronLeft size={32} /></button>
                    {/* Odstranili jsme 'truncate' a přidali 'pb-2', aby měly ocásky písmen místo. Text se teď raději zalomí, než aby se ořízl. */}
                      <h2 className={`text-3xl md:text-4xl lg:text-[40px] font-bold tracking-tight pb-2 max-w-lg leading-tight ${isMyDay ? 'text-[#ff9500]' : ''}`}>
                      {displayedListName}
                      </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2.5 bg-gray-200/60 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-700 ease-out rounded-full ${isMyDay ? 'bg-[#ff9500]' : 'bg-[#007aff]'}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <span className="text-[15px] font-semibold text-gray-400 dark:text-gray-500 w-12 text-right">{progressPercent}%</span>
                  </div>
                </div>

                {/* Seznam úkolů (SCROLLOVÁNÍ OPRAVENO ZDE) */}
                <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-32">
                  <div className="max-w-4xl mx-auto">
                    {displayedTasks.length === 0 ? (
                      <div className="pt-24 text-center text-gray-400 dark:text-gray-600 flex flex-col items-center">
                        <div className={`p-6 rounded-3xl mb-4 ${isMyDay ? 'bg-[#ff9500]/10' : 'bg-gray-100 dark:bg-gray-800/50'}`}>
                          {isMyDay ? <Star size={48} className="text-[#ff9500]" /> : <LayoutList size={48} className="" />}
                        </div>
                        <p className="text-lg font-medium text-gray-500">Zatím tu nic není.</p>
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

                {/* Přidávací lišta dole */}
                <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 bg-gradient-to-t from-[#f2f2f7] via-[#f2f2f7]/90 md:from-white md:via-white/90 dark:from-[#000000] dark:via-[#000000]/90 md:dark:from-[#151515] md:dark:via-[#151515]/90 to-transparent pt-12">
                  <form onSubmit={handleAddTask} className="relative max-w-4xl mx-auto shadow-xl shadow-black/5 dark:shadow-black/20 rounded-2xl">
                    <input type="text" placeholder={isMyDay ? "Přidat úkol na Můj den..." : "Přidat nový úkol..."} value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} className="w-full bg-white dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-[#f5f5f7] rounded-2xl py-4 pl-5 pr-14 outline-none text-[17px] focus:ring-4 focus:ring-[#007aff]/10 border border-gray-100 dark:border-gray-800 focus:border-[#007aff]/30 transition-all placeholder:text-gray-400"/>
                    <button type="submit" className={`absolute right-2.5 top-[50%] -translate-y-1/2 text-white rounded-xl p-2 active:scale-90 transition-transform ${isMyDay ? 'bg-[#ff9500] hover:bg-[#e08300] shadow-md shadow-orange-500/20' : 'bg-[#007aff] hover:bg-[#0062cc] shadow-md shadow-blue-500/20'}`}><Plus size={22} /></button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                <LayoutList size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Vyberte seznam vlevo</p>
              </div>
            )}
          </div>
        </div>
      </DndContext>

      {/* --- MODAL DETAILU ÚKOLU (OPRAVA NAMAČKANÝCH BOXŮ) --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-0 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-[17px] text-gray-800 dark:text-[#f5f5f7] truncate pr-4">Detail úkolu</h3>
              <button onClick={() => setSelectedTask(null)} className="p-2 bg-gray-100 dark:bg-[#2c2c2e] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors active:scale-90"><X size={20} /></button>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <label className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 block">Název úkolu</label>
                <input type="text" value={selectedTask.text} onChange={(e) => setSelectedTask({...selectedTask, text: e.target.value})} className="w-full text-xl md:text-2xl font-semibold outline-none border-b-2 border-transparent focus:border-[#007aff] pb-1 transition-colors bg-transparent dark:text-white"/>
              </div>
              
              {/* OPRAVA: flex-col na mobilech, flex-row na PC */}
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1">
                  <label className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><Calendar size={14}/> Termín</label>
                  <input type="date" value={selectedTask.due_date || ''} onChange={(e) => setSelectedTask({...selectedTask, due_date: e.target.value})} className="w-full bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-xl p-3.5 outline-none text-[15px] font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-[#007aff]/30 transition-all [color-scheme:light] dark:[color-scheme:dark]"/>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><Tag size={14}/> Štítek</label>
                  <div className="flex items-center justify-between sm:justify-start gap-2.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] p-3.5 rounded-xl">
                    {TAG_COLORS.map(color => (
                      <button key={color.id} onClick={() => setSelectedTask({...selectedTask, color: color.id})} className={`w-6 h-6 rounded-full border-2 transition-all shadow-sm ${color.bg} ${selectedTask.color === color.id ? 'scale-125 border-gray-400 dark:border-white' : color.border}`}/>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><AlignLeft size={14}/> Poznámky</label>
                <textarea placeholder="Přidejte popis nebo detaily..." value={selectedTask.notes || ''} onChange={(e) => setSelectedTask({...selectedTask, notes: e.target.value})} className="w-full bg-[#f2f2f7] dark:bg-[#2c2c2e] dark:text-white rounded-xl p-4 outline-none text-[16px] focus:ring-2 focus:ring-[#007aff]/30 transition-all min-h-[140px] resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"/>
              </div>
            </div>
            
            <div className="p-6 md:p-8 pt-0 flex gap-3">
              <button onClick={() => handleDeleteTask(selectedTask.id)} className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-2xl active:scale-95 transition-transform hover:bg-red-100 dark:hover:bg-red-900/40">
                <Trash2 size={22} />
              </button>
              <button onClick={handleSaveTaskDetails} className="flex-1 bg-[#007aff] text-white font-semibold text-[17px] py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-blue-500/20 hover:bg-[#0062cc]">
                Uložit změny
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}