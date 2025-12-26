import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Loader } from './components/Loader';
import { HomePage } from './pages/HomePage';
import { DayPage } from './pages/DayPage';

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
    </BrowserRouter>
  );
}

export default App;
