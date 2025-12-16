// AuthLayout is the authenticated shell: header, sidebar, and main content.
// It also owns the Dynamic Structures feature ("Action Zone"):
// - Per-user structures are persisted in localStorage under key: structures:<userId>
// - Each structure has a name and ordered level labels (e.g., ["Goal","Objective",...]).
// - The sidebar lists these structures under Action Zone; expanding a structure reveals its levels.
// - If a structure equals the default [Goal,Objective,Project,Task], level links route to the original static pages.
// - Otherwise, level links route to dynamic pages at /s/:structureId/:levelSlug which render UI based on the selected level.
import React, { ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import SecondarySidebar from '../../components/layout/SubSidebar';
import MainContent from '../MainContent/MainContent';
import CreateStructureModal from '../../components/layout/CreateStructureModal';
import { useAuthLayout } from '../../hooks/useAuthLayout';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const {
    user,
    logout,
    navigate,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    handleSidebarToggle,
    navigation,
    isActive,
    structures,
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
    defaultTemplate,
    resetCreateState,
    handleCreate,
    handleAIAssistance,
  } = useAuthLayout();

  // Auto navigate to structure home when selecting a structure
  useEffect(() => {
    if (selectedStructure && selectedStructure.id) {
      navigate(`/s/${selectedStructure.id}`);
    }
  }, [selectedStructure?.id]);

  if (user?.role === 'admin') {
    return (
      <div className='layout-corporate flex flex-col'>
        <main className='flex-1 flex flex-col items-center justify-center'>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className='layout-corporate'>
      <Header
        user={user}
        onOpenMobileSidebar={() => setSidebarOpen(true)}
        onSettings={() => navigate('/settings')}
        onLogout={() => {
          logout();
          navigate('/login');
        }}
      />

      <div className='flex'>
        {selectedStructure ? (
          <SecondarySidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleSidebarToggle}
            structure={selectedStructure}
            navigation={navigation}
            isActive={isActive}
            slugify={slugify}
            onBack={() => selectStructure(null)}
          />
        ) : (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleSidebarToggle}
            navigation={navigation}
            isActive={isActive}
            structures={structures}
            expandedStructureId={expandedStructureId}
            onToggleExpand={(id) =>
              setExpandedStructureId(expandedStructureId === id ? null : id)
            }
            selectedStructureId={selectedStructureId}
            onSelectStructure={selectStructure}
            isDefaultStructure={isDefaultStructure}
            slugify={slugify}
            onOpenCreate={() => setCreateOpen(true)}
          />
        )}

        <CreateStructureModal
          open={createOpen}
          onOpenChange={(o) => {
            setCreateOpen(o);
            if (!o) resetCreateState();
          }}
          createMode={createMode}
          setCreateMode={setCreateMode}
          structureName={structureName}
          setStructureName={setStructureName}
          aiInput={aiInput}
          setAiInput={setAiInput}
          aiLoading={aiLoading}
          aiError={aiError}
          defaultTemplate={defaultTemplate}
          levelInputs={levelInputs}
          setLevelInputs={setLevelInputs}
          onAskAI={handleAIAssistance}
          onCreate={handleCreate}
          onCancel={() => {
            setCreateOpen(false);
            resetCreateState();
          }}
        />

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='fixed inset-0 flex z-40 md:hidden'
              >
                <div
                  className='fixed inset-0 bg-gray-600 bg-opacity-75'
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className='relative flex-1 flex flex-col max-w-xs w-full bg-surface'
                >
                  <div className='absolute top-0 right-0 -mr-12 pt-2'>
                    <button
                      type='button'
                      className='ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className='h-6 w-6 text-white' />
                    </button>
                  </div>
                  <div className='flex-1 h-0 pt-5 pb-4 overflow-y-auto'>
                    <nav className='mt-5 px-2 space-y-1'>
                      {navigation
                        .filter(
                          (n) =>
                            ![
                              'Goals',
                              'Objectives',
                              'Projects',
                              'Tasks',
                            ].includes(n.name)
                        )
                        .map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`sidebar-corporate-item
                              ${
                                isActive(item.href)
                                  ? 'sidebar-corporate-item-active'
                                  : ''
                              }
                            `}
                            >
                              <Icon
                                className={`mr-4 flex-shrink-0 h-5 w-5 ${
                                  isActive(item.href)
                                    ? 'text-primary-500'
                                    : 'text-text-muted group-hover:text-primary-500'
                                }`}
                              />
                              {item.name}
                            </Link>
                          );
                        })}
                    </nav>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <MainContent
          collapsed={sidebarCollapsed}
          role={user?.role}
        >
          {children}
        </MainContent>
      </div>
    </div>
  );
};

export default AuthLayout;
