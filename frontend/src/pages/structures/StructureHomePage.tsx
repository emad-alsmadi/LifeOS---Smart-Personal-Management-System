import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Dashboard from '../Dashboard/Dashboard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import {
  deleteStructure as apiDeleteStructure,
  getStructureById,
} from '../../lib/api/api';

const StructureHomePage: React.FC = () => {
  const { structureId } = useParams();
  const { updateLevels, structures, setStructures, selectStructure, navigate } =
    useAuthLayout();

  const [levels, setLevels] = useState<string[]>([]);
  const [name, setName] = useState<string>('');
  const isReady = useMemo(() => Boolean(structureId), [structureId]);

  useEffect(() => {
    const sync = async () => {
      if (!structureId) return;
      const local = structures.find((s) => s.id === structureId) || null;
      if (local) {
        setName(local.name);
        setLevels(Array.isArray(local.levels) ? local.levels : []);
      } else {
        const fetched = await getStructureById(structureId);
        setName(fetched.name);
        setLevels(Array.isArray(fetched.levels) ? fetched.levels : []);
      }
    };
    sync();
  }, [structureId, structures]);

  const handleSave = async () => {
    if (!structureId) return;
    const clean = (levels || [])
      .map((l) => String(l ?? '').trim())
      .filter(Boolean);
    await updateLevels(structureId, clean);
  };

  const handleDelete = async () => {
    if (!structureId) return;
    await apiDeleteStructure(structureId);
    setStructures((structures || []).filter((s) => s.id !== structureId));
    selectStructure(null);
    navigate('/dashboard');
  };

  return (
    <div className='space-y-6'>
      {isReady && (
        <div className='max-w-4xl mx-auto p-4 border border-gray-200 rounded-xl bg-white'>
          <div className='flex items-center justify-between mb-4'>
            <div className='text-lg font-bold'>{name || 'Structure'}</div>
            <div className='flex gap-2'>
              <Button onClick={handleSave}>Save Levels</Button>
              <Button
                variant='secondary'
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
          <div className='space-y-2'>
            {levels.map((lv, i) => (
              <Input
                key={i}
                value={lv}
                onChange={(e) => {
                  const next = [...levels];
                  next[i] = e.target.value;
                  setLevels(next);
                }}
                placeholder={`Level ${i + 1}`}
              />
            ))}
            <div className='flex gap-2'>
              <Button
                variant='secondary'
                onClick={() => setLevels([...levels, ''])}
              >
                Add level
              </Button>
              {levels.length > 1 && (
                <Button
                  variant='secondary'
                  onClick={() => setLevels(levels.slice(0, -1))}
                >
                  Remove last level
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      <Dashboard />
    </div>
  );
};

export default StructureHomePage;
