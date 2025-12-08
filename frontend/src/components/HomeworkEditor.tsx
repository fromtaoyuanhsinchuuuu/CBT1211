import { ArrowLeft, Loader2, Highlighter, FileText, MoreVertical, MessageSquare, Grid3x3, X } from 'lucide-react';
import { Patient, Session, Homework } from './HomeworkCenter';
import { useState, useEffect, useRef } from 'react';
import './HomeworkEditor.css';

// 自定义SVG图标组件
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const SmileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
  </svg>
);

const HexagonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"></path>
  </svg>
);

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

interface HomeworkEditorProps {
  homework: Homework | null;
  patient: Patient;
  session: Session;
  onBack: () => void;
  onPreview: (homework: Homework) => void;
}

type HomeworkType = 'CBT' | 'Mood' | 'Relax' | 'Act';

const homeworkTemplates: Record<HomeworkType, { title: string; rows: Array<{ label: string; value: string }> }> = {
  'CBT': {
    title: '思维记录',
    rows: [
      { label: '情境触发', value: '收到领导邮件' },
      { label: '自动思维', value: '"他肯定对我不满"' },
      { label: '情绪评分', value: '焦虑 (85%)' },
    ],
  },
  'Mood': {
    title: '情绪日记',
    rows: [
      { label: '今日事件', value: '完成项目报告' },
      { label: '心情颜色', value: '黄色 (平静)' },
    ],
  },
  'Relax': {
    title: '放松训练',
    rows: [
      { label: '练习项目', value: '渐进式肌肉放松' },
      { label: '时长', value: '15 分钟' },
    ],
  },
  'Act': {
    title: '行为激活',
    rows: [
      { label: '计划活动', value: '去公园散步' },
      { label: '预期愉悦', value: '★★★☆☆' },
    ],
  },
};

