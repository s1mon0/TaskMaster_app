import React from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import TaskItem from './TaskItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function MainArea({
  activeListId, listName, tasks, onBack, onAddTask,
  onToggleTask, onDeleteTask, onEditTask, onTaskClick,
  progress, newTaskText, setNewTaskText,
}) {
  return (
    <div
      className={`flex-1 min-w-0 flex flex-col h-full relative ${
        !activeListId ? 'hidden md:flex' : 'flex'
      } md:p-3`}
    >
      <div className="flex-1 bg-white dark:bg-[#151515] md:rounded-[24px] shadow-sm flex flex-col overflow-hidden border dark:border-gray-800">

        {/* Hlavička */}
        <div className="px-6 pb-6 md:px-12 backdrop-blur-md" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={onBack} className="md:hidden text-[#007aff] active:opacity-60">
              <ChevronLeft size={32} />
            </button>
            <h2 className="text-3xl md:text-4xl font-bold">{listName}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007aff] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-bold">{progress}%</span>
          </div>
        </div>

        {/* Seznam úkolů */}
        {/* ✅ FIX: pb-28 zajistí, že poslední úkol není schovaný za input barem */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-28">
          <SortableContext
            items={tasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-20 text-gray-300 dark:text-gray-600 select-none">
                <span className="text-5xl mb-3">✓</span>
                <p className="font-medium">Žádné úkoly</p>
              </div>
            )}
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onClick={onTaskClick}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
          </SortableContext>
        </div>

        {/* ✅ FIX: sticky místo absolute – neschovává se pod klávesnicí na iOS
            ✅ FIX: env(safe-area-inset-bottom) – respektuje home bar na iPhonu */}
        <div
          className="sticky bottom-0 bg-white/90 dark:bg-[#151515]/90 backdrop-blur-md px-4 pt-2 md:px-12 border-t border-gray-100 dark:border-gray-800/50"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <form onSubmit={onAddTask} className="max-w-4xl mx-auto relative">
            {/* ✅ FIX: text-base = 16px – zabraňuje auto-zoomu na iOS Safari */}
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Přidat úkol..."
              className="w-full bg-gray-100 dark:bg-[#1c1c1e] rounded-2xl py-4 pl-5 pr-14 outline-none text-base"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#007aff] text-white p-2 rounded-xl active:scale-95 transition-transform"
            >
              <Plus />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}