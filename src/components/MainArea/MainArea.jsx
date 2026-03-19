import React from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import TaskItem from './TaskItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function MainArea({ activeListId, listName, tasks, onBack, onAddTask, onToggleTask, onDeleteTask, onEditTask, onTaskClick, progress }) {
  return (
    <div className={`flex-1 flex flex-col h-full relative ${!activeListId ? 'hidden md:flex' : 'flex'} md:p-3`}>
      <div className="flex-1 bg-white dark:bg-[#151515] md:rounded-[24px] shadow-sm flex flex-col overflow-hidden border dark:border-gray-800">
        <div className="px-6 pt-12 pb-6 md:px-12 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={onBack} className="md:hidden text-[#007aff]"><ChevronLeft size={32} /></button>
            <h2 className="text-3xl md:text-4xl font-bold">{listName}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#007aff] transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-sm font-bold">{progress}%</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-32">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={onToggleTask} onClick={onTaskClick} onDelete={onDeleteTask} onEdit={onEditTask} />
            ))}
          </SortableContext>
        </div>

        <div className="absolute bottom-6 left-0 w-full px-6">
          <form onSubmit={onAddTask} className="max-w-4xl mx-auto relative">
            <input type="text" placeholder="Přidat úkol..." className="w-full bg-gray-100 dark:bg-[#1c1c1e] rounded-2xl py-4 pl-5 pr-14 outline-none"/>
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#007aff] text-white p-2 rounded-xl"><Plus /></button>
          </form>
        </div>
      </div>
    </div>
  );
}