import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import StructureVisualizer from './StructureVisualizer';
import { useApiCalls } from '../../hooks/useApiCalls';
import { suggestTemplate } from '../../lib/ai/aiDefault';

const presets = [
  { key: 'business', en: 'Business', ar: 'الأعمال' },
  { key: 'health', en: 'Health', ar: 'الصحة' },
  { key: 'education', en: 'Education', ar: 'التعليم' },
  { key: 'personal', en: 'Personal Growth', ar: 'التطوير الشخصي' },
  { key: 'technology', en: 'Technology', ar: 'التقنية' },
];

const defaultLevels = ['Goal', 'Objective', 'Project', 'Task'];

const AIDemoInterface: React.FC = () => {
  const { suggestStructure } = useApiCalls();
  const [lang, setLang] = useState<'en' | 'ar'>(() =>
    document?.dir === 'rtl' ? 'ar' : 'en'
  );
  const [domain, setDomain] = useState<string>('business');
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [prompt, setPrompt] = useState<string>(
    'Launch a startup for an AI product'
  );
  const [levels, setLevels] = useState<string[]>(defaultLevels);
  const [name, setName] = useState<string>('Custom Structure');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = useMemo(
    () => ({
      title:
        lang === 'en' ? 'Interactive AI Demo' : 'عرض تفاعلي للذكاء الاصطناعي',
      desc:
        lang === 'en'
          ? 'Choose a domain, try AI-assisted or manual setup, and preview your hierarchy.'
          : 'اختر مجالًا، جرّب الإعداد بمساعدة الذكاء الاصطناعي أو يدويًا، وشاهد المعاينة.',
      domain: lang === 'en' ? 'Domain' : 'المجال',
      mode: lang === 'en' ? 'Mode' : 'الوضع',
      aiAssist: lang === 'en' ? 'AI-Assisted' : 'بمساعدة الذكاء الاصطناعي',
      manual: lang === 'en' ? 'Manual' : 'يدوي',
      promptPh:
        lang === 'en'
          ? 'Describe what you want to organize (e.g., I want to organize my fitness journey)'
          : 'صف ما تريد تنظيمه (مثال: أريد تنظيم رحلتي في اللياقة)',
      generate: lang === 'en' ? 'Generate Structure' : 'توليد الهيكل',
      or: lang === 'en' ? 'or' : 'أو',
      addLevel: lang === 'en' ? 'Add level' : 'إضافة مستوى',
      removeLast: lang === 'en' ? 'Remove last' : 'حذف الأخير',
      preview: lang === 'en' ? 'Preview' : 'المعاينة',
      structureName: lang === 'en' ? 'Structure Name' : 'اسم الهيكل',
      updateName: lang === 'en' ? 'Update Name' : 'تحديث الاسم',
    }),
    [lang]
  );

  useEffect(() => {
    // Seed prompt based on domain
    if (lang === 'en') {
      if (domain === 'health')
        setPrompt('Build a sustainable fitness plan with habits');
      else if (domain === 'education')
        setPrompt('Master data science with a clear roadmap');
      else if (domain === 'personal')
        setPrompt('Develop leadership and communication skills');
      else if (domain === 'technology')
        setPrompt('Ship an MVP for a web app product');
      else setPrompt('Launch a startup for an AI product');
    } else {
      if (domain === 'health') setPrompt('بناء خطة لياقة مستدامة مع عادات');
      else if (domain === 'education')
        setPrompt('إتقان علم البيانات بخارطة طريق واضحة');
      else if (domain === 'personal')
        setPrompt('تطوير مهارات القيادة والتواصل');
      else if (domain === 'technology')
        setPrompt('إطلاق نموذج أولي لتطبيق ويب');
      else setPrompt('إطلاق شركة ناشئة لمنتج ذكاء اصطناعي');
    }
  }, [domain, lang]);

  const runAI = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await suggestStructure(prompt);
      if (s && s.levels?.length) {
        setLevels(s.levels);
        setName(s.name || s.templateName || 'Custom Structure');
        return;
      }
      // Fallback to local smart template
      const local = await suggestTemplate(prompt);
      setLevels(local.levels);
      setName(local.templateName);
    } catch (e) {
      try {
        const local = await suggestTemplate(prompt);
        setLevels(local.levels);
        setName(local.templateName);
      } catch {}
      setError(
        lang === 'en'
          ? 'Could not generate a suggestion at the moment.'
          : 'تعذر توليد اقتراح حاليًا.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='text-2xl font-bold text-gray-900'>{t.title}</h3>
          <p className='text-gray-600'>{t.desc}</p>
        </div>
        <div
          className='flex gap-2'
          aria-label='language toggle'
        >
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-md text-sm border ${
              lang === 'en'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-800'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('ar')}
            className={`px-3 py-1 rounded-md text-sm border ${
              lang === 'ar'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-800'
            }`}
          >
            AR
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <div className='space-y-3 lg:col-span-1'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              {t.domain}
            </label>
            <div className='flex flex-wrap gap-2'>
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setDomain(p.key)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    domain === p.key
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  {lang === 'en' ? p.en : p.ar}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              {t.mode}
            </label>
            <div className='flex gap-2'>
              <button
                onClick={() => setMode('ai')}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  mode === 'ai'
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white text-gray-800'
                }`}
              >
                {t.aiAssist}
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  mode === 'manual'
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white text-gray-800'
                }`}
              >
                {t.manual}
              </button>
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              {t.structureName}
            </label>
            <div className='flex gap-2'>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='flex-1 px-3 py-2 border rounded-md'
              />
              <button
                onClick={() => setName(name)}
                className='px-3 py-2 rounded-md border text-sm'
              >
                {t.updateName}
              </button>
            </div>
          </div>
        </div>

        <div className='space-y-3 lg:col-span-2'>
          {mode === 'ai' ? (
            <div className='space-y-2'>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className='w-full px-3 py-2 border rounded-md'
                placeholder={t.promptPh}
              />
              <button
                onClick={runAI}
                disabled={loading}
                className='px-4 py-2 bg-gray-900 text-white rounded-lg'
              >
                {loading
                  ? lang === 'en'
                    ? 'Analyzing...'
                    : 'جاري التحليل...'
                  : t.generate}
              </button>
              {error && <div className='text-sm text-red-600'>{error}</div>}
            </div>
          ) : (
            <div className='space-y-2'>
              <div className='flex flex-wrap gap-2'>
                {levels.map((lv, i) => (
                  <input
                    key={i}
                    value={lv}
                    onChange={(e) => {
                      const next = [...levels];
                      next[i] = e.target.value;
                      setLevels(next);
                    }}
                    className='px-3 py-2 border rounded-md'
                  />
                ))}
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => setLevels([...levels, ''])}
                  className='px-3 py-1.5 rounded-md border text-sm'
                >
                  {t.addLevel}
                </button>
                {levels.length > 1 && (
                  <button
                    onClick={() => setLevels(levels.slice(0, -1))}
                    className='px-3 py-1.5 rounded-md border text-sm'
                  >
                    {t.removeLast}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className='pt-2'>
            <div className='text-sm text-gray-700 mb-2'>{t.preview}</div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <StructureVisualizer levels={levels} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDemoInterface;
