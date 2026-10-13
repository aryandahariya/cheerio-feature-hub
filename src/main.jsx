import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Home,
  LayoutGrid,
  MessageSquareText,
  RotateCcw,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Target,
  Timer,
  Wand2,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'cheerio-feature-hub-v1';

const FEATURES = [
  { id: 'abandoned-cart', name: 'Abandoned-Cart Automation', category: 'Automation', Icon: ShoppingCart, setupTime: '8 min', problem: 'Shoppers add products but leave before checkout.', benefit: 'Send a timely reminder that can recover missed revenue.', action: 'Configure automation', recommendedFor: ['recover-sales', 'save-time'] },
  { id: 'whatsapp-chatbot', name: 'WhatsApp Chatbot', category: 'Conversations', Icon: Bot, setupTime: '12 min', problem: 'Customers ask repeat questions before they buy.', benefit: 'Answer common questions faster while keeping support personal.', action: 'Preview setup', recommendedFor: ['support-faster', 'save-time'] },
  { id: 'customer-crm', name: 'Customer CRM', category: 'Customer data', Icon: Database, setupTime: '10 min', problem: 'Customer details live across orders, chats, and spreadsheets.', benefit: 'See purchase intent, segments, and follow-up opportunities together.', action: 'Review CRM', recommendedFor: ['understand-customers', 'support-faster'] },
];

const GOALS = [
  { id: 'recover-sales', label: 'Recover missed sales', copy: 'Prioritizing automations that bring shoppers back to checkout.' },
  { id: 'support-faster', label: 'Reply faster', copy: 'Highlighting tools that reduce repetitive support conversations.' },
  { id: 'understand-customers', label: 'Understand customers', copy: 'Focusing on setup that makes customer behavior easier to act on.' },
  { id: 'save-time', label: 'Save team time', copy: 'Surfacing workflows that can run quietly in the background.' },
];

const TRIGGERS = [
  'Customer leaves items in cart without completing purchase',
  'Customer starts checkout but does not pay',
  'Returning customer views cart twice in one day',
];

const DELAYS = ['30 minutes', '1 hour', '3 hours', '24 hours'];

const DEFAULT_STATE = {
  selectedGoal: 'recover-sales',
  activeView: 'dashboard',
  setups: {},
  wizardDraft: {
    trigger: TRIGGERS[0],
    message: 'Hi {{customer_name}}, you left {{cart_items}} in your cart. Complete your order today and we will keep it ready for you.',
    delay: '1 hour',
  },
  preferences: { brandName: 'Mira Naturals', ownerName: 'Aarav', weeklyDigest: true, plainLanguage: true },
  activity: [
    { id: 'a1', label: 'Viewed WhatsApp chatbot recommendation', time: 'Today' },
    { id: 'a2', label: 'Completed Cheerio onboarding checklist', time: 'Yesterday' },
  ],
};

