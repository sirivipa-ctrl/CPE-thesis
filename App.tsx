/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ArchivePage } from './pages/ArchivePage';
import { AdvisorsPage } from './pages/AdvisorsPage';
import { FormsPage } from './pages/FormsPage';
import { ManualsPage } from './pages/ManualsPage';
import { GuidelinesPage } from './pages/GuidelinesPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdvisorDashboard } from './pages/AdvisorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ThesisDetailModal } from './components/ThesisDetailModal';
import { NewThesisModal } from './components/NewThesisModal';
import { LoginModal } from './components/LoginModal';
import { StatsModal } from './components/StatsModal';
import { getTheses, deleteThesis } from './services/thesisService';
import { Thesis, AdvisorFaculty, UserRole } from './types';

function MainApp() {
  const { currentUser, activeRole } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loadingTheses, setLoadingTheses] = useState<boolean>(true);

  // Modals state
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [isNewThesisOpen, setIsNewThesisOpen] = useState(false);
  const [selectedDefaultAdvisor, setSelectedDefaultAdvisor] = useState<string | undefined>(undefined);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginInitialRole, setLoginInitialRole] = useState<UserRole>('student');
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoadingTheses(true);
    try {
      const data = await getTheses();
      setTheses(data);
    } catch (err) {
      console.error("Failed to load theses:", err);
    } finally {
      setLoadingTheses(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Requirement: เมื่อกดออกจากระบบ ทั้งนิสิต/อาจารย์/แอดมิน จะกลับไปที่หน้าแรกของเว็บไซต์
  useEffect(() => {
    if (!currentUser && currentTab.includes('dashboard')) {
      setCurrentTab('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentUser, currentTab]);

  const [selectedAdvisorForArchive, setSelectedAdvisorForArchive] = useState<string | undefined>(undefined);

  const handleSelectAdvisorForProposal = (advisor: AdvisorFaculty) => {
    setSelectedDefaultAdvisor(advisor.name);
    setIsNewThesisOpen(true);
  };

  const handleViewAdvisorProjects = (advisorName: string) => {
    setSelectedAdvisorForArchive(advisorName);
    setCurrentTab('archive');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteThesis = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโครงงานนี้?')) {
      try {
        await deleteThesis(id);
        showToast('ลบข้อมูลโครงงานเรียบร้อยแล้ว');
        loadData();
      } catch (err: any) {
        alert(err.message || 'ไม่สามารถลบข้อมูลได้');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd] text-[#111827]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a2540] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500/30">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Primary Navigation Bar (Only for public views) */}
      {!currentTab.includes('dashboard') && (
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenLogin={(role) => {
            if (role) setLoginInitialRole(role);
            setIsLoginOpen(true);
          }}
          onOpenSearch={() => {
            setCurrentTab('archive');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onSelectTab={setCurrentTab}
            theses={theses}
            onOpenThesis={(thesis) => setSelectedThesis(thesis)}
          />
        )}

        {currentTab === 'archive' && (
          <ArchivePage
            theses={theses}
            loading={loadingTheses}
            onOpenThesis={(thesis) => setSelectedThesis(thesis)}
            onOpenUpload={() => setIsNewThesisOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
            onSelectTab={setCurrentTab}
            initialAdvisorFilter={selectedAdvisorForArchive}
          />
        )}

        {currentTab === 'advisors' && (
          <AdvisorsPage
            onSelectAdvisor={handleSelectAdvisorForProposal}
            onViewProjects={handleViewAdvisorProjects}
          />
        )}

        {currentTab === 'forms' && (
          <FormsPage />
        )}

        {currentTab === 'manuals' && (
          <ManualsPage />
        )}

        {currentTab === 'guidelines' && (
          <GuidelinesPage />
        )}

        {currentTab === 'student_dashboard' && (
          <StudentDashboard
            theses={theses}
            onOpenNewThesis={() => setIsNewThesisOpen(true)}
            onOpenThesis={(thesis) => setSelectedThesis(thesis)}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'advisor_dashboard' && (
          <AdvisorDashboard
            theses={theses}
            onOpenThesis={(thesis) => setSelectedThesis(thesis)}
            onSelectTab={setCurrentTab}
            onReviewSuccess={() => {
              showToast('บันทึกผลการพิจารณาเรียบร้อยแล้ว');
              loadData();
            }}
          />
        )}

        {currentTab === 'admin_dashboard' && (
          <AdminDashboard
            theses={theses}
            onOpenThesis={(thesis) => setSelectedThesis(thesis)}
            onSelectTab={setCurrentTab}
            onDeleteThesis={handleDeleteThesis}
          />
        )}
      </main>

      {/* Footer (Only for public views) */}
      {!currentTab.includes('dashboard') && (
        <Footer onSelectTab={setCurrentTab} />
      )}

      {/* Modals */}
      <ThesisDetailModal
        thesis={selectedThesis}
        onClose={() => setSelectedThesis(null)}
        onRefresh={() => {
          loadData();
          showToast('อัปเดตข้อมูลสำเร็จ');
        }}
      />

      <NewThesisModal
        isOpen={isNewThesisOpen}
        onClose={() => {
          setIsNewThesisOpen(false);
          setSelectedDefaultAdvisor(undefined);
        }}
        onSuccess={() => {
          loadData();
          showToast('ยื่นข้อเสนอโครงงานเข้าสู่ระบบเรียบร้อยแล้ว');
        }}
        defaultAdvisor={selectedDefaultAdvisor}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        initialRole={loginInitialRole}
        onSuccess={(role) => {
          if (role === 'admin') {
            showToast('ยินดีต้อนรับเข้าสู่ระบบผู้ดูแลระบบ (Admin CPE)');
            setCurrentTab('admin_dashboard');
          } else if (role === 'advisor') {
            showToast('ยินดีต้อนรับอาจารย์ที่ปรึกษา เข้าสู่ระบบเรียบร้อย');
            setCurrentTab('advisor_dashboard');
          } else {
            showToast('ยินดีต้อนรับนิสิต เข้าสู่ระบบเรียบร้อย');
            setCurrentTab('student_dashboard');
          }
        }}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        theses={theses}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