export function HomeworkEditor({ homework, patient, session, onBack, onPreview }: HomeworkEditorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(!homework);
  const [therapistNotes, setTherapistNotes] = useState(homework?.therapistNotes || '');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [selectedType, setSelectedType] = useState<HomeworkType>('CBT');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const summaryContentRef = useRef<HTMLDivElement>(null);

  // 默认摘要文本
  const defaultSummary = '患者表现出明显的<span class="highlight">工作压力</span>焦虑，伴随<span class="highlight">失眠症状</span>。核心认知扭曲表现为灾难化思维（如"一旦出错就会被解雇"）。';

  useEffect(() => {
    if (!homework) {
      // Simulate AI analysis progress
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsAnalyzing(false);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setIsAnalyzing(false);
      setTherapistNotes(homework.therapistNotes);
    }
  }, [homework]);

  // 高亮模式切换
  const toggleHighlightMode = () => {
    setIsHighlightMode(!isHighlightMode);
    setToastMessage(isHighlightMode ? '高亮模式已关闭' : '选中文本即可添加高亮');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    
    if (summaryContentRef.current) {
      summaryContentRef.current.style.userSelect = !isHighlightMode ? 'text' : 'none';
    }
  };

  // 处理文本选择和高亮
  useEffect(() => {
    if (!isHighlightMode || !summaryContentRef.current) return;

    const handleSelectionChange = () => {
      if (!isHighlightMode) return;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
      
      const anchorNode = selection.anchorNode;
      if (summaryContentRef.current && anchorNode && summaryContentRef.current.contains(anchorNode)) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'highlight';
        
        try {
          range.surroundContents(span);
          selection.removeAllRanges();
        } catch (e) {
          // If surroundContents fails (e.g., selection spans multiple nodes), skip
          // This is expected behavior for complex selections
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isHighlightMode]);

  // 点击高亮文本移除高亮
  const handleHighlightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHighlightMode) return;
    
    const target = e.target as HTMLElement;
    if (target.classList.contains('highlight')) {
      const text = document.createTextNode(target.innerText);
      target.parentNode?.replaceChild(text, target);
    }
  };

  // 选择作业类型
  const selectType = (type: HomeworkType) => {
    setSelectedType(type);
  };

  // 生成作业
  const handleGenerateHomework = () => {
    if (homework) {
      onPreview({
        ...homework,
        therapistNotes,
      });
    }
  };

  // 查看完整记录
  const handleViewFullRecord = () => {
    setShowRecordModal(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowRecordModal(false);
  };

  // 点击遮罩层关闭
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowRecordModal(false);
    }
  };

  return (
    <div className="homework-editor-page">
      {/* App的可滚动内容区域 */}
      <div className="page-scroller">
        {/* Header */}
        <header className="header">
          <button onClick={onBack} className="btn-icon">
            <ArrowLeft width={20} height={20} strokeWidth={2.5} />
          </button>
          <h1>生成作业</h1>
          <button className="btn-icon">
            <MoreVertical width={20} height={20} strokeWidth={2} />
          </button>
        </header>

        {/* State 1: Analyzing */}
        {isAnalyzing && (
          <div className="analyzing-container">
            <div className="analyzing-card">
              <div className="analyzing-content">
                <div className="analyzing-icon">
                  <Loader2 width={64} height={64} strokeWidth={2} className="animate-spin" style={{ color: '#859B92' }} />
                </div>
                <h3 className="analyzing-title">AI正在分析会话</h3>
                <p className="analyzing-description">文本和关键节点将实时显示，请稍候...</p>
                
                {/* Progress Bar */}
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <p className="progress-text">{analysisProgress}%</p>
              </div>
            </div>
          </div>
        )}

        {/* State 2: Analysis Complete */}
        {!isAnalyzing && (
          <>
            {/* AI 会话分析 */}
            <div className="section-title">
              <div className="icon-box">
                <MessageSquare width={14} height={14} strokeWidth={2} />
              </div>
              AI 会话分析
            </div>
            <div className="summary-card">
              <div 
                ref={summaryContentRef}
                className="summary-text"
                onClick={handleHighlightClick}
                dangerouslySetInnerHTML={{ __html: defaultSummary }}
              />
              <div className="tools-bar">
                <button 
                  className={`tool-btn btn-highlighter ${isHighlightMode ? 'active' : ''}`}
                  onClick={toggleHighlightMode}
                >
                  <Highlighter width={16} height={16} strokeWidth={2} />
                  高亮笔
                </button>
                <button className="tool-btn btn-record" onClick={handleViewFullRecord}>
                  <FileText width={16} height={16} strokeWidth={2} />
                  完整记录
                </button>
              </div>
            </div>

            {/* 作业类型选择 */}
            <div className="section-title">
              <div className="icon-box">
                <Grid3x3 width={14} height={14} strokeWidth={2} />
              </div>
              作业类型
            </div>
            <div className="grid-menu">
              <div 
                className={`type-card ${selectedType === 'CBT' ? 'active' : ''}`}
                onClick={() => selectType('CBT')}
              >
                <BookIcon />
                <span className="type-name">思维记录</span>
              </div>
              <div 
                className={`type-card ${selectedType === 'Mood' ? 'active' : ''}`}
                onClick={() => selectType('Mood')}
              >
                <SmileIcon />
                <span className="type-name">情绪日记</span>
              </div>
              <div 
                className={`type-card ${selectedType === 'Relax' ? 'active' : ''}`}
                onClick={() => selectType('Relax')}
              >
                <HexagonIcon />
                <span className="type-name">放松训练</span>
              </div>
              <div 
                className={`type-card ${selectedType === 'Act' ? 'active' : ''}`}
                onClick={() => selectType('Act')}
              >
                <ActivityIcon />
                <span className="type-name">行为激活</span>
              </div>
            </div>

            {/* 作业预览 + 建议区 */}
            <div className="preview-container">
              <div className="table-header">
                <FileText width={16} height={16} strokeWidth={2} />
                <span>作业模版预览</span>
              </div>
              
              {/* 表格区 */}
              <div id="homework-area">
                <table>
                  <tbody>
                    {homeworkTemplates[selectedType].rows.map((row, index) => (
                      <tr key={index}>
                        <td>{row.label}</td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 建议区 */}
              <div className="advice-section">
                <div className="advice-label">
                  <FileText width={16} height={16} strokeWidth={2} />
                  医师寄语 / 补充建议
                </div>
                <textarea
                  className="advice-input"
                  placeholder="在此输入个性化鼓励或具体指导建议..."
                  value={therapistNotes}
                  onChange={(e) => setTherapistNotes(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 底部固定操作栏 */}
      {!isAnalyzing && (
        <footer className="sticky-action-bar">
          <button className="main-btn" onClick={handleGenerateHomework}>
            确认生成
          </button>
        </footer>
      )}

      {/* Toast */}
      {showToast && (
        <div className={`toast ${showToast ? 'show' : ''}`}>
          {toastMessage}
        </div>
      )}

      {/* 完整记录模态框 (iOS Sheet 风格) */}
      <div 
        className={`modal-overlay ${showRecordModal ? 'active' : ''}`}
        onClick={handleOverlayClick}
      >
        <div className="modal-sheet">
          {/* 模态框头部 */}
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="icon-box-small">
                <FileText width={16} height={16} strokeWidth={2} />
              </div>
              <h3>完整会话录音转写</h3>
            </div>
            <button className="btn-close" onClick={handleCloseModal}>
              <X width={24} height={24} strokeWidth={2} />
            </button>
          </div>

          {/* 模态框内容 (仿聊天记录样式) */}
          <div className="modal-body" contentEditable={true}>
            <div className="chat-group">
              <div className="chat-avatar doc">医</div>
              <div className="chat-bubble doc">
                <p>下午好，张三。这周感觉怎么样？我看你填写的量表分数比上周高了一些。</p>
              </div>
            </div>

            <div className="chat-group right">
              <div className="chat-bubble pat">
                <p>李医生好。嗯...还是很糟糕。主要是<span className="highlight-text">失眠</span>严重，昨晚基本没睡。</p>
              </div>
              <div className="chat-avatar pat">患</div>
            </div>

            <div className="chat-group">
              <div className="chat-avatar doc">医</div>
              <div className="chat-bubble doc">
                <p>失眠的时候，你脑子里主要在想些什么呢？有没有特定的念头？</p>
              </div>
            </div>

            <div className="chat-group right">
              <div className="chat-bubble pat">
                <p>我就在想那个项目截止日期。我总觉得<span className="highlight-text">我肯定做不完</span>，然后领导会当众批评我，最后我可能会<span className="highlight-text">丢掉工作</span>。</p>
              </div>
              <div className="chat-avatar pat">患</div>
            </div>

            <div className="chat-group">
              <div className="chat-avatar doc">医</div>
              <div className="chat-bubble doc">
                <p>这听起来是非常典型的"灾难化思维"。我们今天可以试着针对这个想法做一些工作。</p>
              </div>
            </div>

            <p className="system-note">--- 以上为 AI 自动转写记录 (点击可编辑) ---</p>
          </div>

          {/* 底部渐变遮罩，防止内容太贴底 */}
          <div className="modal-footer-gradient"></div>
        </div>
      </div>
    </div>
  );
}
