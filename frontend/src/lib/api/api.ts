// API functions for the Personal Life Management System
const API_BASE_URL = 'http://localhost:3000';

// Types
export interface GoalCreate {
  name: string;
  status: 'Active' | 'Completed' | 'Next' | 'Paused';
  category: string;
  objectives: string[];
}

export interface Goal {
  _id: string;
  userId: string;
  name: string;
  status: 'Active' | 'Completed' | 'Next' | 'Paused';
  category: string;
  objectives: { _id: string; title: string; status: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ObjectiveCreate {
  title: string;
  status: 'Active' | 'Completed' | 'Next' | 'Paused';
  priority: 'Low' | 'Medium' | 'High';
  relatedGoals: string[];
  relatedProjects: string[];
}

export interface Objective {
  _id: string;
  userId: string;
  title: string;
  status: 'Active' | 'Completed' | 'Next' | 'Paused';
  priority: 'Low' | 'Medium' | 'High';
  relatedGoals: string[];
  relatedProjects: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreate {
  name: string;
  status: 'Active' | 'Completed' | 'Next' | 'Paused';
  priority: 'Low' | 'Medium' | 'High';
  objectives: string[];
  startDate?: string;
  dueDate?: string;
  isPublic?: boolean;
  color?: string;
}

export interface Project {
  _id: string;
  userId: string;
  name: string;
  status: 'Active' | 'Completed' | 'Next' | 'Paused';
  priority: 'Low' | 'Medium' | 'High';
  objectives: string[];
  startDate?: string;
  dueDate?: string;
  isPublic?: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  userId: string;
  name: string;
  status: 'Active' | 'Completed' | 'Next' | 'Paused';
  priority: 'Low' | 'Medium' | 'High';
  type: string;
  projectId?: string;
  objectiveId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: string;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  userId: string;
  title: string;
  content: string;
  category: 'Work' | 'Personal' | 'Health' | 'Learning' | 'Ideas' | 'Other';
  tags?: string[];
  isFavorite: boolean;
  isPinned: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  type: 'Task' | 'Meeting' | 'Appointment' | 'Reminder' | 'Event' | 'Deadline';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface StructureCreate {
  name: string;
  levels: string[];
}

export interface Structure {
  _id: string;
  userId: string;
  name: string;
  levels: string[];
  createdAt: string;
  updatedAt: string;
}

// Auth token management
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    // Try to get the error message from the response
    try {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `API request failed: ${response.statusText}`
      );
    } catch (parseError) {
      // If we can't parse the error response, use a generic message
      if (response.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (response.status === 404) {
        throw new Error('Resource not found. Please check your request.');
      } else if (response.status === 422) {
        throw new Error('Invalid data provided. Please check your input.');
      } else {
        throw new Error(`Request failed: ${response.statusText}`);
      }
    }
  }
  return response.json();
};

// Auth API
export const login = async (email: string, password: string) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(response.token);
  return response;
};

export const getStructures = async (): Promise<Structure[]> => {
  return apiRequest('/structures');
};

export const createStructure = async (
  payload: StructureCreate
): Promise<Structure> => {
  return apiRequest('/structures', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateStructure = async (
  id: string,
  payload: Partial<StructureCreate>
): Promise<Structure> => {
  return apiRequest(`/structures/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const getStructureById = async (id: string): Promise<Structure> => {
  return apiRequest(`/structures/${id}`);
};

export const updateStructureLevels = async (
  id: string,
  levels: string[]
): Promise<Structure> => {
  return apiRequest(`/structures/${id}/levels`, {
    method: 'PUT',
    body: JSON.stringify({ levels }),
  });
};

export const deleteStructure = async (id: string): Promise<void> => {
  return apiRequest(`/structures/${id}`, {
    method: 'DELETE',
  });
};

export const signup = async (name: string, email: string, password: string) => {
  const response = await apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setAuthToken(response.token);
  return response;
};

export const logout = () => {
  setAuthToken(null);
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await apiRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return response;
};

export const updateUserProfile = async (name: string) => {
  const response = await apiRequest('/auth/update-profile', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
  return response;
};

// Goals API
export const getGoals = async (): Promise<Goal[]> => {
  return apiRequest('/goals');
};

export const createGoal = async (goal: GoalCreate): Promise<Goal> => {
  return apiRequest('/goals', {
    method: 'POST',
    body: JSON.stringify(goal),
  });
};

export const updateGoal = async (
  id: string,
  goal: GoalCreate
): Promise<Goal> => {
  return apiRequest(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(goal),
  });
};

export const deleteGoal = async (id: string): Promise<void> => {
  return apiRequest(`/goals/${id}`, {
    method: 'DELETE',
  });
};

export const getGoalObjectiveNames = async (): Promise<
  Array<{ _id: string; title: string }>
> => {
  return apiRequest('/goals/objectives/names');
};

// Objectives API
export const getObjectives = async (): Promise<Objective[]> => {
  return apiRequest('/objectives');
};

export const createObjective = async (
  objective: ObjectiveCreate
): Promise<Objective> => {
  return apiRequest('/objectives', {
    method: 'POST',
    body: JSON.stringify(objective),
  });
};

export const updateObjective = async (
  id: string,
  objective: Partial<Objective>
): Promise<Objective> => {
  return apiRequest(`/objectives/${id}`, {
    method: 'PUT',
    body: JSON.stringify(objective),
  });
};

export const deleteObjective = async (id: string): Promise<void> => {
  return apiRequest(`/objectives/${id}`, {
    method: 'DELETE',
  });
};

// Projects API
export const getProjects = async (): Promise<Project[]> => {
  return apiRequest('/projects');
};

export const createProject = async (
  project: ProjectCreate
): Promise<Project> => {
  return apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });
};

export const updateProject = async (
  id: string,
  project: Partial<Project>
): Promise<Project> => {
  return apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  });
};

export const deleteProject = async (id: string): Promise<void> => {
  return apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  });
};

// Tasks API
export const getTasks = async (): Promise<Task[]> => {
  return apiRequest('/tasks');
};

export const createTask = async (
  task: Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Task> => {
  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
};

export const updateTask = async (
  id: string,
  task: Partial<Task>
): Promise<Task> => {
  return apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  });
};

export const deleteTask = async (id: string): Promise<void> => {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  });
};

// Habits API
export const getHabits = async (): Promise<Habit[]> => {
  return apiRequest('/habits');
};

export const createHabit = async (
  habit: Omit<Habit, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Habit> => {
  return apiRequest('/habits', {
    method: 'POST',
    body: JSON.stringify(habit),
  });
};

export const updateHabit = async (
  id: string,
  habit: Partial<Habit>
): Promise<Habit> => {
  return apiRequest(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(habit),
  });
};

export const deleteHabit = async (id: string): Promise<void> => {
  return apiRequest(`/habits/${id}`, {
    method: 'DELETE',
  });
};

export const completeHabit = async (
  id: string,
  date: string
): Promise<Habit> => {
  return apiRequest(`/habits/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ date }),
  });
};

