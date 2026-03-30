import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import Sidebar from './components/Sidebar/Sidebar';
import MainArea from './components/MainArea/MainArea';
import TaskDetailModal from './components/Modals/TaskDetailModal';
import LoginPage from './components/Login/Loginpage';
import { useTaskMaster } from './hooks/useTaskMaster';

export default function App() {
  const {
    session, lists, tasks, activeListId, isLoading, selectedTask, error,
    newListName, newTaskText, sortBy, isDarkMode,
    setActiveListId, setSelectedTask, setError,
    setNewListName, setNewTaskText, setSortBy, setIsDarkMode,
    handleSignOut, handleCreateList, handleEditList, handleDeleteList,
    handleAddTask, handleEditTask, handleToggleTask, handleDeleteTask,
    handleSaveTask, onDragEndList, onDragEndTask, getFilteredTasks
  } = useTaskMaster();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 10 } })
  );

  if (session === undefined) return (
    <div className="h-screen flex items-center justify-center dark:bg-[#151515]">
      <Loader2 className="animate-spin text-[#007aff]" size={48} />
    </div>
  );

  if (!session) return <LoginPage isDarkMode={isDarkMode} />;

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center dark:bg-[#151515]">
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
  <div className="flex h-full w-full bg-[#f2f2f7] dark:bg-[#151515] text-[#1c1c1e] dark:text-[#f5f5f7] font-sans antialiased overflow-hidden transition-colors duration-300">

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
          user={session.user}
          onSignOut={handleSignOut}
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
          sortBy={sortBy} setSortBy={setSortBy}
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