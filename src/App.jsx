import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Plus, Trash2, Circle, CheckCircle2, LayoutList, Loader2, Calendar, AlignLeft, X, GripVertical, Sun, Moon, Star, Tag, AlertTriangle } from 'lucide-react';
import { supabase } from './supabase'; 

import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
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

// --- KOMPONENTA PRO SEZNAM (SIDEBAR) ---
function SortableListItem({ list, isActive, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list.id });
  
  const style = { 
    transform: CSS.Translate.toString(transform), 
    transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)', 
    zIndex: isDragging ? 100 : 1, 
    opacity: isDragging ? 0.8 : 1,
    position: 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} onClick={() => onClick(list.id)} className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${isDragging ? 'bg-white dark:bg-[#2c2c2e] shadow-xl border border-gray-200 dark:border-gray-700' : isActive ? 'bg-[#007aff] text-white shadow-sm' : 'hover:bg-gray-200/60 dark:hover:bg-[#2c2c2e] active:bg-gray-300 dark:active:bg-[#3a3a3c]'}`}>
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
}

// --- KOMPONENTA PRO ÚKOL ---
function SortableTaskItem({ task, onToggle, onClick, onDelete, isMyDay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  
  const style = { 
    transform: CSS.Translate.toString(transform), 
    transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)', 
    zIndex: isDragging ? 10 : 1, 
    opacity: isDragging ? 0.9 : 1,
    position: 'relative'
  };

  // Logika pro zpožděné úkoly (Apple červená)
  const todayString = new Date().toISOString().split('T')[0];
  const isOverdue = task.due_date && task.due_date < todayString && !task.is_done;
  const isToday = task.due_date === todayString && !task.is_done;

  return (
    <div ref={setNodeRef} style={style} onClick={() => onClick(task)} className={`group flex items-center justify-between p-3.5 sm:p-4 mb-2 bg-white dark:bg-[#1c1c1e] rounded-xl transition-all cursor-pointer border ${isDragging ? 'shadow-2xl border-gray-300 dark:border-gray-600 z-50' : 'shadow-sm border-transparent hover:border-gray-100 dark:hover:border-[#2c2c2e] hover:shadow-md'}`}>
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
            <span className={`text-[16px] sm:text-[17px] font-medium transition-all break-words whitespace-normal leading-snug ${task.is_done ? 'text-gray-400 dark:text-gray-600 line-through' : isOverdue ? 'text-[#ff3b30] dark:text-[#ff453a]' : 'text-[#1c1c1e] dark:text-[#f5f5f7]'}`}>
              {task.text}
            </span>
            {task.color && <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 shadow-sm" style={{ backgroundColor: task.color }}></div>}
          </div>
          {(task.due_date || task.notes) && (
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
      <button onClick={(e) => { e.stopPropagation(); onDelete(task.id, e); }} className="p-2 ml-2 rounded-xl transition-colors flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#ff3b30] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

// --- HLAVNÍ KOMPONENTA APLIKACE ---
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
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data: listsData } = await supabase.from('lists').select('*').order('position', { ascending: true });
      const { data: tasksData } = await supabase.from('tasks').select('*').order('position', { ascending: true });
      setLists(listsData || []);
      setTasks(tasksData || []);
    } catch (error) {
      setDbError("Nepodařilo se připojit k databázi.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    document.activeElement?.blur(); 
    const { data } = await supabase.from('lists').insert([{ name: newListName.trim(), position: lists.length }]).select();
    if (data) { setLists([...lists, data[0]]); setNewListName(''); setActiveListId(data[0].id); }
  };

  const handleDeleteList = async (id, e) => {
    await supabase.from('lists').delete().eq('id', id);
    setLists(lists.filter(l => l.id !== id));
    if (activeListId === id) setActiveListId('my-day');
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    document.activeElement?.blur(); 
    
    let targetListId = activeListId;
    let targetDate = null;
    
    // OPRAVA: Můj den už neháže úkoly do prvního seznamu, ale do "Úkoly"
    if (activeListId === 'my-day') {
      let defaultList = lists.find(l => l.name === 'Úkoly');
      
      if (!defaultList) {
        const { data } = await supabase.from('lists').insert([{ name: 'Úkoly', position: lists.length }]).select();
        if (data) {
          defaultList = data[0];
          setLists([...lists, defaultList]);
        } else {
          return; 
        }
      }
      targetListId = defaultList.id;
      targetDate = new Date().toISOString().split('T')[0];
    }
    
    const { data } = await supabase.from('tasks').insert([{ list_id: targetListId, text: newTaskText.trim(), due_date: targetDate }]).select();
    if (data) { setTasks([...tasks, data[0]]); setNewTaskText(''); }
  };

  const handleToggleTask = async (taskToToggle) => {
    const newStatus = !taskToToggle.is_done;
    setTasks(tasks.map(t => t.id === taskToToggle.id ? { ...t, is_done: newStatus } : t));
    await supabase.from('tasks').update({ is_done: newStatus }).eq('id', taskToToggle.id);
  };

  const handleDeleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const handleSaveTaskDetails = async () => {
    if (!selectedTask) return;
    setTasks(tasks.map(t => t.id === selectedTask.id ? selectedTask : t));
    await supabase.from('tasks').update({ due_date: selectedTask.due_date, notes: selectedTask.notes, color: selectedTask.color }).eq('id', selectedTask.id);
    setSelectedTask(null);
  };

  const handleListDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lists.findIndex(l => l.id === active.id);
    const newIndex = lists.findIndex(l => l.id === over.id);
    const newOrderedLists = arrayMove(lists, oldIndex, newIndex);
    setLists(newOrderedLists.map((l, i) => ({ ...l, position: i })));
    for (let i = 0; i < newOrderedLists.length; i++) {
      await supabase.from('lists').update({ position: i }).eq('id', newOrderedLists[i].id);
    }
  };

  const handleTaskDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id || activeListId === 'my-day') return;
    const activeTasksForDrag = tasks.filter(t => t.list_id === activeListId).sort((a, b) => a.position - b.position);
    const oldIndex = activeTasksForDrag.findIndex(t => t.id === active.id);
    const newIndex = activeTasksForDrag.findIndex(t => t.id === over.id);
    const newOrderedTasks = arrayMove(activeTasksForDrag, oldIndex, newIndex);
    const newAllTasks = tasks.map(t => {
      if (t.list_id === activeListId) return { ...t, position: newOrderedTasks.findIndex(nt => nt.id === t.id) };
      return t;
    });
    setTasks(newAllTasks);
    for (let i = 0; i < newOrderedTasks.length; i++) {
      await supabase.from('tasks').update({ position: i }).eq('id', newOrderedTasks[i].id);
    }
  };

  const isMyDay = activeListId === 'my-day';
  const todayString = new Date().toISOString().split('T')[0];
  
  // Překlápění (Rollover): V "Můj den" jsou i zpožděné nesplněné úkoly
  const displayedTasks = isMyDay 
    ? tasks.filter(t => t.due_date === todayString || (t.due_date && t.due_date < todayString && !t.is_done)) 
    : tasks.filter(t => t.list_id === activeListId).sort((a, b) => a.position - b.position);
    
  const displayedListName = isMyDay ? 'Můj den' : lists.find(l => l.id === activeListId)?.name;
  const progressPercent = displayedTasks.length === 0 ? 0 : Math.round((displayedTasks.filter(t => t.is_done).length / displayedTasks.length) * 100);

  if (isLoading) return <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#f2f2f7] dark:bg-[#000000]"><Loader2 className="animate-spin h