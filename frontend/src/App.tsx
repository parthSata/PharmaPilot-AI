import { Provider } from 'react-redux';
import { store } from './store';
import { Header, Footer, ComplaintForm, AssistantPanel } from './components';

function AppContent() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden font-sans">
      {/* Enterprise App Header */}
      <Header />

      {/* Main Single Page: Equal Split 50/50 Panel Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left Panel: Complaint Form */}
        <section className="h-full min-h-0 overflow-hidden">
          <ComplaintForm />
        </section>

        {/* Right Panel: AI Assistant & File Intake */}
        <section className="h-full min-h-0 overflow-hidden">
          <AssistantPanel />
        </section>
      </main>

      {/* Enterprise App Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
