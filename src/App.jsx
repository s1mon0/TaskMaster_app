import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from './supabase';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import Sidebar from './components/Sidebar/Sidebar';
import MainArea from './components/MainArea/MainArea';
import TaskDetailModal from './components/Modals/TaskDetailModal';
import LoginPage from './components/Login/Loginpage';

export default function App() {
  // ─── Auth ────────────────────────────────────────────────────────
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Data ────────────────────────────────────────────────────────
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeListId, setActiveListId] = useState(() => {
    if (typeof window === 'undefined') return null;
    return window.innerWidth >= 768 ? 'my-day' : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState(null);

  const [newListName, setNewListName] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [sortBy, setSortBy] = useState('manual');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 10 } })
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (!session) return;
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      try {
        setError(null);
        const [{ data: listsData, error: listsError }, { data: tasksData, error: tasksError }] = await Promise.all([
          supabase.from('lists').select('*').order('position'),
          supabase.from('tasks').select('*').order('position'),
        ]);

        if (listsError) throw listsError;
        if (tasksError) throw tasksError;

        if (isMounted) {
          setLists(listsData || []);
          setTasks(tasksData || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLists([]);
    setTasks([]);
    setSelectedTask(null);
    setActiveListId(null);
  };

  // ─── CRUD operace (OPRAVENO: přidáno user_id) ─────────────────────
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      setError(null);
      // ZMĚNA 1: Najdeme nejmenší pozici a odečteme 1
      const minPosition = lists.length > 0
        ? Math.min(...lists.map(l => l.position ?? 0)) - 1
        : 0;

      const { data, error } = await supabase
        .from('lists')
        .insert([{ 
          name: newListName.trim(), 
          position: minPosition,
          user_id: session.user.id 
        }])
        .select();

      if (error) throw error;
      if (data?.[0]) {
        // ZMĚNA 2: data[0] dáme na začátek pole prev
        setLists(prev => [data[0], ...prev]);
        setNewListName('');
        setActiveListId(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditList = async (id, name) => {
    const previousLists = [...lists];
    setLists(lists.map(l => l.id === id ? { ...l, name } : l));
    try {
      setError(null);
      const { error } = await supabase.from('lists').update({ name }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      setLists(previousLists);
      setError(err.message);
    }
  };

  const handleDeleteList = async (id) => {
    try {
      setError(null);
      const { error } = await supabase.from('lists').delete().eq('id', id);
      if (error) throw error;

      setLists(prev => prev.filter(l => l.id !== id));
      if (activeListId === id) setActiveListId('my-day');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      setError(null);
      let targetListId = activeListId;
      let targetDate = null;

      if (activeListId === 'my-day') {
        let defaultList = lists.find(l => l.name === 'Úkoly');
        if (!defaultList) {
          const maxPos = lists.length > 0
            ? Math.max(...lists.map(l => l.position ?? 0)) + 1
            : 0;
          const { data, error } = await supabase
            .from('lists')
            .insert([{ 
              name: 'Úkoly', 
              position: maxPos,
              user_id: session.user.id // OPRAVA ZDE
            }])
            .select();

          if (error) throw error;
          if (data?.[0]) {
            defaultList = data[0];
            setLists(prev => [...prev, defaultList]);
          } else return;
        }
        targetListId = defaultList.id;
        targetDate = new Date().toISOString().split('T')[0];
      }

      const positionInList = Math.max(
        ...tasks.filter(t => t.list_id === targetListId).map(t => t.position ?? -1),
        -1
      ) + 1;

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          list_id: targetListId,
          text: newTaskText.trim(),
          due_date: targetDate,
          position: positionInList,
          user_id: session.user.id // OPRAVA ZDE
        }])
        .select();

      if (error) throw error;
      if (data?.[0]) {
        setTasks(prev => [...prev, data[0]]);
        setNewTaskText('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditTask = async (id, text) => {
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === id ? { ...t, text } : t));
    try {
      setError(null);
      const { error } = await supabase.from('tasks').update({ text }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  };

  const handleToggleTask = async (task) => {
    const is_done = !task.is_done;
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === task.id ? { ...t, is_done } : t));
    try {
      setError(null);
      const { error } = await supabase.from('tasks').update({ is_done }).eq('id', task.id);
      if (error) throw error;
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      setError(null);
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== id));
      if (selectedTask?.id === id) setSelectedTask(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveTask = async () => {
    if (!selectedTask) return;
    const previousTasks = [...tasks];
    const { id, text, due_date, notes, color } = selectedTask;

    try {
      setError(null);
      setTasks(tasks.map(t => t.id === id ? selectedTask : t));

      const { error } = await supabase
        .from('tasks')
        .update({ text, due_date, notes, color })
        .eq('id', id);

      if (error) throw error;
      setSelectedTask(null);
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  };

  const onDragEndList = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = lists.findIndex(l => l.id === active.id);
    const newIndex = lists.findIndex(l => l.id === over.id);
    const newLists = arrayMove(lists, oldIndex, newIndex);
    const previousLists = [...lists];
    setLists(newLists);

    try {
      setError(null);
      await Promise.all(
        newLists.map((l, i) =>
          supabase.from('lists').update({ position: i }).eq('id', l.id)
        )
      );
    } catch (err) {
      setLists(previousLists);
      setError(err.message);
    }
  };

  const todayString = new Date().toISOString().split('T')[0];
  const sortByPos = (arr) => [...arr].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const getFilteredTasks = () => {
    if (activeListId === 'my-day')
      return sortByPos(tasks.filter(t =>
        t.due_date === todayString ||
        (t.due_date && t.due_date < todayString && !t.is_done)
      ));
    if (activeListId === 'scheduled') return sortByPos(tasks.filter(t => t.due_date));
    if (activeListId === 'all') return sortByPos(tasks);
    return sortByPos(tasks.filter(t => t.list_id === activeListId));
  };

  const onDragEndTask = async ({ active, over }) => {
    if (sortBy !== 'manual') return;
    if (!over || active.id === over.id) return;

    const currentTasks = getFilteredTasks();
    const oldIndex = currentTasks.findIndex(t => t.id === active.id);
    const newIndex = currentTasks.findIndex(t => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(currentTasks, oldIndex, newIndex);
    const idToPos = new Map(reordered.map((t, i) => [t.id, i * 10]));
    const previousTasks = [...tasks];

    setTasks(prev =>
      prev.map(t => idToPos.has(t.id) ? { ...t, position: idToPos.get(t.id) } : t)
    );

    try {
      setError(null);
      await Promise.all(
        reordered.map((t, i) =>
          supabase.from('tasks').update({ position: i * 10 }).eq('id', t.id)
        )
      );
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  };

  // ─── Render logika ───────────────────────────────────────────────

  if (session === undefined) return (
    <div className="h-screen flex items-center justify-center dark:bg-black">
      <Loader2 className="animate-spin text-[#007aff]" size={48} />
    </div>
  );

  if (!session) return <LoginPage isDarkMode={isDarkMode} />;

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center dark:bg-black">
      <Loader2 className="animate-spin text-[#007aff]" size={48} />
    </div>
  );

  const activeTasks = getFilteredTasks();
  const activeListName =
    activeListId === 'my-day' ? 'Můj den' :
    activeListId === 'scheduled' ? 'Plánované' :
    activeListId === 'all' ? 'Všechny' :
    lists.find(l => l.id === activeListId)?.name;

  const progress = activeTasks.length
    ? Math.round((activeTasks.filter(t => t.is_done).length / activeTasks.length) * 100)
    : 0;

  return (
    <div className="flex h-[100dvh] bg-[#f2f2f7] dark:bg-black text-[#1c1c1e] dark:text-[#f5f5f7] font-sans antialiased overflow-hidden transition-colors duration-300">

      {error && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg z-[100] text-sm font-medium cursor-pointer"
          onClick={() => setError(null)}
        >
          {error}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEndList}>
        <Sidebar
          lists={lists} tasks={tasks} activeListId={activeListId}
          onListClick={setActiveListId} onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          newListName={newListName} setNewListName={setNewListName}
          onCreateList={handleCreateList}
          user={session.user} // Předáváme uživatele do postranního panelu
          onSignOut={handleSignOut} // Předáváme funkci pro odhlášení
        />
      </DndContext>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEndTask}>
        <MainArea
          activeListId={activeListId} listName={activeListName} tasks={activeTasks}
          onBack={() => setActiveListId(null)} onToggleTask={handleToggleTask}
          onEditTask={handleEditTask} onDeleteTask={handleDeleteTask}
          onTaskClick={setSelectedTask} progress={progress}
          newTaskText={newTaskText} setNewTaskText={setNewTaskText}
          onAddTask={handleAddTask}
          sortBy={sortBy} setSortBy={setSortBy} // Claude to chytře poslal sem jako props
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