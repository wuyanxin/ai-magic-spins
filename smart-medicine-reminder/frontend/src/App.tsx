import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { FamilyPage } from './pages/FamilyPage';
import { MedicinePage } from './pages/MedicinePage';
import { ReminderPage } from './pages/ReminderPage';
import { familyApi, medicineApi, reminderApi } from './api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [familyCount, setFamilyCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [currentPage]);

  const fetchStats = async () => {
    const [families, medicines, reminders] = await Promise.all([
      familyApi.getAll(),
      medicineApi.getAll(),
      reminderApi.getAll()
    ]);
    setFamilyCount(families.length);
    setMedicineCount(medicines.length);
    setReminderCount(reminders.length);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            familyCount={familyCount}
            medicineCount={medicineCount}
            reminderCount={reminderCount}
            onNavigate={setCurrentPage}
          />
        );
      case 'family':
        return <FamilyPage />;
      case 'medicine':
        return <MedicinePage />;
      case 'reminder':
        return <ReminderPage />;
      default:
        return (
          <HomePage 
            familyCount={familyCount}
            medicineCount={medicineCount}
            reminderCount={reminderCount}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;