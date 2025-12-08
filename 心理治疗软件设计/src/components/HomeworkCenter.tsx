import { Plus, List } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PatientList } from './PatientList';
import { SessionRecords } from './SessionRecords';
import { HomeworkEditor } from './HomeworkEditor';
import { HomeworkPreview } from './HomeworkPreview';
import { PatientDashboard } from './PatientDashboard';
import { HomeworkDetail } from './HomeworkDetail';
import { AuraNotification } from './AuraNotification';
import './HomeworkCenter.css';

export type Patient = {
  id: string;
  name: string;
  lastSession: string;
  avatar: string;
};

export type Session = {
  id: string;
  date: string;
  duration: string;
  emotions: string[];
  analyzed: boolean;
  transcript?: string;
  starred?: boolean;
  aiSummary?: string;
};

export type Homework = {
  id: string;
  title: string;
  description: string;
  aiGenerated: string;
  therapistNotes: string;
  publishDate: string;
  status: 'pending' | 'submitted' | 'completed' | 'overdue';
};

type FlowType = 'create' | 'view' | null;
type FlowStep = 
  | 'center'
  | 'select-patient' 
  | 'select-session' 
  | 'edit-homework' 
  | 'preview-homework'
  | 'patient-dashboard'
  | 'homework-detail';

