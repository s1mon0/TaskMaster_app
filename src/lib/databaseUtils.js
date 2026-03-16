import { supabase } from './supabaseClient';

/**
 * Načte seznam
 */
export async function fetchLists() {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return { lists: data || [], error: null };
  } catch (error) {
    console.error('Fetch lists error:', error);
    return { lists: [], error };
  }
}

/**
 * Vytvoří nový seznam
 */
export async function createList(name) {
  try {
    const { data, error } = await supabase
      .from('lists')
      .insert([{ name }])
      .select();
    
    if (error) throw error;
    return { list: data?.[0], error: null };
  } catch (error) {
    console.error('Create list error:', error);
    return { list: null, error };
  }
}

/**
 * Vymaže seznam
 */
export async function deleteList(id) {
  try {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Delete list error:', error);
    return { success: false, error };
  }
}

/**
 * Načte úkoly pro seznam
 */
export async function fetchTasks(listId) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return { tasks: data || [], error: null };
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return { tasks: [], error };
  }
}

/**
 * Vytvoří nový úkol
 */
export async function createTask(listId, text) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ list_id: listId, text, is_done: false }])
      .select();
    
    if (error) throw error;
    return { task: data?.[0], error: null };
  } catch (error) {
    console.error('Create task error:', error);
    return { task: null, error };
  }
}

/**
 * Aktualizuje úkol (toggle done)
 */
export async function updateTask(id, isDone) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ is_done: isDone })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { task: data?.[0], error: null };
  } catch (error) {
    console.error('Update task error:', error);
    return { task: null, error };
  }
}

/**
 * Vymaže úkol
 */
export async function deleteTask(id) {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Delete task error:', error);
    return { success: false, error };
  }
}

/**
 * Přihlásí se na real-time updaty pro seznamy
 */
export function subscribeLists(callback) {
  const subscription = supabase
    .channel('lists-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lists' }, (payload) => {
      callback(payload);
    })
    .subscribe();
  
  return subscription;
}

/**
 * Přihlásí se na real-time updaty pro úkoly
 */
export function subscribeTasks(callback) {
  const subscription = supabase
    .channel('tasks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
      callback(payload);
    })
    .subscribe();
  
  return subscription;
}