export const uncompleteHabit = async (
  id: string,
  date: string
): Promise<Habit> => {
  return apiRequest(`/habits/${id}/uncomplete`, {
    method: 'POST',
    body: JSON.stringify({ date }),
  });
};

// Notes API
export const getNotes = async (): Promise<Note[]> => {
  return apiRequest('/notes');
};

export const createNote = async (
  note: Omit<Note, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Note> => {
  return apiRequest('/notes', {
    method: 'POST',
    body: JSON.stringify(note),
  });
};

export const updateNote = async (
  id: string,
  note: Partial<Note>
): Promise<Note> => {
  return apiRequest(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(note),
  });
};

export const deleteNote = async (id: string): Promise<void> => {
  return apiRequest(`/notes/${id}`, {
    method: 'DELETE',
  });
};

export const toggleNoteFavorite = async (id: string): Promise<Note> => {
  return apiRequest(`/notes/${id}/favorite`, {
    method: 'PUT',
  });
};

export const toggleNotePinned = async (id: string): Promise<Note> => {
  return apiRequest(`/notes/${id}/pin`, {
    method: 'PUT',
  });
};

export const searchNotes = async (query: string): Promise<Note[]> => {
  return apiRequest(`/notes/search?q=${encodeURIComponent(query)}`);
};

// Events API
export const getEvents = async (
  start?: string,
  end?: string
): Promise<Event[]> => {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  return apiRequest(`/events?${params.toString()}`);
};

export const createEvent = async (
  event: Omit<Event, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Event> => {
  return apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
};

export const updateEvent = async (
  id: string,
  event: Partial<Event>
): Promise<Event> => {
  return apiRequest(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  });
};

export const deleteEvent = async (id: string): Promise<void> => {
  return apiRequest(`/events/${id}`, {
    method: 'DELETE',
  });
};

export const updateEventStatus = async (
  id: string,
  status: Event['status']
): Promise<Event> => {
  return apiRequest(`/events/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// Structure-scoped Notes API
export const getStructureNotes = async (
  structureId: string
): Promise<Note[]> => {
  return apiRequest(`/structures/${structureId}/notes`);
};

export const createStructureNote = async (
  structureId: string,
  note: Omit<Note, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Note> => {
  return apiRequest(`/structures/${structureId}/notes`, {
    method: 'POST',
    body: JSON.stringify(note),
  });
};

export const updateStructureNote = async (
  structureId: string,
  id: string,
  note: Partial<Note>
): Promise<Note> => {
  return apiRequest(`/structures/${structureId}/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(note),
  });
};

