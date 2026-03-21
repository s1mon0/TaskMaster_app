import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, EyeOff, Eye, ArrowDownAZ, CalendarClock, GripVertical } from 'lucide-react';
import TaskItem from './TaskItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function MainArea({
  activeListId, listName, tasks, onBack, onAddTask,
  onToggleTask, onDeleteTask, onEditTask, onTaskClick,
  progress, newTaskText, setNewTaskText,
  sortBy, setSortBy,   // z App.jsx – onDragEndTask musí znát aktuální řazení
}) {
  const [hideCompleted, setHideCompleted] = useState(false);

  const displayedTasks = useMemo(() => {
    let result = [...tasks];

    if (hideCompleted) {
      result = result.filter(t => !t.is_done);
    }

    if (sortBy === 'alpha') {
      result.sort((a, b) => a.text.localeCompare(b.text, 'cs'));
    } else if (sortBy === 'date') {
      result.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
    }
    // sortBy === 'manual' → pořadí z App.jsx (position) beze změny

    return result;
  }, [tasks, hideCompleted, sortBy]);

  const isDragEnabled = sortBy === 'manual';

  return (
    <div className={`flex-1 min-w-0 flex flex-col h-full relative ${!activeListId ? 'hidden md:flex' : 'flex'} md:p-3`}>
      <div className="flex-1 bg-white dark:bg-[#151515] md:rounded-[24px] shadow-sm flex flex-col overflow-hidden border dark:border-gray-800 min-w-0">

        {/* Hlavička */}
        <div
          className="px-6 pb-4 md:px-12 backdrop-blur-md"
          style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <button onClick={onBack} className="md:hidden text-[#007aff] active:opacity-60 transition-opacity -ml-2 p-1">
              <ChevronLeft size={32} />
            </button>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
              {listName}
            </h2>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007aff] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-9 text-right">
              {progress}%
            </span>
          </div>

          {/* Ovládací panel – zobrazí se jen pokud jsou nějaké tasky */}
          {tasks.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-5">

              {/* Skrýt/zobrazit hotové */}
              <button
                onClick={() => setHideCompleted(!hideCompleted)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  hideCompleted
                    ? 'bg-[#007aff]/10 text-[#007aff] dark:bg-[#007aff]/20'
                    : 'bg-gray-100 text-gray-600 dark:bg-[#2c2c2e] dark:text-gray-300'
                }`}
              >
                {hideCompleted ? <EyeOff size={16} /> : <Eye size={16} />}
                {hideCompleted ? 'Zobrazit hotové' : 'Skrýt hotové'}
              </button>

              {/* Přepínač řazení */}
              <div className="flex bg-gray-100 dark:bg-[#2c2c2e] rounded-lg p-0.5">
                <button
                  onClick={() => setSortBy('manual')}
                  title="Vlastní řazení (drag & drop)"
                  className={`p-1.5 rounded-md transition-colors ${
                    sortBy === 'manual'
                      ? 'bg-white dark:bg-[#1c1c1e] text-[#007aff] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <GripVertical size={16} />
                </button>
                <button
                  onClick={() => setSortBy('date')}
                  title="Podle termínu"
                  className={`p-1.5 rounded-md transition-colors ${
                    sortBy === 'date'
                      ? 'bg-white dark:bg-[#1c1c1e] text-[#007aff] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarClock size={16} />
                </button>
                <button
                  onClick={() => setSortBy('alpha')}
                  title="Podle abecedy"
                  className={`p-1.5 rounded-md transition-colors ${
                    sortBy === 'alpha'
                      ? 'bg-white dark:bg-[#1c1c1e] text-[#007aff] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowDownAZ size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Seznam úkolů */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-28">

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-300 dark:text-gray-600 select-none">
              <span className="text-5xl mb-3">✓</span>
              <p className="font-medium">Žádné úkoly</p>
            </div>
          )}

          {tasks.length > 0 && displayedTasks.length === 0 && (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              Všechny úkoly jsou hotové! 🎉
            </div>
          )}

          <SortableContext
            items={displayedTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {displayedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onClick={onTaskClick}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                isManualSort={isDragEnabled}
              />
            ))}
          </SortableContext>
        </div>

        {/* Input bar – sticky, neschovává se za iOS klávesnicí */}
        <div
          className="sticky bottom-0 bg-white/90 dark:bg-[#151515]/90 backdrop-blur-md px-4 pt-2 md:px-12 border-t border-gray-100 dark:border-gray-800/50"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <form onSubmit={onAddTask} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Přidat úkol..."
              className="w-full bg-gray-100 dark:bg-[#1c1c1e] rounded-2xl py-4 pl-5 pr-14 outline-none text-base"
            />
            <button
              type="submit"
              disabled={!newTaskText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#007aff] disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white p-2.5 rounded-xl transition-colors active:scale-95"
            >
              <Plus size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}