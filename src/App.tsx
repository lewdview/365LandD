import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { useStore } from './store/useStore';
import { Loader } from './components/Loader';
import { HomePage } from './pages/HomePage';
import { DayPage } from './pages/DayPage_gated';
import { GlobalAudioPlayer } from './components/GlobalAudioPlayer';

function App() {
  const { fetchData } = useStore();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <BrowserRouter>
      {/* Intro loader - only on first load */}
      {showLoader && <Loader onComplete={() => setShowLoader(false)} />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/day/:day" element={<DayPage />} />
      </Routes>
      
      {/* Global audio player - persists across navigation */}
      <GlobalAudioPlayer />
      
      {/* Vercel Analytics */}
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
