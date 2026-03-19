import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from './supabase'; 
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import Sidebar from './components/Sidebar/Sidebar';
import MainArea from './components/MainArea/MainArea';
import TaskDetailModal from './components/Modals/TaskDetailModal';

export default function App() {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeListId, setActiveListId] = useState('my-day'); 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 3 } }));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: l } = await supabase.from('lists').select('*').order('position');
    const { data: t } = await supabase.from('tasks').select('*').order('position');
    setLists(l || []); setTasks(t || []); setIsLoading(false);
  }

  // Logika pro úkoly a seznamy (vytvoření, editace, smazání)
  const handleEditList = async (id, name) => {
    setLists(lists.map(l => l.id === id ? {...l, name} : l));
    await supabase.from('lists').update({ name }).eq('id', id);
  };

  const handleEditTask = async (id, text) => {
    setTasks(tasks.map(t => t.id === id ? {...t, text} : t));
    await supabase.from('tasks').update({ text }).eq('id', id);
  };

  const handleToggleTask = async (task) => {
    const is_done = !task.is_done;
    setTasks(tasks.map(t => t.id === task.id ? {...t, is_done} : t));
    await supabase.from('tasks').update({ is_done }).eq('id', task.id);
  };

  // Drag & Drop
  const onDragEndList = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const newLists = arrayMove(lists, lists.findIndex(l => l.id === active.id), lists.findIndex(l => l.id === over.id));
    setLists(newLists);
    newLists.forEach((l, i) => supabase.from('lists').update({ position: i }).eq('id', l.id).then());
  };

  const todayString = new Date().toISOString().split('T')[0];
  const getFilteredTasks = () => {
    if (activeListId === 'my-day') return tasks.filter(t => t.due_date === todayString || (t.due_date && t.due_date < todayString && !t.is_done));
    if (activeListId === 'scheduled') return tasks.filter(t => t.due_date);
    if (activeListId === 'all') return tasks;
    return tasks.filter(t => t.list_id === activeListId);
  };

  const activeTasks = getFilteredTasks();
  const activeListName = activeListId === 'my-day' ? 'Můj den' : activeListId === 'scheduled' ? 'Plánované' : activeListId === 'all' ? 'Všechny' : lists.find(l => l.id === activeListId)?.name;
  const progress = activeTasks.length ? Math.round((activeTasks.filter(t => t.is_done).length / activeTasks.length) * 100) : 0;

  if (isLoading) return <div className="h-screen flex items-center justify-center dark:bg-black"><Loader2 className="animate-spin text-[#007aff]" size={48} /></div>;

  return (
    <div className="flex h-[100dvh] bg-[#f2f2f7] dark:bg-black overflow-hidden">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEndList}>
        <Sidebar 
          lists={lists} tasks={tasks} activeListId={activeListId} 
          onListClick={setActiveListId} onEditList={handleEditList} 
          isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      </DndContext>

      <MainArea 
        activeListId={activeListId} listName={activeListName} tasks={activeTasks}
        onBack={() => setActiveListId(null)} onToggleTask={handleToggleTask}
        onEditTask={handleEditTask} onTaskClick={setSelectedTask} progress={progress}
      />

      <TaskDetailModal 
        task={selectedTask} onClose={() => setSelectedTask(null)}
        onChange={setSelectedTask} onSave={() => { /* logika uložení detailu */ setSelectedTask(null); }}
      />
    </div>
  );
}