function readState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored ? { ...DEFAULT_STATE, ...stored } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function App() {
  const [state, setState] = React.useState(readState);
  const [activeView, setActiveView] = React.useState(state.activeView || 'dashboard');
  const [wizardStep, setWizardStep] = React.useState(1);
  const [query, setQuery] = React.useState('');
  const [resetArmed, setResetArmed] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, activeView }));
  }, [state, activeView]);

  const completedCount = Object.values(state.setups).filter((setup) => setup.status === 'completed').length;
  const inProgressCount = Object.values(state.setups).filter((setup) => setup.status === 'in-progress').length;
  const progress = Math.round((completedCount / FEATURES.length) * 100);
  const selectedGoal = GOALS.find((goal) => goal.id === state.selectedGoal) || GOALS[0];
  const recommended = FEATURES.find((feature) => feature.recommendedFor.includes(state.selectedGoal)) || FEATURES[0];

  const navigate = (view) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const updateState = (patch) => setState((current) => ({ ...current, ...patch }));
  const updateDraft = (patch) => updateState({ wizardDraft: { ...state.wizardDraft, ...patch } });

  const startWizard = () => {
    updateState({
      setups: {
        ...state.setups,
        'abandoned-cart': state.setups['abandoned-cart'] || { featureId: 'abandoned-cart', status: 'in-progress', updatedAt: new Date().toISOString() },
      },
    });
    setWizardStep(1);
    navigate('wizard');
  };

  const completeWizard = () => {
    updateState({
      setups: {
        ...state.setups,
        'abandoned-cart': { featureId: 'abandoned-cart', status: 'completed', settings: { ...state.wizardDraft }, updatedAt: new Date().toISOString() },
      },
      activity: [
        { id: crypto.randomUUID(), label: 'Completed Abandoned-Cart Automation setup', time: 'Just now' },
        ...state.activity.filter((item) => item.label !== 'Completed Abandoned-Cart Automation setup'),
      ].slice(0, 5),
    });
    setWizardStep(5);
  };

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
    setActiveView('dashboard');
    setWizardStep(1);
    setResetArmed(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar activeView={activeView} navigate={navigate} completedCount={completedCount} />
        <main className="flex-1 lg:ml-72">
          <Topbar brand={state.preferences.brandName} activeView={activeView} />
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {activeView === 'dashboard' && <Dashboard state={state} completedCount={completedCount} inProgressCount={inProgressCount} progress={progress} recommended={recommended} navigate={navigate} startWizard={startWizard} />}
            {activeView === 'discover' && <Discover state={state} updateState={updateState} query={query} setQuery={setQuery} startWizard={startWizard} selectedGoal={selectedGoal} navigate={navigate} />}
            {activeView === 'wizard' && <Wizard step={wizardStep} setStep={setWizardStep} draft={state.wizardDraft} updateDraft={updateDraft} completeWizard={completeWizard} navigate={navigate} />}
            {activeView === 'setup' && <MySetup state={state} navigate={navigate} startWizard={startWizard} />}
            {activeView === 'settings' && <SettingsScreen state={state} updateState={updateState} resetArmed={resetArmed} setResetArmed={setResetArmed} resetDemo={resetDemo} />}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ activeView, navigate, completedCount }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', Icon: Home },
    { id: 'discover', label: 'Discover Features', Icon: LayoutGrid },
    { id: 'setup', label: 'My Setup', Icon: CheckCircle2 },
    { id: 'settings', label: 'Settings', Icon: Settings },
  ];
  return (
    <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white lg:inset-y-0 lg:left-0 lg:w-72 lg:border-r lg:border-t-0">
      <div className="hidden px-6 py-7 lg:block">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-teal-600 text-white"><Wand2 size={20} /></div>
          <div><p className="font-semibold tracking-tight">Cheerio</p><p className="text-xs text-slate-500">Feature Discovery Hub</p></div>
        </div>
        <span className="mt-5 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Prototype demo</span>
      </div>
      <nav className="grid grid-cols-4 gap-1 p-2 lg:mt-2 lg:block lg:space-y-1 lg:px-4">
        {items.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => navigate(id)} className={`nav-button ${activeView === id ? 'nav-active' : ''}`} aria-current={activeView === id ? 'page' : undefined}>
            <Icon size={18} /><span>{label}</span>{id === 'setup' && completedCount > 0 && <b>{completedCount}</b>}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function Topbar({ brand, activeView }) {
  const titles = { dashboard: 'Dashboard', discover: 'Discover Features', wizard: 'Abandoned-Cart Setup', setup: 'My Setup', settings: 'Settings' };
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Cheerio prototype</p><h1 className="text-xl font-semibold tracking-tight text-slate-950">{titles[activeView]}</h1></div>
        <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 sm:flex"><Sparkles size={16} className="text-teal-600" />{brand}</div>
      </div>
    </header>
  );
}

