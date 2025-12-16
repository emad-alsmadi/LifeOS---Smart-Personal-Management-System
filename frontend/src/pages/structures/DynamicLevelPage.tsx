/**
 * DynamicLevelPage
 * Renders a generic page for any custom structure level defined by the user.
 * - URL: /s/:structureId/:levelSlug
 * - Reads the structure from localStorage (scoped by user) and resolves the level by its slug.
 * - Mirrors the UX of static pages (Goals/Objectives/Projects/Tasks) with dynamic labels, colors, and icons.
 * - Reuses existing creation modals and API calls depending on the level index (0..3).
 *   index 0 -> Goals, 1 -> Objectives, 2 -> Projects, 3 -> Tasks
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Goal as GoalIcon,
  Eye,
  FolderOpen as FolderIcon,
  CheckSquare,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import GoalModal from '../goals/GoalModal';
import ObjectiveModal from '../objectives/ObjectiveModal';
import ProjectModal from '../projects/ProjectModal';
import TaskModal from '../tasks/TaskModal';
import {
  getGoals,
  createGoal,
  type Goal,
  type GoalCreate,
  getObjectives,
  createObjective,
  type Objective,
  type ObjectiveCreate,
  getProjects,
  type Project,
  getTasks,
  createTask,
  type Task,
  getStructureById,
  type Structure as ApiStructure,
} from '../../lib/api/api';

// Minimal structure shape as stored in localStorage by AuthLayout
interface Structure {
  id: string;
  name: string;
  levels: string[];
}

// Simple palette per level index to keep visual distinction consistent
const palette = [
  {
    from: 'from-blue-500',
    to: 'to-indigo-500',
    text: 'text-blue-600',
    icon: GoalIcon,
  },
  {
    from: 'from-purple-500',
    to: 'to-pink-500',
    text: 'text-purple-600',
    icon: Eye,
  },
  {
    from: 'from-indigo-500',
    to: 'to-cyan-500',
    text: 'text-indigo-600',
    icon: FolderIcon,
  },
  {
    from: 'from-green-500',
    to: 'to-emerald-500',
    text: 'text-green-600',
    icon: CheckSquare,
  },
];

const DynamicLevelPage: React.FC = () => {
  const { structureId, levelSlug } = useParams();
  const { user } = useAuth();
  // Generic items storage key for dynamic levels >= 4
  const genericKey = useMemo(
    () =>
      user?._id && structureId && levelSlug
        ? `generic:${user._id}:${structureId}:${levelSlug}`
        : null,
    [user?._id, structureId, levelSlug]
  );

  // Current structure, resolved level name and its index in the levels array
  const [structure, setStructure] = useState<Structure | null>(null);
  const [levelName, setLevelName] = useState<string>('');
  const [levelIndex, setLevelIndex] = useState<number>(0);

  // data for lists
  const [goals, setGoals] = useState<Goal[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  // Generic items (for levels index >= 4)
  const [genericItems, setGenericItems] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [genericFormOpen, setGenericFormOpen] = useState(false);
  const [genericName, setGenericName] = useState('');

  // modals
  // Creation modals toggle per entity type
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [objectiveModalOpen, setObjectiveModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Slugify helper (must match the one used by AuthLayout to link levels)
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '');

  // Resolve structure and level from URL params
  useEffect(() => {
    const loadStructure = async () => {
      if (!structureId) return;
      try {
        const apiStructure: ApiStructure = await getStructureById(structureId);
        const s: Structure = {
          id: apiStructure._id,
          name: apiStructure.name,
          levels: Array.isArray(apiStructure.levels) ? apiStructure.levels : [],
        };
        setStructure(s);
        const idx = s.levels.findIndex((l) => slugify(l) === (levelSlug || ''));
        const name = idx >= 0 ? s.levels[idx] : '';
        setLevelIndex(idx >= 0 ? idx : 0);
        setLevelName(name);
      } catch {}
    };
    loadStructure();
  }, [structureId, levelSlug]);

  // Load list data for the current level (reuses existing entity APIs)
  useEffect(() => {
    const load = async () => {
      if (levelName === '') return;
      setLoading(true);
      try {
        if (levelIndex === 0) {
          setGoals(await getGoals());
        } else if (levelIndex === 1) {
          setObjectives(await getObjectives());
        } else if (levelIndex === 2) {
          setProjects(await getProjects());
        } else if (levelIndex === 3) {
          setTasks(await getTasks());
        } else if (levelIndex >= 4) {
          // Generic levels: load from localStorage
          if (genericKey) {
            const raw = localStorage.getItem(genericKey);
            setGenericItems(raw ? JSON.parse(raw) : []);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [levelIndex, levelName, genericKey]);

  // Save a generic item
  const saveGenericItem = () => {
    const name = genericName.trim();
    if (!name || !genericKey) return;
    const next = [...genericItems, { id: crypto.randomUUID(), name }];
    setGenericItems(next);
    try {
      localStorage.setItem(genericKey, JSON.stringify(next));
    } catch {}
    setGenericName('');
    setGenericFormOpen(false);
  };

  if (!structure || !levelName) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='py-16 text-center text-gray-600'>
          Structure not found or level invalid.
        </div>
      </div>
    );
  }

  const headerPalette = palette[levelIndex % palette.length];
  const IconComp = headerPalette.icon;

  const pluralize = (s: string) => {
    if (!s) return s;
    // If contains Arabic characters, don't attempt English pluralization
    const hasArabic = /[\u0600-\u06FF]/.test(s);
    if (hasArabic) return s;
    const lower = s.toLowerCase();
    if (lower.endsWith('s')) return s;
    return s + 's';
  };

  const level0 = structure?.levels?.[0] || 'Goal';
  const level1 = structure?.levels?.[1] || 'Objective';
  const level2 = structure?.levels?.[2] || 'Project';
  const level3 = structure?.levels?.[3] || 'Task';

  // Open the relevant creation modal based on the level index
  const openCreate = () => {
    if (levelIndex === 0) setGoalModalOpen(true);
    else if (levelIndex === 1) setObjectiveModalOpen(true);
    else if (levelIndex === 2) setProjectModalOpen(true);
    else if (levelIndex === 3) setTaskModalOpen(true);
    else setGenericFormOpen(true);
  };

  // Reload the current level list after a create action
  const reload = async () => {
    if (levelIndex === 0) setGoals(await getGoals());
    else if (levelIndex === 1) setObjectives(await getObjectives());
    else if (levelIndex === 2) setProjects(await getProjects());
    else if (levelIndex === 3) setTasks(await getTasks());
    else if (levelIndex >= 4 && genericKey) {
      const raw = localStorage.getItem(genericKey);
      setGenericItems(raw ? JSON.parse(raw) : []);
    }
  };

  // Create callbacks passed to modals (mirror static pages behavior)
  const handleGoalSave = async (
    data: GoalCreate & { selectedObjectiveIds?: string[] }
  ) => {
    await createGoal({
      name: data.name,
      status: data.status,
      category: data.category,
      objectives: Array.isArray(data.objectives)
        ? (data.objectives as any)
        : [],
    });
    setGoalModalOpen(false);
    await reload();
  };

  const handleObjectiveSave = async (
    data: ObjectiveCreate & { selectedProjectIds?: string[] }
  ) => {
    await createObjective({
      title: data.title,
      status: data.status,
      priority: data.priority,
      relatedGoals: data.relatedGoals || [],
      relatedProjects: data.relatedProjects || [],
    });
    setObjectiveModalOpen(false);
    await reload();
  };

  const handleTaskSave = async (
    payload: Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    await createTask(payload);
    setTaskModalOpen(false);
    await reload();
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='space-y-8'
      >
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <div className='flex items-center space-x-3 mb-2'>
              <div
                className={`p-3 bg-gradient-to-br ${headerPalette.from} ${headerPalette.to} rounded-xl shadow-lg`}
              >
                <IconComp className='w-8 h-8 text-white' />
              </div>
              <h1
                className={`text-4xl font-bold bg-gradient-to-r ${headerPalette.from} ${headerPalette.to} bg-clip-text text-transparent`}
              >
                {levelName}
              </h1>
            </div>
            <p className='text-lg text-gray-600'>
              Manage {levelName} in structure "{structure.name}".
            </p>
          </div>
          <Button
            onClick={openCreate}
            className={`bg-gradient-to-r ${headerPalette.from} ${headerPalette.to} text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
            size='lg'
          >
            <Plus className='w-5 h-5 mr-2' />
            Create {levelName}
          </Button>
        </div>

        {/* Simple list placeholder that mirrors basic card layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {loading && (
            <Card className='p-8'>
              <div className='text-center text-gray-500'>Loading...</div>
            </Card>
          )}
          {!loading &&
            levelIndex === 0 &&
            goals.map((g) => (
              <Card
                key={g._id}
                className='p-6 border border-gray-100 hover:shadow-md transition-all duration-200'
              >
                <div className='font-bold text-gray-900 mb-1'>{g.name}</div>
                <div className='text-sm text-gray-600'>Status: {g.status}</div>
              </Card>
            ))}
          {!loading &&
            levelIndex === 1 &&
            objectives.map((o) => (
              <Card
                key={o._id}
                className='p-6 border border-gray-100 hover:shadow-md transition-all duration-200'
              >
                <div className='font-bold text-gray-900 mb-1'>{o.title}</div>
                <div className='text-sm text-gray-600'>Status: {o.status}</div>
              </Card>
            ))}
          {!loading &&
            levelIndex === 2 &&
            projects.map((p) => (
              <Card
                key={p._id}
                className='p-6 border border-gray-100 hover:shadow-md transition-all duration-200'
              >
                <div className='font-bold text-gray-900 mb-1'>{p.name}</div>
                <div className='text-sm text-gray-600'>Status: {p.status}</div>
              </Card>
            ))}
          {!loading &&
            levelIndex === 3 &&
            tasks.map((t) => (
              <Card
                key={t._id}
                className='p-6 border border-gray-100 hover:shadow-md transition-all duration-200'
              >
                <div className='font-bold text-gray-900 mb-1'>{t.name}</div>
                <div className='text-sm text-gray-600'>Status: {t.status}</div>
              </Card>
            ))}
          {/* Generic levels (index >= 4): simple local list */}
          {!loading && levelIndex >= 4 && genericFormOpen && (
            <Card className='p-6 border border-gray-100'>
              <div className='font-semibold text-gray-900 mb-3'>
                Create {levelName}
              </div>
              <div className='flex flex-col sm:flex-row gap-3'>
                <Input
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder={`Enter ${levelName} name`}
                />
                <div className='flex gap-2'>
                  <Button
                    onClick={saveGenericItem}
                    disabled={!genericName.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setGenericFormOpen(false);
                      setGenericName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {!loading &&
            levelIndex >= 4 &&
            genericItems.map((it) => (
              <Card
                key={it.id}
                className='p-6 border border-gray-100 hover:shadow-md transition-all duration-200'
              >
                <div className='font-bold text-gray-900 mb-1'>{it.name}</div>
              </Card>
            ))}
          {!loading &&
            ((levelIndex === 0 && goals.length === 0) ||
              (levelIndex === 1 && objectives.length === 0) ||
              (levelIndex === 2 && projects.length === 0) ||
              (levelIndex === 3 && tasks.length === 0) ||
              (levelIndex >= 4 && genericItems.length === 0)) && (
              <Card className='p-8 col-span-full'>
                <div className='text-center text-gray-500'>
                  No {levelName} yet.
                </div>
              </Card>
            )}
        </div>
      </motion.div>

      {/* Modals (reusing existing entity modals to preserve UX parity) */}
      <GoalModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={handleGoalSave}
        goal={null}
        labels={{
          entity: level0,
          entityPlural: pluralize(level0),
          child: level1,
          childPlural: pluralize(level1),
        }}
      />
      <ObjectiveModal
        open={objectiveModalOpen}
        onClose={() => setObjectiveModalOpen(false)}
        onSave={handleObjectiveSave}
        objective={null}
        labels={{
          entity: level1,
          entityPlural: pluralize(level1),
          parent: level0,
          parentPlural: pluralize(level0),
          child: level2,
          childPlural: pluralize(level2),
        }}
      />
      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={() => {
          setProjectModalOpen(false);
          reload();
        }}
        project={null}
        labels={{
          entity: level2,
          entityPlural: pluralize(level2),
          parent: level1,
          parentPlural: pluralize(level1),
          child: level3,
          childPlural: pluralize(level3),
        }}
      />
      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleTaskSave}
        task={null}
        labels={{
          entity: level3,
          entityPlural: pluralize(level3),
          parent: level2,
          parentPlural: pluralize(level2),
        }}
      />
    </div>
  );
};

export default DynamicLevelPage;
