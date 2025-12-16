import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Goal,
  ArrowRight,
  ListChecks,
  FolderOpen,
  CheckSquare,
  TrendingUp,
  Calendar,
  BookOpen,
  Repeat,
  Users,
  BarChart3,
  Zap,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Play,
  Target,
} from 'lucide-react';

import StructureVisualizer from '../components/landing/StructureVisualizer';
import AIDemoInterface from '../components/landing/AIDemoInterface';
import FeatureComparison from '../components/landing/FeatureComparison';
import DynamicCardGrid from '../components/landing/DynamicCardGrid';

const features = [
  {
    icon: <Goal className='w-8 h-8' />,
    title: 'Goal Management',
    desc: 'Set strategic goals with clear objectives, track progress, and celebrate achievements.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: <ListChecks className='w-8 h-8' />,
    title: 'Objective Planning',
    desc: 'Break down goals into actionable objectives with priority levels and status tracking.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: <FolderOpen className='w-8 h-8' />,
    title: 'Project Organization',
    desc: 'Manage complex projects with deadlines, team collaboration, and progress visualization.',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: <CheckSquare className='w-8 h-8' />,
    title: 'Task Management',
    desc: 'Create, assign, and track tasks with priorities, statuses, and completion tracking.',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: <Repeat className='w-8 h-8' />,
    title: 'Habit Building',
    desc: 'Build lasting habits with streak tracking, daily reminders, and progress analytics.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: <Calendar className='w-8 h-8' />,
    title: 'Calendar Integration',
    desc: 'View tasks, events, and deadlines in a beautiful, interactive calendar interface.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: <BookOpen className='w-8 h-8' />,
    title: 'Note Taking',
    desc: 'Capture ideas, thoughts, and important information with rich text notes and categories.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: <BarChart3 className='w-8 h-8' />,
    title: 'Analytics Dashboard',
    desc: 'Track progress with detailed analytics, charts, and performance insights.',
    color: 'from-cyan-500 to-blue-600',
  },
];

const benefits = [
  {
    icon: <Zap className='w-6 h-6 text-yellow-500' />,
    title: 'Boost Productivity',
    desc: 'Streamline workflows and accomplish more with organized task management.',
  },
  {
    icon: <Target className='w-6 h-6 text-green-500' />,
    title: 'Achieve Goals Faster',
    desc: 'Break down big goals into manageable steps and track progress daily.',
  },
  {
    icon: <Shield className='w-6 h-6 text-blue-500' />,
    title: 'Stay Organized',
    desc: 'Keep all your life areas organized in one comprehensive system.',
  },
  {
    icon: <Clock className='w-6 h-6 text-purple-500' />,
    title: 'Save Time',
    desc: 'Eliminate chaos and focus on what matters most with smart prioritization.',
  },
];