function Dashboard({ state, completedCount, inProgressCount, progress, recommended, navigate, startWizard }) {
  const totalTouched = completedCount + inProgressCount;
  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div>
            <span className="badge">Demo workspace</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Welcome back, {state.preferences.ownerName}.</h2>
            <p className="mt-3 max-w-2xl text-slate-600">{state.preferences.brandName} has finished the basics. These Cheerio tools can now help you recover shoppers, answer customers, and keep customer data organized.</p>
            <div className="mt-6 flex flex-wrap gap-3"><button className="btn-primary" onClick={() => navigate('discover')}>Discover features <ArrowRight size={16} /></button><button className="btn-secondary" onClick={() => navigate('setup')}>View my setup</button></div>
          </div>
          <div className="rounded-lg border border-teal-100 bg-teal-50 p-5">
            <p className="text-sm font-medium text-teal-800">Recommended next</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">{recommended.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{recommended.benefit}</p>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700" onClick={startWizard}>Configure now <ChevronRight size={16} /></button>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3"><Metric title="Discovered features" value={`${totalTouched}/3`} Icon={LayoutGrid} /><Metric title="Completed setups" value={completedCount} Icon={CheckCircle2} /><Metric title="Onboarding progress" value={`${progress}%`} Icon={Target} /></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Panel title="Recent setup activity"><div className="space-y-3">{state.activity.length === 0 ? <EmptyState text="No setup activity yet. Discover a feature to begin." /> : state.activity.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"><span className="text-sm font-medium text-slate-700">{item.label}</span><span className="text-xs text-slate-500">{item.time}</span></div>)}</div></Panel>
        <Panel title="Setup health"><div className="space-y-4"><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-teal-600" style={{ width: `${progress}%` }} /></div><p className="text-sm text-slate-600">Complete at least one recommended feature to unlock a clearer view of what Cheerio can do for your store.</p><button className="btn-secondary w-full justify-center" onClick={() => navigate('discover')}>Explore recommendations</button></div></Panel>
      </section>
    </div>
  );
}

