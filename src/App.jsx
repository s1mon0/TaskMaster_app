import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from './supabase';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  TouchSensor,        // ✅ FIX 1: Přidán TouchSensor pro iOS
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import Sidebar from './components/Sidebar/Sidebar';
import MainArea from './components/MainArea/MainArea';
import TaskDetailModal from './components/Modals/TaskDetailModal';

export default function App() {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  // Na mobilu zobrazit sidebar (dlaždice) při startu, na desktopu rovnou "Můj den"
  const [activeListId, setActiveListId] = useState(
    () => window.innerWidth >= 768 ? 'my-day' : null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  const [newListName, setNewListName] = useState('');
  const [newTaskText, setNewTaskText] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  // ✅ FIX 1: TouchSensor s delay 200ms – ideální pro iOS bez konflitu se scrollem
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: l } = await supabase.from('lists').select('*').order('position');
    const { data: t } = await supabase.from('tasks').select('*').order('position');
    setLists(l || []);
    setTasks(t || []);
    setIsLoading(false);
  }

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const { data } = await supabase
      .from('lists')
      .insert([{ name: newListName.trim(), position: lists.length }])
      .select();
    if (data) {
      setLists([...lists, data[0]]);
      setNewListName('');
      setActiveListId(data[0].id);
    }
  };

  const handleEditList = async (id, name) => {
    setLists(lists.map(l => l.id === id ? { ...l, name } : l));
    await supabase.from('lists').update({ name }).eq('id', id);
  };

  const handleDeleteList = async (id) => {
    await supabase.from('lists').delete().eq('id', id);
    setLists(lists.filter(l => l.id !== id));
    if (activeListId === id) setActiveListId('my-day');
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    let targetListId = activeListId;
    let targetDate = null;

    if (activeListId === 'my-day') {
      let defaultList = lists.find(l => l.name === 'Úkoly');
      if (!defaultList) {
        const { data } = await supabase
          .from('lists')
          .insert([{ name: 'Úkoly', position: lists.length }])
          .select();
        if (data) { defaultList = data[0]; setLists([...lists, defaultList]); }
        else return;
      }
      targetListId = defaultList.id;
      targetDate = new Date().toISOString().split('T')[0];
    }

    const positionInList = tasks.filter(t => t.list_id === targetListId).length;
    const { data } = await supabase
      .from('tasks')
      .insert([{
        list_id: targetListId,
        text: newTaskText.trim(),
        due_date: targetDate,
        position: positionInList,
      }])
      .select();
    if (data) { setTasks([...tasks, data[0]]); setNewTaskText(''); }
  };

  const handleEditTask = async (id, text) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, text } : t));
    await supabase.from('tasks').update({ text }).eq('id', id);
  };

  const handleToggleTask = async (task) => {
    const is_done = !task.is_done;
    setTasks(tasks.map(t => t.id === task.id ? { ...t, is_done } : t));
    await supabase.from('tasks').update({ is_done }).eq('id', task.id);
  };

  const handleDeleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  // ✅ FIX 3: Skutečné uložení do Supabase při kliknutí na "Uložit změny"
  const handleSaveTask = async () => {
    if (!selectedTask) return;
    const { id, text, due_date, notes, color } = selectedTask;
    setTasks(tasks.map(t => t.id === id ? selectedTask : t));
    await supabase
      .from('tasks')
      .update({ text, due_date, notes, color })
      .eq('id', id);
    setSelectedTask(null);
  };

  const onDragEndList = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const newLists = arrayMove(
      lists,
      lists.findIndex(l => l.id === active.id),
      lists.findIndex(l => l.id === over.id)
    );
    setLists(newLists);
    newLists.forEach((l, i) =>
      supabase.from('lists').update({ position: i }).eq('id', l.id)
    );
  };

  const todayString = new Date().toISOString().split('T')[0];

  const getFilteredTasks = () => {
    if (activeListId === 'my-day')
      return tasks.filter(t =>
        t.due_date === todayString ||
        (t.due_date && t.due_date < todayString && !t.is_done)
      );
    if (activeListId === 'scheduled') return tasks.filter(t => t.due_date);
    if (activeListId === 'all') return tasks;
    return tasks.filter(t => t.list_id === activeListId);
  };

  // ✅ FIX 2: Handler pro task drag & drop (dříve chyběl!)
  const onDragEndTask = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const currentTasks = getFilteredTasks();
    const oldIndex = currentTasks.findIndex(t => t.id === active.id);
    const newIndex = currentTasks.findIndex(t => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(currentTasks, oldIndex, newIndex);
    const positionMap = new Map(reordered.map((t, i) => [t.id, i]));

    setTasks(prev =>
      prev.map(t =>
        positionMap.has(t.id) ? { ...t, position: positionMap.get(t.id) } : t
      )
    );

    reordered.forEach((t, i) =>
      supabase.from('tasks').update({ position: i }).eq('id', t.id)
    );
  };

  const activeTasks = getFilteredTasks();
  const activeListName =
    activeListId === 'my-day' ? 'Můj den' :
    activeListId === 'scheduled' ? 'Plánované' :
    activeListId === 'all' ? 'Všechny' :
    lists.find(l => l.id === activeListId)?.name;

  const progress = activeTasks.length
    ? Math.round((activeTasks.filter(t => t.is_done).length / activeTasks.length) * 100)
    : 0;

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center dark:bg-black">
      <Loader2 className="animate-spin text-[#007aff]" size={48} />
    </div>
  );

  return (
    <div className="flex h-[100dvh] bg-[#f2f2f7] dark:bg-black text-[#1c1c1e] dark:text-[#f5f5f7] font-sans antialiased overflow-hidden transition-colors duration-300">

      {/* Sidebar – DnD pro přesouvání seznamů */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEndList}
      >
        <Sidebar
          lists={lists} tasks={tasks} activeListId={activeListId}
          onListClick={setActiveListId} onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          newListName={newListName} setNewListName={setNewListName}
          onCreateList={handleCreateList}
        />
      </DndContext>

      {/* ✅ FIX 2: Vlastní DnD kontext pro úkoly – dříve CHYBĚL */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEndTask}
      >
        <MainArea
          activeListId={activeListId} listName={activeListName} tasks={activeTasks}
          onBack={() => setActiveListId(null)} onToggleTask={handleToggleTask}
          onEditTask={handleEditTask} onDeleteTask={handleDeleteTask}
          onTaskClick={setSelectedTask} progress={progress}
          newTaskText={newTaskText} setNewTaskText={setNewTaskText}
          onAddTask={handleAddTask}
        />
      </DndContext>

      <TaskDetailModal
        task={selectedTask} onClose={() => setSelectedTask(null)}
        onChange={setSelectedTask} onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}