import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';

export type CreateMode = 'default' | 'ai' | 'manual';

export interface CreateStructureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createMode: CreateMode;
  setCreateMode: (m: CreateMode) => void;
  structureName: string;
  setStructureName: (v: string) => void;
  aiInput: string;
  setAiInput: (v: string) => void;
  aiLoading: boolean;
  aiError: string | null;
  defaultTemplate: { name: string; levels: string[] };
  levelInputs: string[];
  setLevelInputs: (v: string[]) => void;
  onAskAI: () => void;
  onCreate: () => void;
  onCancel: () => void;
}

const CreateStructureModal: React.FC<CreateStructureModalProps> = ({
  open,
  onOpenChange,
  createMode,
  setCreateMode,
  structureName,
  setStructureName,
  aiInput,
  setAiInput,
  aiLoading,
  aiError,
  defaultTemplate,
  levelInputs,
  setLevelInputs,
  onAskAI,
  onCreate,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Structure</DialogTitle>
          <DialogDescription>
            Choose how you want to create the structure.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex gap-2'>
            <Button
              variant={createMode === 'default' ? 'primary' : 'secondary'}
              onClick={() => setCreateMode('default')}
            >
              Default
            </Button>
            <Button
              variant={createMode === 'ai' ? 'primary' : 'secondary'}
              onClick={() => setCreateMode('ai')}
            >
              AI Assist
            </Button>
            <Button
              variant={createMode === 'manual' ? 'primary' : 'secondary'}
              onClick={() => setCreateMode('manual')}
            >
              Manual
            </Button>
          </div>

          <div className='space-y-3'>
            <Input
              value={structureName}
              onChange={(e) => setStructureName(e.target.value)}
              placeholder='Structure name'
            />

            {createMode === 'default' && (
              <div className='text-sm text-gray-600'>
                Default levels will be used:{' '}
                {defaultTemplate.levels.join(' → ')}
              </div>
            )}

            {createMode === 'ai' && (
              <div className='space-y-2'>
                <Input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder='Describe what you want to organize (e.g., I want to organize my university studies)'
                />
                <Button
                  onClick={onAskAI}
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Analyzing...' : 'Get suggestion'}
                </Button>
                {aiError && (
                  <div className='text-sm text-red-600'>{aiError}</div>
                )}
              </div>
            )}

            {(createMode === 'manual' || createMode === 'ai') && (
              <div className='space-y-2'>
                <div className='text-sm text-gray-700'>Levels</div>
                {levelInputs.map((lv, i) => (
                  <Input
                    key={i}
                    value={lv}
                    onChange={(e) => {
                      const next = [...levelInputs];
                      next[i] = e.target.value;
                      setLevelInputs(next);
                    }}
                    placeholder={`Level ${i + 1}`}
                  />
                ))}
                <div className='flex gap-2'>
                  <Button
                    variant='secondary'
                    onClick={() => setLevelInputs([...levelInputs, ''])}
                  >
                    Add level
                  </Button>
                  {levelInputs.length > 1 && (
                    <Button
                      variant='secondary'
                      onClick={() => setLevelInputs(levelInputs.slice(0, -1))}
                    >
                      Remove last level
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='secondary'
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button onClick={onCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStructureModal;