export function HomeworkCenter() {
  const [currentFlow, setCurrentFlow] = useState<FlowType>(null);
  const [currentStep, setCurrentStep] = useState<FlowStep>('center');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [viewingHomework, setViewingHomework] = useState<Homework | null>(null);
  const [showPublishToast, setShowPublishToast] = useState(false);
  const [toastState, setToastState] = useState<'hidden' | 'published' | 'withdrawn'>('hidden');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openPublishToast = (state: 'published' | 'withdrawn') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastState(state);
    setShowPublishToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowPublishToast(false);
      setToastState('hidden');
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Flow A: Create new homework
  const handleStartCreateFlow = () => {
    setCurrentFlow('create');
    setCurrentStep('select-patient');
  };

  const handlePatientSelectedForCreate = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentStep('select-session');
  };

  const handleSessionSelected = (session: Session) => {
    setSelectedSession(session);
    setCurrentStep('edit-homework');
    // Initialize homework with AI analysis
    setTimeout(() => {
      setEditingHomework({
        id: 'new',
        title: '思维记录表',
        description: '记录本周引发负面情绪的事件、想法和感受',
        aiGenerated: '基于本次会话分析，患者表现出对工作压力的明显焦虑。建议使用思维记录表来帮助患者识别和挑战负面自动思维。',
        therapistNotes: '',
        publishDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      });
    }, 500);
  };

  const handleBackFromSessionList = () => {
    setSelectedPatient(null);
    setCurrentStep('select-patient');
  };

  const handleBackFromEditor = () => {
    setSelectedSession(null);
    setEditingHomework(null);
    setCurrentStep('select-session');
  };

  const handlePreview = (homework: Homework) => {
    setEditingHomework(homework);
    setCurrentStep('preview-homework');
  };

  const handleBackFromPreview = () => {
    setCurrentStep('edit-homework');
  };

  const handlePublish = (updatedHomework?: Homework) => {
    if (updatedHomework) {
      setEditingHomework(updatedHomework);
    }
    // Reset flow
    setCurrentFlow(null);
    setCurrentStep('center');
    setSelectedPatient(null);
    setSelectedSession(null);
    setEditingHomework(null);
    openPublishToast('published');
  };

  // Flow B: View homework status
  const handleStartViewFlow = () => {
    setCurrentFlow('view');
    setCurrentStep('select-patient');
  };

  const handlePatientSelectedForView = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentStep('patient-dashboard');
  };

  const handleBackFromDashboard = () => {
    setSelectedPatient(null);
    setCurrentStep('select-patient');
  };

  const handleViewHomework = (homework: Homework) => {
    setViewingHomework(homework);
    setCurrentStep('homework-detail');
  };

  const handleBackFromDetail = () => {
    setViewingHomework(null);
    setCurrentStep('patient-dashboard');
  };

  // Common navigation
  const handleBackToCenter = () => {
    setCurrentFlow(null);
    setCurrentStep('center');
    setSelectedPatient(null);
    setSelectedSession(null);
    setEditingHomework(null);
    setViewingHomework(null);
  };

  const handleSnackbarWithdraw = () => {
    openPublishToast('withdrawn');
  };

  // Render based on current step
  if (currentStep === 'center') {
    return (
      <>
        <div className="homework-center-page">
          <div className="background-wave-container">
            <svg viewBox="0 0 500 200" preserveAspectRatio="none">
              <path d="M0,80 C150,180 350,0 500,80 L500,0 L0,0 Z"></path>
            </svg>
          </div>
          
          <div className="page-content">
            <header className="header">
              <h1 className="title">家庭作业</h1>
              <p className="subtitle">管理患者的CBT家庭作业</p>
            </header>

            <main>
              <div 
                className="action-card primary"
                onClick={handleStartCreateFlow}
              >
                <div className="card-icon">
                  <Plus className="size-6" strokeWidth={3} />
                </div>
                <div className="card-text">
                  <div className="card-title">生成新作业</div>
                  <div className="card-description">基于会话录音，为患者智能生成CBT家庭作业</div>
                </div>
              </div>

              <div 
                className="action-card secondary"
                onClick={handleStartViewFlow}
              >
                <div className="card-icon">
                  <List className="size-6" strokeWidth={2.5} />
                </div>
                <div className="card-text">
                  <div className="card-title">查看作业情况</div>
                  <div className="card-description">追踪患者的作业进度、完成率和反馈</div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <AuraNotification
          visible={showPublishToast}
          type={toastState}
          onUndo={toastState === 'published' ? handleSnackbarWithdraw : undefined}
        />
      </>
    );
  }

  if (currentStep === 'select-patient') {
    return (
      <>
        <PatientList
          onBack={handleBackToCenter}
          onPatientSelect={currentFlow === 'create' ? handlePatientSelectedForCreate : handlePatientSelectedForView}
          title={currentFlow === 'create' ? '选择患者' : '查看作业情况'}
        />
        <AuraNotification
          visible={showPublishToast}
          type={toastState}
          onUndo={toastState === 'published' ? handleSnackbarWithdraw : undefined}
        />
      </>
    );
  }

  if (currentStep === 'select-session' && selectedPatient) {
    return (
      <>
        <SessionRecords
          patient={selectedPatient}
          onBack={handleBackFromSessionList}
          onSessionSelect={handleSessionSelected}
        />
        <AuraNotification
          visible={showPublishToast}
          type={toastState}
          onUndo={toastState === 'published' ? handleSnackbarWithdraw : undefined}
        />
      </>
    );
  }

  if (currentStep === 'edit-homework' && selectedPatient && selectedSession) {
    return (
      <>
        <HomeworkEditor
          homework={editingHomework}
          patient={selectedPatient}
          session={selectedSession}
          onBack={handleBackFromEditor}
          onPreview={handlePreview}
        />
        <AuraNotification
          visible={showPublishToast}
          type={toastState}
          onUndo={toastState === 'published' ? handleSnackbarWithdraw : undefined}
        />
      </>
    );
  }

  if (currentStep === 'preview-homework' && selectedPatient && editingHomework) {
    return (
      <>
        <HomeworkPreview
          homework={editingHomework}
          patient={selectedPatient}
          onBack={handleBackFromPreview}
          onPublish={handlePublish}
        />
        <AuraNotification
          visible={showPublishToast}
          type={toastState}
          onUndo={toastState === 'published' ? handleSnackbarWithdraw : undefined}
        />
      </>
    );
  }

  if (currentStep === 'patient-dashboard' && selectedPatient) {
    return (
      <>
        <PatientDashboard
          patient={selectedPatient}
          onBack={handleBackFromDashboard}
          onViewHomework={handleViewHomework}
        />
        <AuraNotification
          visible={showPublishToast}
          type={toastState}
          onUndo={toastState === 'published' ? handleSnackbarWithdraw : undefined}
        />
      </>
    );
  }

  if (currentStep === 'homework-detail' && selectedPatient && viewingHomework) {
    return (
      <>
        <HomeworkDetail
          homework={viewingHomework}
          patient={selectedPatient}
          onBack={handleBackFromDetail}
        />
        <AuraNotification
          visible={showPublishToast}
          type={toastState}
          onUndo={toastState === 'published' ? handleSnackbarWithdraw : undefined}
        />
      </>
    );
  }

  return (
    <AuraNotification
      visible={showPublishToast}
      type={toastState}
      onUndo={toastState === 'published' ? handleSnackbarWithdraw : undefined}
    />
  );
}