function Discover({ state, updateState, query, setQuery, startWizard, selectedGoal, navigate }) {
  const filtered = FEATURES.filter((feature) => `${feature.name} ${feature.category} ${feature.problem} ${feature.benefit}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(b.recommendedFor.includes(state.selectedGoal)) - Number(a.recommendedFor.includes(state.selectedGoal)));
  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div><span className="badge">Personalized discovery</span><h2 className="mt-3 text-2xl font-semibold tracking-tight">Find the Cheerio features that match today&apos;s goal.</h2><p className="mt-2 text-slate-600">{selectedGoal.copy}</p></div>
          <label className="relative block"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="field pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search features" /></label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">{GOALS.map((goal) => <button key={goal.id} className={`chip ${state.selectedGoal === goal.id ? 'chip-active' : ''}`} onClick={() => updateState({ selectedGoal: goal.id })}>{goal.label}</button>)}</div>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">{filtered.map((feature) => <FeatureCard key={feature.id} feature={feature} recommended={feature.recommendedFor.includes(state.selectedGoal)} status={state.setups[feature.id]?.status} startWizard={startWizard} navigate={navigate} />)}</section>
      {filtered.length === 0 && <EmptyState text="No feature matched that search. Try automation, chatbot, or CRM." />}
    </div>
  );
}

function FeatureCard({ feature, recommended, status, startWizard, navigate }) {
  const { Icon } = feature;
  const action = feature.id === 'abandoned-cart' ? startWizard : () => navigate('setup');
  return (
    <article className="feature-card">
      <div className="flex items-start justify-between gap-4"><div className="grid size-11 place-items-center rounded-lg bg-blue-50 text-blue-700"><Icon size={22} /></div><div className="flex flex-col items-end gap-2">{recommended && <span className="badge">Recommended</span>}{status && <span className="status">{status}</span>}</div></div>
      <h3 className="mt-5 text-lg font-semibold">{feature.name}</h3>
      <p className="mt-2 text-sm text-slate-600"><strong className="text-slate-800">Problem:</strong> {feature.problem}</p>
      <p className="mt-2 text-sm text-slate-600"><strong className="text-slate-800">Benefit:</strong> {feature.benefit}</p>
      <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><Clock3 size={16} /> Estimated setup: {feature.setupTime}</div>
      <button className="btn-primary mt-5 w-full justify-center" onClick={action}>{feature.action}</button>
    </article>
  );
}

function Wizard({ step, setStep, draft, updateDraft, completeWizard, navigate }) {
  const messageValid = draft.message.trim().length > 0;
  const canNext = step !== 2 || messageValid;
  const goNext = () => canNext && setStep(Math.min(step + 1, 4));
  if (step === 5) {
    return <section className="mx-auto max-w-3xl rounded-lg border border-teal-100 bg-white p-8 text-center shadow-sm"><div className="mx-auto grid size-14 place-items-center rounded-full bg-teal-50 text-teal-700"><CheckCircle2 size={30} /></div><h2 className="mt-5 text-2xl font-semibold">Abandoned-cart setup saved</h2><p className="mx-auto mt-3 max-w-xl text-slate-600">This prototype saved your configuration locally in this browser. It does not send real WhatsApp messages or connect to a live Cheerio account.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button className="btn-primary" onClick={() => navigate('dashboard')}>Return to dashboard</button><button className="btn-secondary" onClick={() => navigate('discover')}>Discover another feature</button></div></section>;
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-8">
      <Progress step={step} />
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 && <StepShell title="Goal and trigger" icon={Target} copy="Choose when Cheerio should consider a cart abandoned in this demo setup."><div className="space-y-3">{TRIGGERS.map((trigger) => <label key={trigger} className={`choice ${draft.trigger === trigger ? 'choice-active' : ''}`}><input type="radio" name="trigger" checked={draft.trigger === trigger} onChange={() => updateDraft({ trigger })} /><span>{trigger}</span></label>)}</div></StepShell>}
        {step === 2 && <StepShell title="Message configuration" icon={MessageSquareText} copy="Write the reminder your customer would see. Keep the placeholders so the message stays personal."><textarea className={`field min-h-40 ${!messageValid ? 'field-error' : ''}`} value={draft.message} onChange={(event) => updateDraft({ message: event.target.value })} /><div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500"><span className="badge">{'{{customer_name}}'}</span><span className="badge">{'{{cart_items}}'}</span></div>{!messageValid && <p className="mt-2 text-sm text-red-600">Add a message before continuing.</p>}</StepShell>}
        {step === 3 && <StepShell title="Timing" icon={Timer} copy="Pick a delay that feels helpful without overwhelming your customer."><div className="grid gap-3 sm:grid-cols-2">{DELAYS.map((delay) => <button key={delay} className={`choice ${draft.delay === delay ? 'choice-active' : ''}`} onClick={() => updateDraft({ delay })}><Clock3 size={18} /><span>{delay} after cart is abandoned</span></button>)}</div></StepShell>}
        {step === 4 && <StepShell title="Review settings" icon={CheckCircle2} copy="Confirm the saved prototype settings before completing setup."><ReviewRow label="Trigger" value={draft.trigger} edit={() => setStep(1)} /><ReviewRow label="Message" value={draft.message} edit={() => setStep(2)} /><ReviewRow label="Delay" value={draft.delay} edit={() => setStep(3)} />{!messageValid && <p className="mt-3 text-sm text-red-600">The message is empty. Edit it before completing setup.</p>}</StepShell>}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
          <button className="btn-secondary" onClick={() => (step === 1 ? navigate('discover') : setStep(step - 1))}><ArrowLeft size={16} /> Back</button>
          {step < 4 ? <button className="btn-primary" disabled={!canNext} onClick={goNext}>Continue <ArrowRight size={16} /></button> : <button className="btn-primary" disabled={!messageValid} onClick={completeWizard}>Complete setup <Check size={16} /></button>}
        </div>
      </section>
    </div>
  );
}

function MySetup({ state, navigate, startWizard }) {
  return <div className="space-y-6 pb-24 lg:pb-8"><Panel title="Feature setup status"><div className="grid gap-4 lg:grid-cols-3">{FEATURES.map((feature) => { const setup = state.setups[feature.id]; const status = setup?.status || 'available'; return <article key={feature.id} className="rounded-lg border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{feature.name}</h3><span className="status">{status}</span></div><p className="mt-2 text-sm text-slate-600">{feature.benefit}</p>{setup?.settings && <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Reminder after <strong>{setup.settings.delay}</strong></div>}<button className="btn-secondary mt-4 w-full justify-center" onClick={feature.id === 'abandoned-cart' ? startWizard : () => navigate('discover')}>{setup?.settings ? 'Reopen settings' : 'Start or review'}</button></article>; })}</div></Panel></div>;
}

function SettingsScreen({ state, updateState, resetArmed, setResetArmed, resetDemo }) {
  const prefs = state.preferences;
  const setPrefs = (patch) => updateState({ preferences: { ...prefs, ...patch } });
  return <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_0.8fr] lg:pb-8"><Panel title="Demo account"><div className="grid gap-4 sm:grid-cols-2"><label className="label">Brand name<input className="field mt-1" value={prefs.brandName} onChange={(event) => setPrefs({ brandName: event.target.value })} /></label><label className="label">Owner name<input className="field mt-1" value={prefs.ownerName} onChange={(event) => setPrefs({ ownerName: event.target.value })} /></label></div><div className="mt-5 space-y-3"><Toggle label="Weekly setup digest" checked={prefs.weeklyDigest} onChange={(checked) => setPrefs({ weeklyDigest: checked })} /><Toggle label="Plain-language explanations" checked={prefs.plainLanguage} onChange={(checked) => setPrefs({ plainLanguage: checked })} /></div></Panel><Panel title="Reset demo data"><p className="text-sm text-slate-600">Clear completed setups, wizard drafts, preferences, and activity from localStorage.</p><div className="mt-5 flex flex-wrap gap-3">{!resetArmed ? <button className="btn-secondary" onClick={() => setResetArmed(true)}><RotateCcw size={16} /> Reset demo data</button> : <><button className="btn-danger" onClick={resetDemo}>Confirm reset</button><button className="btn-secondary" onClick={() => setResetArmed(false)}>Cancel</button></>}</div></Panel></div>;
}

function Metric({ title, value, Icon }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><Icon className="text-teal-600" size={22} /><p className="mt-4 text-sm text-slate-500">{title}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}

function Panel({ title, children }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>{children}</section>;
}

function EmptyState({ text }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{text}</div>;
}

function Progress({ step }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="grid grid-cols-4 gap-2">{[1, 2, 3, 4].map((item) => <div key={item} className={`h-2 rounded-full ${item <= step ? 'bg-teal-600' : 'bg-slate-200'}`} />)}</div><p className="mt-3 text-sm text-slate-500">Step {step} of 4</p></div>;
}

function StepShell({ title, icon: Icon, copy, children }) {
  return <div><div className="flex items-start gap-3"><div className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-700"><Icon size={20} /></div><div><h2 className="text-xl font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-600">{copy}</p></div></div><div className="mt-6">{children}</div></div>;
}

function ReviewRow({ label, value, edit }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-4 last:border-0"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-sm text-slate-800">{value}</p></div><button className="text-sm font-semibold text-teal-700" onClick={edit}>Edit</button></div>;
}

function Toggle({ label, checked, onChange }) {
  return <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-medium"><span>{label}</span><input className="size-4 accent-teal-600" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