const hierarchySteps = [
  {
    icon: <Goal className='w-10 h-10 text-blue-600' />,
    title: 'Goal',
    desc: 'Your big-picture vision and long-term aspirations',
  },
  {
    icon: <ChevronRight className='w-6 h-6 text-gray-400' />,
    title: '',
    desc: '',
  },
  {
    icon: <ListChecks className='w-10 h-10 text-purple-600' />,
    title: 'Objective',
    desc: 'Specific milestones that support your goals',
  },
  {
    icon: <ChevronRight className='w-6 h-6 text-gray-400' />,
    title: '',
    desc: '',
  },
  {
    icon: <FolderOpen className='w-10 h-10 text-indigo-600' />,
    title: 'Project',
    desc: 'Organized work streams with deadlines and teams',
  },
  {
    icon: <ChevronRight className='w-6 h-6 text-gray-400' />,
    title: '',
    desc: '',
  },
  {
    icon: <CheckSquare className='w-10 h-10 text-green-600' />,
    title: 'Task',
    desc: 'Individual actionable items with priorities',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    content:
      'This platform transformed how I manage my team and personal goals. Everything is finally organized!',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Michael Chen',
    role: 'Software Developer',
    content:
      'The habit tracking and goal management features helped me build a consistent routine. Highly recommended!',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Director',
    content:
      'Love how I can connect my goals to daily tasks. It keeps me motivated and on track.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
];

const demoSteps = [
  {
    step: 1,
    title: 'Create Your Goal',
    description: 'Start with your big-picture vision',
    example: 'Launch a successful e-commerce business',
    icon: <Goal className='w-8 h-8 text-blue-600' />,
    mockup: (
      <div className='bg-white rounded-lg p-4 shadow-md border border-gray-200'>
        <div className='flex items-center space-x-3 mb-3'>
          <Goal className='w-5 h-5 text-blue-600' />
          <span className='font-semibold text-gray-900'>New Goal</span>
        </div>
        <div className='space-y-3'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Title
            </label>
            <input
              type='text'
              value='Launch a successful e-commerce business'
              className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900'
              readOnly
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              value='Build and launch an online store that generates $50K monthly revenue within 12 months'
              className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm'
              rows={2}
              readOnly
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Priority
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900'>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status
              </label>
              <select className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900'>
                <option>Active</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 2,
    title: 'Add Objectives',
    description: 'Break down your goal into actionable objectives',
    example: 'Market Research, Website Development, Marketing Strategy',
    icon: <ListChecks className='w-8 h-8 text-purple-600' />,
    mockup: (
      <div className='bg-white rounded-lg p-4 shadow-md border border-gray-200'>
        <div className='flex items-center space-x-3 mb-3'>
          <ListChecks className='w-5 h-5 text-purple-600' />
          <span className='font-semibold text-gray-900'>
            Objectives for Goal
          </span>
        </div>
        <div className='space-y-3'>
          <div className='flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200'>
            <input
              type='checkbox'
              checked
              readOnly
              className='w-4 h-4 text-purple-600'
            />
            <div className='flex-1'>
              <div className='font-medium text-gray-900'>
                Conduct Market Research
              </div>
              <div className='text-sm text-gray-600'>
                Analyze competitors and target audience
              </div>
            </div>
            <span className='text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full'>
              High
            </span>
          </div>
          <div className='flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200'>
            <input
              type='checkbox'
              checked
              readOnly
              className='w-4 h-4 text-purple-600'
            />
            <div className='flex-1'>
              <div className='font-medium text-gray-900'>Develop Website</div>
              <div className='text-sm text-gray-600'>
                Build e-commerce platform
              </div>
            </div>
            <span className='text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full'>
              High
            </span>
          </div>
          <div className='flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200'>
            <input
              type='checkbox'
              readOnly
              className='w-4 h-4 text-purple-600'
            />
            <div className='flex-1'>
              <div className='font-medium text-gray-900'>
                Create Marketing Strategy
              </div>
              <div className='text-sm text-gray-600'>
                Plan digital marketing campaigns
              </div>
            </div>
            <span className='text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full'>
              Medium
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 3,
    title: 'Create Projects',
    description: 'Organize work into projects under each objective',
    example: 'Competitor Analysis, Frontend Development, SEO Campaign',
    icon: <FolderOpen className='w-8 h-8 text-indigo-600' />,
    mockup: (
      <div className='bg-white rounded-lg p-4 shadow-md border border-gray-200'>
        <div className='flex items-center space-x-3 mb-3'>
          <FolderOpen className='w-5 h-5 text-indigo-600' />
          <span className='font-semibold text-gray-900'>
            Projects for "Conduct Market Research"
          </span>
        </div>
        <div className='space-y-3'>
          <div className='p-3 bg-indigo-50 rounded-lg border border-indigo-200'>
            <div className='flex items-center justify-between mb-2'>
              <div className='font-medium text-gray-900'>
                Competitor Analysis
              </div>
              <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
                75%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
              <div
                className='bg-green-500 h-2 rounded-full'
                style={{ width: '75%' }}
              ></div>
            </div>
            <div className='text-sm text-gray-600'>Due: March 15, 2024</div>
          </div>
          <div className='p-3 bg-indigo-50 rounded-lg border border-indigo-200'>
            <div className='flex items-center justify-between mb-2'>
              <div className='font-medium text-gray-900'>Customer Survey</div>
              <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                Active
              </span>
            </div>
            <div className='text-sm text-gray-600'>Due: March 30, 2024</div>
          </div>
          <div className='p-3 bg-indigo-50 rounded-lg border border-indigo-200'>
            <div className='flex items-center justify-between mb-2'>
              <div className='font-medium text-gray-900'>
                Market Trends Report
              </div>
              <span className='text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full'>
                Planned
              </span>
            </div>
            <div className='text-sm text-gray-600'>Due: April 15, 2024</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    title: 'Manage Tasks',
    description: 'Break projects into individual actionable tasks',
    example:
      'Research top 10 competitors, Create survey questions, Analyze data',
    icon: <CheckSquare className='w-8 h-8 text-green-600' />,
    mockup: (
      <div className='bg-white rounded-lg p-4 shadow-md border border-gray-200'>
        <div className='flex items-center space-x-3 mb-3'>
          <CheckSquare className='w-5 h-5 text-green-600' />
          <span className='font-semibold text-gray-900'>
            Tasks for "Competitor Analysis"
          </span>
        </div>
        <div className='space-y-2'>
          <div className='flex items-center space-x-3 p-2 bg-green-50 rounded-lg'>
            <input
              type='checkbox'
              checked
              readOnly
              className='w-4 h-4 text-green-600'
            />
            <div className='flex-1'>
              <div className='font-medium text-gray-900'>
                Research top 10 competitors
              </div>
              <div className='text-sm text-gray-600'>
                Identify main competitors in the market
              </div>
            </div>
            <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
              Completed
            </span>
          </div>
          <div className='flex items-center space-x-3 p-2 bg-green-50 rounded-lg'>
            <input
              type='checkbox'
              checked
              readOnly
              className='w-4 h-4 text-green-600'
            />
            <div className='flex-1'>
              <div className='font-medium text-gray-900'>
                Analyze pricing strategies
              </div>
              <div className='text-sm text-gray-600'>
                Compare pricing models and strategies
              </div>
            </div>
            <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
              Completed
            </span>
          </div>
          <div className='flex items-center space-x-3 p-2 bg-green-50 rounded-lg'>
            <input
              type='checkbox'
              readOnly
              className='w-4 h-4 text-green-600'
            />
            <div className='flex-1'>
              <div className='font-medium text-gray-900'>
                Create competitive analysis report
              </div>
              <div className='text-sm text-gray-600'>
                Document findings and insights
              </div>
            </div>
            <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
              In Progress
            </span>
          </div>
          <div className='flex items-center space-x-3 p-2 bg-green-50 rounded-lg'>
            <input
              type='checkbox'
              readOnly
              className='w-4 h-4 text-green-600'
            />
            <div className='flex-1'>
              <div className='font-medium text-gray-900'>
                Present findings to team
              </div>
              <div className='text-sm text-gray-600'>
                Share insights with stakeholders
              </div>
            </div>
            <span className='text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full'>
              Planned
            </span>
          </div>
        </div>
      </div>
    ),
  },
];

const Visitor: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const t = useMemo(
    () => ({
      heroTitle:
        lang === 'en'
          ? 'Design your life’s architecture with AI'
          : 'صمّم معمار حياتك بمساعدة الذكاء الاصطناعي',
      heroSub:
        lang === 'en'
          ? 'Plan, Execute, and Evolve with AI Guidance'
          : 'خطّط ونفّذ وتطوّر بإرشاد الذكاء الاصطناعي',
      ctaPrimary:
        lang === 'en'
          ? 'Start Building Your First Smart Structure'
          : 'ابدأ ببناء أول هيكل ذكي لك',
      ctaSecondary:
        lang === 'en' ? 'Watch AI Demo Video' : 'شاهد عرض الذكاء الاصطناعي',
      featuresTitle:
        lang === 'en'
          ? 'AI-Powered Core Capabilities'
          : 'قدرات أساسية مدعومة بالذكاء الاصطناعي',
      featuresDesc:
        lang === 'en'
          ? 'Build flexible hierarchies, leverage AI suggestions, and keep each domain isolated and focused.'
          : 'ابنِ هياكل مرنة، واستفد من اقتراحات الذكاء الاصطناعي، واجعل كل مجال معزولًا ومركّزًا.',
      demoTitle:
        lang === 'en' ? 'Interactive Demo Area' : 'منطقة العرض التفاعلي',
      demoDesc:
        lang === 'en'
          ? 'Select a domain, choose manual or AI-assisted setup, and preview the hierarchy.'
          : 'اختر مجالًا، ثم الوضع اليدوي أو بمساعدة الذكاء الاصطناعي، وشاهد معاينة الهيكل.',
      useCasesTitle:
        lang === 'en' ? 'Use Case Scenarios' : 'سيناريوهات الاستخدام',
      signIn: lang === 'en' ? 'Sign In' : 'تسجيل الدخول',
      getStarted: lang === 'en' ? 'Get Started' : 'ابدأ الآن',
    }),
    [lang]
  );
  const sampleLevels = ['Pillar', 'Goal', 'Objective', 'Project', 'Task'];
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      {/* Enhanced Navigation */}
      <nav className='bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            {/* Logo Section */}
            <div className='flex items-center'>
              <Link
                to='/'
                className='flex items-center space-x-3 group'
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className='p-2.5 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300'
                >
                  <Target className='w-6 h-6 text-white' />
                </motion.div>
                <span className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:to-primary-700 transition-all duration-300'>
                  LifeOS
                </span>
              </Link>
            </div>

            {/* Navigation Links - Hidden on mobile */}
            <div className='hidden md:flex items-center space-x-8'>
              {/* Navigation links removed */}
            </div>

            {/* Action Buttons */}
            <div className='flex items-center space-x-4'>
              <div className='hidden sm:flex items-center gap-2 mr-2'>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 rounded-md border text-xs ${
                    lang === 'en'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-800'
                  }`}
                  aria-label='Switch to English'
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('ar')}
                  className={`px-2 py-1 rounded-md border text-xs ${
                    lang === 'ar'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-800'
                  }`}
                  aria-label='التبديل إلى العربية'
                >
                  AR
                </button>
              </div>
              <Link
                to='/login'
                className='hidden sm:block text-gray-600 hover:text-primary-600 font-medium transition-all duration-300 hover:scale-105'
              >
                {t.signIn}
              </Link>
              <Link to='/register'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2'
                >
                  <span>{t.getStarted}</span>
                  <ArrowRight className='w-4 h-4' />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative overflow-hidden py-20 lg:py-32'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className='text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
                <span className='bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent'>
                  {t.heroTitle}
                </span>
              </h1>
              <p className='text-xl text-gray-700 mb-8 leading-relaxed'>
                {t.heroSub}
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Link to='/register'>
                  <button className='bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center'>
                    {t.ctaPrimary}
                    <ArrowRight className='ml-2 w-5 h-5' />
                  </button>
                </Link>
                <button className='border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center'>
                  <Play className='mr-2 w-5 h-5' />
                  {t.ctaSecondary}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className='relative'
            >
              <div className='relative z-10 bg-white rounded-2xl shadow-2xl p-8'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                    <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                    <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  </div>
                  <div className='bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6'>
                    <div className='flex items-center space-x-3 mb-4'>
                      <Goal className='w-6 h-6 text-blue-600' />
                      <h3 className='font-semibold text-gray-900'>
                        Hierarchy Preview
                      </h3>
                    </div>
                    <StructureVisualizer levels={sampleLevels} />
                  </div>
                </div>
              </div>
              <div className='absolute inset-0 bg-gradient-to-r from-primary-500/20 to-indigo-500/20 rounded-2xl blur-3xl'></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Showcase */}
      <section className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-12'
          >
            <h2 className='text-4xl font-bold text-gray-900 mb-3'>
              {t.featuresTitle}
            </h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              {t.featuresDesc}
            </p>
          </motion.div>
          <DynamicCardGrid />
          <div className='mt-10'>
            <FeatureComparison />
          </div>
        </div>
      </section>

      {/* Interactive Demo Area */}
      <section className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-12'
          >
            <h2 className='text-4xl font-bold text-gray-900 mb-3'>
              {t.demoTitle}
            </h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              {t.demoDesc}
            </p>
          </motion.div>
          <AIDemoInterface />
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Why Choose LifeOS?
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Transform your productivity and achieve your goals with our
              comprehensive life management system.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100'>
                  <div className='p-3 bg-gray-50 rounded-lg w-16 h-16 mb-4 flex items-center justify-center'>
                    {benefit.icon}
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    {benefit.title}
                  </h3>
                  <p className='text-gray-600'>{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Powerful Features for Life Management
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Everything you need to organize your life, achieve your goals, and
              build lasting habits.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className='group h-full'
              >
                <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-primary-200 h-full flex flex-col'>
                  <div
                    className={`p-3 bg-gradient-to-br ${feature.color} rounded-lg w-16 h-16 mb-4 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-600 flex-grow'>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hierarchy Demo Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              How Your Work is Structured
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Our intuitive hierarchy helps you organize everything from
              big-picture goals to daily tasks.
            </p>
          </motion.div>

          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8'>
            <div className='flex flex-wrap justify-center items-center gap-4 md:gap-8'>
              {hierarchySteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className='flex flex-col items-center'
                >
                  <div className='bg-white rounded-xl p-4 shadow-lg mb-3'>
                    {step.icon}
                  </div>
                  {step.title && (
                    <div className='text-center'>
                      <h3 className='font-semibold text-gray-900 text-lg'>
                        {step.title}
                      </h3>
                      <p className='text-gray-600 text-sm mt-1 max-w-32'>
                        {step.desc}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional Demo Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              See How It Works
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Follow this step-by-step process to create your own goal hierarchy
              and start achieving your dreams.
            </p>
          </motion.div>

          <div className='space-y-12'>
            {demoSteps.map((demoStep, index) => (
              <motion.div
                key={demoStep.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`flex flex-col lg:flex-row gap-8 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className='flex-1'>
                  <div className='flex items-center space-x-4 mb-6'>
                    <div className='w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg'>
                      {demoStep.step}
                    </div>
                    <div>
                      <h3 className='text-2xl font-bold text-gray-900'>
                        {demoStep.title}
                      </h3>
                      <p className='text-gray-600'>{demoStep.description}</p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-center space-x-3'>
                      {demoStep.icon}
                      <span className='text-lg font-semibold text-gray-900'>
                        Example:
                      </span>
                    </div>
                    <div className='bg-gradient-to-r from-primary-50 to-indigo-50 rounded-lg p-4 border border-primary-200'>
                      <p className='text-gray-800 font-medium'>
                        {demoStep.example}
                      </p>
                    </div>

                    <div className='flex items-center space-x-2 text-sm text-gray-600'>
                      <div className='w-2 h-2 bg-primary-500 rounded-full'></div>
                      <span>Click to see the actual interface</span>
                    </div>
                  </div>
                </div>

                <div className='flex-1'>
                  <div className='relative'>
                    {demoStep.mockup}
                    <div className='absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                      <CheckSquare className='w-4 h-4 text-white' />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className='text-center mt-16'
          >
            <div className='bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200'>
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                Ready to Start Building Your Hierarchy?
              </h3>
              <p className='text-gray-600 mb-6 max-w-2xl mx-auto'>
                Join thousands of users who have already transformed their
                productivity with our intuitive goal management system.
              </p>
              <Link to='/register'>
                <button className='bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto'>
                  Start Creating Your Goals
                  <ArrowRight className='ml-2 w-5 h-5' />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Loved by Thousands of Users
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              See what our users say about their experience with LifeOS.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className='h-full'
              >
                <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col'>
                  <div className='flex items-center mb-4 flex-shrink-0'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className='w-5 h-5 text-yellow-400 fill-current'
                      />
                    ))}
                  </div>
                  <p className='text-gray-600 mb-4 italic flex-grow'>
                    "{testimonial.content}"
                  </p>
                  <div className='flex items-center mt-auto'>
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className='w-12 h-12 rounded-full mr-3 flex-shrink-0'
                    />
                    <div>
                      <p className='font-semibold text-gray-900'>
                        {testimonial.name}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center mb-4'>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className='p-2 bg-primary-600 rounded-lg mr-2'
                >
                  <Target className='w-6 h-6 text-white' />
                </motion.div>
                <span className='text-xl font-bold'>LifeOS</span>
              </div>
              <p className='text-gray-400'>
                The comprehensive platform for life management and goal
                achievement.
              </p>
            </div>
            <div>
              <h3 className='font-semibold mb-4 text-white'>Product</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a
                    href='#features'
                    className='hover:text-white transition-colors cursor-pointer'
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href='#demo'
                    className='hover:text-white transition-colors cursor-pointer'
                  >
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4 text-white'>Company</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a
                    href='#about'
                    className='hover:text-white transition-colors cursor-pointer'
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href='#blog'
                    className='hover:text-white transition-colors cursor-pointer'
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href='#contact'
                    className='hover:text-white transition-colors cursor-pointer'
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4 text-white'>Support</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a
                    href='#help'
                    className='hover:text-white transition-colors cursor-pointer'
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href='#docs'
                    className='hover:text-white transition-colors cursor-pointer'
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href='#status'
                    className='hover:text-white transition-colors cursor-pointer'
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
            <p>&copy; 2024 LifeOS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Visitor;