export const deleteStructureNote = async (
  structureId: string,
  id: string
): Promise<void> => {
  return apiRequest(`/structures/${structureId}/notes/${id}`, {
    method: 'DELETE',
  });
};

export const toggleStructureNoteFavorite = async (
  structureId: string,
  id: string
): Promise<Note> => {
  return apiRequest(`/structures/${structureId}/notes/${id}/favorite`, {
    method: 'PUT',
  });
};

export const toggleStructureNotePinned = async (
  structureId: string,
  id: string
): Promise<Note> => {
  return apiRequest(`/structures/${structureId}/notes/${id}/pin`, {
    method: 'PUT',
  });
};

export const searchStructureNotes = async (
  structureId: string,
  query: string
): Promise<Note[]> => {
  return apiRequest(
    `/structures/${structureId}/notes/search?q=${encodeURIComponent(query)}`
  );
};

// Structure-scoped Habits API
export const getStructureHabits = async (
  structureId: string
): Promise<Habit[]> => {
  return apiRequest(`/structures/${structureId}/habits`);
};

export const createStructureHabit = async (
  structureId: string,
  habit: Omit<Habit, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Habit> => {
  return apiRequest(`/structures/${structureId}/habits`, {
    method: 'POST',
    body: JSON.stringify(habit),
  });
};

export const updateStructureHabit = async (
  structureId: string,
  id: string,
  habit: Partial<Habit>
): Promise<Habit> => {
  return apiRequest(`/structures/${structureId}/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(habit),
  });
};

export const deleteStructureHabit = async (
  structureId: string,
  id: string
): Promise<void> => {
  return apiRequest(`/structures/${structureId}/habits/${id}`, {
    method: 'DELETE',
  });
};

export const completeStructureHabit = async (
  structureId: string,
  id: string,
  date: string
): Promise<Habit> => {
  return apiRequest(`/structures/${structureId}/habits/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ date }),
  });
};

export const uncompleteStructureHabit = async (
  structureId: string,
  id: string,
  date: string
): Promise<Habit> => {
  return apiRequest(`/structures/${structureId}/habits/${id}/uncomplete`, {
    method: 'POST',
    body: JSON.stringify({ date }),
  });
};

// Structure-scoped Events API
export const getStructureEvents = async (
  structureId: string,
  start?: string,
  end?: string
): Promise<Event[]> => {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  return apiRequest(`/structures/${structureId}/events?${params.toString()}`);
};

export const createStructureEvent = async (
  structureId: string,
  event: Omit<Event, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Event> => {
  return apiRequest(`/structures/${structureId}/events`, {
    method: 'POST',
    body: JSON.stringify(event),
  });
};

export const updateStructureEvent = async (
  structureId: string,
  id: string,
  event: Partial<Event>
): Promise<Event> => {
  return apiRequest(`/structures/${structureId}/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  });
};

export const deleteStructureEvent = async (
  structureId: string,
  id: string
): Promise<void> => {
  return apiRequest(`/structures/${structureId}/events/${id}`, {
    method: 'DELETE',
  });
};

export const updateStructureEventStatus = async (
  structureId: string,
  id: string,
  status: Event['status']
): Promise<Event> => {
  return apiRequest(`/structures/${structureId}/events/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// Types for progress endpoints
export interface ProjectWithProgress extends Project {
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  tasks?: Task[]; // Include associated tasks
}
export interface ProjectProgressSummary {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
}
export interface ObjectiveWithProgress extends Objective {
  projectCount: number;
  progressPercent: number;
}
export interface ObjectiveProgressSummary {
  totalObjectives: number;
  totalProjects: number;
  avgProgressPercent: number;
}
export interface GoalWithProgress extends Goal {
  objectiveCount: number;
  progressPercent: number;
}
export interface GoalProgressSummary {
  totalGoals: number;
  totalObjectives: number;
  avgProgressPercent: number;
}
// Progress endpoints
export const getProjectsWithTaskProgress = async (): Promise<
  ProjectWithProgress[]
> => {
  return apiRequest('/projects/with-task-progress');
};
export const getProjectProgressSummary =
  async (): Promise<ProjectProgressSummary> => {
    return apiRequest('/projects/progress-summary');
  };
export const getObjectivesWithProjectProgress = async (): Promise<
  ObjectiveWithProgress[]
> => {
  return apiRequest('/objectives/with-project-progress');
};
export const getObjectiveProgressSummary =
  async (): Promise<ObjectiveProgressSummary> => {
    return apiRequest('/objectives/progress-summary');
  };
export const getGoalsWithObjectiveProgress = async (): Promise<
  GoalWithProgress[]
> => {
  return apiRequest('/goals/with-objective-progress');
};
export const getGoalProgressSummary =
  async (): Promise<GoalProgressSummary> => {
    return apiRequest('/goals/progress-summary');
  };
