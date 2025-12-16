import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  Eye,
  FileText,
  FolderOpen,
  Goal,
  Settings,
  Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApiCalls } from './useApiCalls';
import {
  getStructures as apiGetStructures,
  createStructure as apiCreateStructure,
  updateStructureLevels as apiUpdateStructureLevels,
  deleteStructure as apiDeleteStructure,
  type Structure as ApiStructure,
} from '../lib/api/api';

export type IconType = React.ComponentType<{ className?: string }>;

export interface NavigationItem {
  name: string;
  href: string;
  icon: IconType;
  roles: Array<'user' | 'admin'>;
}

export type CreateMode = 'default' | 'ai' | 'manual';

export interface Structure {
  id: string;
  name: string;
  levels: string[];
}

export interface UseAuthLayoutResult {
  user: any;
  logout: () => void;
  locationPath: string;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  sidebarCollapsed: boolean;
  handleSidebarToggle: () => void;
  navigation: NavigationItem[];
  isActive: (href: string) => boolean;
  storageKey: string | null;
  structures: Structure[];
  setStructures: (s: Structure[]) => void;
  persistStructures: (s: Structure[]) => void;
  expandedStructureId: string | null;
  setExpandedStructureId: (id: string | null) => void;
  selectedStructureId: string | null;
  selectStructure: (id: string | null) => void;
  selectedStructure: Structure | null;
  isDefaultStructure: (s: Structure) => boolean;
  slugify: (s: string) => string;
  createOpen: boolean;
  setCreateOpen: (v: boolean) => void;
  createMode: CreateMode;
  setCreateMode: (m: CreateMode) => void;
  structureName: string;
  setStructureName: (v: string) => void;
  levelInputs: string[];
  setLevelInputs: (v: string[]) => void;
  aiInput: string;
  setAiInput: (v: string) => void;
  aiLoading: boolean;
  aiError: string | null;
  setAiError: (v: string | null) => void;
  defaultTemplate: { name: string; levels: string[] };
  resetCreateState: () => void;
  handleCreate: () => void;
  handleAIAssistance: () => Promise<void>;
  updateLevels: (structureId: string, levels: string[]) => Promise<void>;
  deleteStructure: (structureId: string) => Promise<void>;
  navigate: ReturnType<typeof useNavigate>;
}

