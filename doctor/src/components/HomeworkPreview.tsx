import React, { useEffect, useState } from 'react';
import { Patient, Homework } from './HomeworkCenter';
import './HomeworkPreview.css';

interface HomeworkPreviewProps {
  homework: Homework;
  patient: Patient;
  onBack: () => void;
  onPublish: (updatedHomework: Homework) => void;
}

export function HomeworkPreview({ homework, patient, onBack, onPublish }: HomeworkPreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState(homework.therapistNotes || '');
  const [currentPlaceholder, setCurrentPlaceholder] = useState('回顾TA的努力，给予肯定。');
  
  const suggestionPlaceholders = [
    '可以从鼓励TA的进步开始...',
    '试试具体指出TA的哪个想法很有价值？',
    '回顾TA的努力，并给予肯定。',
    '提出一个开放式问题，引导TA进一步思考。',
  ];

  const snippetSource = `${homework.description ?? ''} ${homework.aiGenerated ?? ''}`.trim();
  const snippet = snippetSource.length > 0 ? snippetSource.replace(/\s+/g, ' ') : '暂无内容摘要';
  const fullContent = `${homework.description ?? ''}\n\n${homework.aiGenerated ?? ''}`.trim();

  // 弹窗打开时，阻止页面滚动（在手机框架内）
  useEffect(() => {
    if (isModalOpen) {
      const pageScroller = document.querySelector('.page-scroller') as HTMLElement;
      if (pageScroller) {
        pageScroller.style.overflow = 'hidden';
      }
    } else {
      const pageScroller = document.querySelector('.page-scroller') as HTMLElement;
      if (pageScroller) {
        pageScroller.style.overflow = 'auto';
      }
    }
  }, [isModalOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleTextareaFocus = () => {
    const randomIndex = Math.floor(Math.random() * suggestionPlaceholders.length);
    setCurrentPlaceholder(suggestionPlaceholders[randomIndex]);
  };

  const handlePublishClick = () => {
    onPublish({
      ...homework,
      therapistNotes: notes,
    });
  };

  return (
    <div className="homework-preview-page">
      {/* App的可滚动内容区域 */}
      <div className="page-scroller">
        <header className="header">
          <button onClick={onBack} className="back-arrow">
            ←
          </button>
          <h1 className="title">作业预览与发布</h1>
        </header>

        <main>
          <article 
            className="card homework-overview-card" 
            onClick={handleOpenModal}
          >
            <p className="meta-info">{patient.name} · {homework.publishDate}</p>
            <h2 className="homework-title">{homework.title || '思维记录表'}</h2>
            <p className="content-snippet">{snippet}</p>
            <div className="view-detail-hint">
              <span className="icon">🔍</span>
              <span>查看完整内容</span>
            </div>
          </article>

          <section className="card suggestion-card">
            <h3 className="card-title">个性化建议</h3>
            <textarea
              className="suggestion-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onFocus={handleTextareaFocus}
              placeholder={currentPlaceholder}
            />
          </section>
        </main>
      </div>

      {/* App的底部固定操作栏 */}
      <footer className="sticky-action-bar">
        <button className="publish-button" onClick={handlePublishClick}>
          确认发布作业
        </button>
      </footer>

      {/* App的弹窗层，覆盖整个虚拟屏幕 */}
      <div 
        className={`glass-scroll-overlay ${isModalOpen ? 'visible' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseModal();
          }
        }}
      >
        <div className="glass-scroll-modal">
          <button className="close-button" onClick={handleCloseModal}>
            ×
          </button>
          <h2 className="modal-title">{homework.title || '思维记录表'}</h2>
          <div className="modal-content">{fullContent || '暂无内容'}</div>
        </div>
      </div>
    </div>
  );
}