export function useAuthLayout(): UseAuthLayoutResult {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { suggestStructure } = useApiCalls();

  const storageKey = useMemo(
    () => (user?._id ? `structures:${user._id}` : null),
    [user?._id]
  );
  const [structures, _setStructures] = useState<Structure[]>([]);
  const [expandedStructureId, setExpandedStructureId] = useState<string | null>(
    null
  );
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      try {
        const list: ApiStructure[] = await apiGetStructures();
        _setStructures(
          (list || []).map((s) => ({
            id: s._id,
            name: s.name,
            levels: Array.isArray(s.levels) ? s.levels : [],
          }))
        );
      } catch {}
      try {
        if (storageKey) {
          const sel = localStorage.getItem(`${storageKey}:selected`);
          if (sel) setSelectedStructureId(sel);
        }
      } catch {}
    };
    if (user?._id) load();
  }, [user?._id, storageKey]);

  const setStructures = (next: Structure[]) => _setStructures(next);

  const persistStructures = (next: Structure[]) => {
    _setStructures(next);
  };

  const selectStructure = (id: string | null) => {
    setSelectedStructureId(id);
    if (storageKey) {
      if (id) localStorage.setItem(`${storageKey}:selected`, id);
      else localStorage.removeItem(`${storageKey}:selected`);
    }
  };

  const selectedStructure = useMemo(
    () => structures.find((s) => s.id === selectedStructureId) || null,
    [structures, selectedStructureId]
  );

  const isDefaultStructure = (s: Structure) =>
    s.levels.map((l) => l.toLowerCase()).join('|') ===
    ['goal', 'objective', 'project', 'task'].join('|');

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '');

  const baseNavigation: NavigationItem[] = [
    {
      name: 'Action Zone',
      href: '/dashboard',
      icon: BarChart3,
      roles: ['user', 'admin'],
    },
    { name: 'Goals', href: '/goals', icon: Goal, roles: ['user'] },
    { name: 'Objectives', href: '/objectives', icon: Eye, roles: ['user'] },
    { name: 'Projects', href: '/projects', icon: FolderOpen, roles: ['user'] },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare, roles: ['user'] },
    { name: 'Habits', href: '/habits', icon: Calendar, roles: ['user'] },
    { name: 'Calendar', href: '/calendar', icon: Calendar, roles: ['user'] },
    { name: 'Notes', href: '/notes', icon: FileText, roles: ['user'] },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['user', 'admin'],
    },
    {
      name: 'Admin Dashboard',
      href: '/admin-dashboard',
      icon: Shield,
      roles: ['admin'],
    },
  ];

  const role: 'user' | 'admin' = user?.role === 'admin' ? 'admin' : 'user';
  const navigation = baseNavigation.filter((item) => item.roles.includes(role));

  const isActive = (href: string) => location.pathname === href;

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => {
      localStorage.setItem('sidebarCollapsed', String(!prev));
      return !prev;
    });
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>('default');
  const [structureName, setStructureName] = useState('');
  const [levelInputs, setLevelInputs] = useState<string[]>(['', '', '']);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const defaultTemplate = useMemo(
    () => ({
      name: 'Default Structure',
      levels: ['Goal', 'Objective', 'Project', 'Task'],
    }),
    []
  );

  const resetCreateState = () => {
    setCreateMode('default');
    setStructureName('');
    setLevelInputs(['', '', '']);
    setAiInput('');
    setAiLoading(false);
    setAiError(null);
  };

  const handleCreate = async () => {
    let name = structureName.trim();
    let levels: string[] = [];
    if (createMode === 'default') {
      name = name || defaultTemplate.name;
      levels = defaultTemplate.levels;
    } else {
      levels = (levelInputs || [])
        .map((l) => String(l ?? '').trim())
        .filter(Boolean);
    }
    if (!name || levels.length === 0) return;
    try {
      const created = await apiCreateStructure({ name, levels });
      const mapped: Structure = {
        id: created._id,
        name: created.name,
        levels: Array.isArray(created.levels) ? created.levels : [],
      };
      setStructures([...(structures || []), mapped]);
    } finally {
      setCreateOpen(false);
      resetCreateState();
    }
  };

  const handleAIAssistance = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      if (!aiInput.trim()) {
        alert('الرجاء إدخال وصف للهدف أولاً');
        return;
      }
      const suggestion = await suggestStructure(aiInput);
      if (suggestion?.levels?.length) {
        setStructureName(
          suggestion.name || suggestion.templateName || 'Custom Structure'
        );
        setLevelInputs(suggestion.levels);
      } else {
        setAiError('Failed to get a suitable suggestion.');
      }
    } catch (e) {
      setAiError('حدث خطأ في توليد الاقتراحات');
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, suggestStructure]);

  const updateLevels = async (structureId: string, levels: string[]) => {
    const updated = await apiUpdateStructureLevels(structureId, levels);
    setStructures(
      (structures || []).map((s) =>
        s.id === structureId
          ? {
              id: updated._id,
              name: updated.name,
              levels: Array.isArray(updated.levels) ? updated.levels : [],
            }
          : s
      )
    );
  };

  const deleteStructure = async (structureId: string) => {
    await apiDeleteStructure(structureId);
    setStructures((structures || []).filter((s) => s.id !== structureId));
    if (selectedStructureId === structureId) selectStructure(null);
  };

  return {
    user,
    logout,
    locationPath: location.pathname,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    handleSidebarToggle,
    navigation,
    isActive,
    storageKey,
    structures,
    setStructures,
    persistStructures,
    expandedStructureId,
    setExpandedStructureId,
    selectedStructureId,
    selectStructure,
    selectedStructure,
    isDefaultStructure,
    slugify,
    createOpen,
    setCreateOpen,
    createMode,
    setCreateMode,
    structureName,
    setStructureName,
    levelInputs,
    setLevelInputs,
    aiInput,
    setAiInput,
    aiLoading,
    aiError,
    setAiError,
    defaultTemplate,
    resetCreateState,
    handleCreate,
    handleAIAssistance,
    updateLevels,
    deleteStructure,
    navigate,
  };
}
