import React, { useState } from 'react';
import { ArrowLeft, Calendar, MessageSquare, CheckCircle, Sparkles, Loader2, Brain, Target, Heart, RefreshCw, Lightbulb } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Patient, Homework } from './HomeworkCenter';

// 评估结果类型定义
interface EvaluationResult {
  total_score: number;
  score_context: number;
  score_emotion: number;
  score_thought: number;
  score_restructuring: number;
  score_action_plan: number;
  doctor_comments: string;
  patient_feedback: string;
}

interface HomeworkDetailProps {
  homework: Homework;
  patient: Patient;
  onBack: () => void;
}

export function HomeworkDetail({ homework, patient, onBack }: HomeworkDetailProps) {
  const [feedback, setFeedback] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const patientSubmission = {
    date: '2023-10-27 14:30',
    content: `本周记录了三次引发焦虑的情境：

1. 周一早会前：担心项目进度落后
   自动思维：我一定会被批评
   证据：项目还有两周时间，团队成员都在努力
   
2. 周三接到客户电话：担心需求变更
   自动思维：这个项目要搞砸了
   证据：变更是正常的，我们有应对方案
   
3. 周五下午：看到同事升职
   自动思维：我做得不够好
   证据：我也在进步，每个人节奏不同

通过记录发现，我的焦虑往往源于过度概括和灾难化思维。`,
    emotion: '开始能够识别自己的负面思维模式了',
  };

  // 调用 AI 评估 API
  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setEvaluationError(null);
    
    try {
      const response = await fetch('http://localhost:8000/evaluate_cbt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_text: patientSubmission.content,
        }),
      });

      if (!response.ok) {
        throw new Error('评估请求失败');
      }

      const result: EvaluationResult = await response.json();
      setEvaluationResult(result);
      // 自动填充反馈建议
      setFeedback(result.patient_feedback);
    } catch (error) {
      console.error('评估失败:', error);
      setEvaluationError('评估服务暂时不可用，请稍后重试');
    } finally {
      setIsEvaluating(false);
    }
  };

  // 获取分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 16) return 'text-[#8BA888]'; // 优秀 - 绿色
    if (score >= 12) return 'text-[#E8B44F]'; // 良好 - 橙色
    return 'text-[#C97C7C]'; // 需改进 - 红色
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 16) return 'bg-[#8BA888]';
    if (score >= 12) return 'bg-[#E8B44F]';
    return 'bg-[#C97C7C]';
  };

  // 评估维度配置
  const scoreDimensions = evaluationResult ? [
    { label: '情境描述', score: evaluationResult.score_context, icon: Target, desc: '是否清晰具体' },
    { label: '情绪识别', score: evaluationResult.score_emotion, icon: Heart, desc: '是否准确识别' },
    { label: '自动思维', score: evaluationResult.score_thought, icon: Brain, desc: '分析是否深入' },
    { label: '认知重构', score: evaluationResult.score_restructuring, icon: RefreshCw, desc: '是否合理有效' },
    { label: '行动计划', score: evaluationResult.score_action_plan, icon: Lightbulb, desc: '是否具体可行' },
  ] : [];

  const getStatusConfig = (status: Homework['status']) => {
    switch (status) {
      case 'pending':
        return { text: '待提交', color: 'bg-[#E8B44F] text-white', icon: Calendar };
      case 'submitted':
        return { text: '待批阅', color: 'bg-[#8B9A9E] text-white', icon: MessageSquare };
      case 'completed':
        return { text: '已完成', color: 'bg-[#8BA888] text-white', icon: CheckCircle };
      case 'overdue':
        return { text: '已逾期', color: 'bg-[#5C5552] text-white', icon: Calendar };
    }
  };

  const statusConfig = getStatusConfig(homework.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <div className="max-w-lg mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="text-[#8B9A9E] hover:text-[#5C5552]">
            <ArrowLeft className="size-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl text-[#5C5552]">{homework.title}</h1>
            <p className="text-sm text-[#8B9A9E]">{patient.name}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${statusConfig.color}`}>
            <StatusIcon className="size-3" />
            {statusConfig.text}
          </span>
        </div>

        {/* Homework Info */}
        <Card className="p-5 bg-white border-0 shadow-md mb-4">
          <div className="flex items-center gap-2 text-sm text-[#8B9A9E] mb-4">
            <Calendar className="size-4" />
            <span>发布于 {homework.publishDate}</span>
          </div>
          <h3 className="text-[#5C5552] mb-2">作业要求</h3>
          <p className="text-[#5C5552] mb-4">{homework.description || '记录本周引发负面情绪的事件、想法和感受'}</p>
        </Card>

        {/* Patient Submission */}
        {homework.status !== 'pending' && (
          <Card className="p-5 bg-white border-0 shadow-md mb-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#5C5552]">患者提交内容</h3>
              <span className="text-sm text-[#8B9A9E] truncate ml-2">{patientSubmission.date}</span>
            </div>
            <div className="p-4 bg-[#F2F2F2] rounded-lg mb-4 overflow-hidden">
              <p className="text-[#5C5552] whitespace-pre-wrap break-words overflow-hidden">{patientSubmission.content}</p>
            </div>
            <div className="border-l-4 border-[#8BA888] bg-[#8BA888]/5 p-4 rounded-r-lg overflow-hidden">
              <p className="text-sm text-[#5C5552] break-words">
                <span className="text-[#8BA888]">情绪反馈：</span>
                {patientSubmission.emotion}
              </p>
            </div>
          </Card>
        )}

        {/* AI Evaluation Section - 只在待批阅状态显示 */}
        {homework.status === 'submitted' && (
          <Card className="p-5 bg-white border-0 shadow-md mb-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4 gap-2">
              <h3 className="text-[#5C5552] flex items-center gap-2 flex-shrink-0">
                <Sparkles className="size-5 text-[#E8B44F] flex-shrink-0" />
                <span className="truncate">AI 智能评估</span>
              </h3>
              {!evaluationResult && (
                <Button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  size="sm"
                  className="bg-gradient-to-r from-[#8BA888] to-[#7A9777] hover:from-[#7A9777] hover:to-[#6A8767] text-white flex-shrink-0"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="size-4 mr-1 animate-spin flex-shrink-0" />
                      <span className="hidden sm:inline">评估中...</span>
                      <span className="sm:hidden">评估</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-1 flex-shrink-0" />
                      <span className="hidden sm:inline">开始评估</span>
                      <span className="sm:hidden">评估</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* 评估中的加载动画 */}
            {isEvaluating && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#8BA888]/20 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-[#8BA888] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  <Brain className="size-6 text-[#8BA888] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[#8B9A9E] mt-4">正在分析作业内容...</p>
                <p className="text-xs text-[#8B9A9E] mt-1">AI 正在从多个维度评估作业质量</p>
              </div>
            )}

            {/* 评估错误提示 */}
            {evaluationError && (
              <div className="p-4 bg-[#C97C7C]/10 border border-[#C97C7C]/20 rounded-lg overflow-hidden">
                <p className="text-[#C97C7C] text-sm break-words">{evaluationError}</p>
                <Button
                  onClick={handleEvaluate}
                  size="sm"
                  variant="outline"
                  className="mt-2 border-[#C97C7C] text-[#C97C7C] hover:bg-[#C97C7C]/10"
                >
                  重新评估
                </Button>
              </div>
            )}

            {/* 评估结果展示 */}
            {evaluationResult && (
              <div className="space-y-4 overflow-hidden">
                {/* 总分展示 */}
                <div className="flex items-center justify-center p-4 bg-gradient-to-r from-[#8BA888]/10 to-[#E8B44F]/10 rounded-xl">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(evaluationResult.total_score / 5)}`}>
                      {evaluationResult.total_score}
                    </div>
                    <div className="text-sm text-[#8B9A9E]">总分 / 100</div>
                  </div>
                </div>

                {/* 五维度评分 */}
                <div className="grid grid-cols-5 gap-2">
                  {scoreDimensions.map((dim) => {
                    const Icon = dim.icon;
                    return (
                      <div key={dim.label} className="text-center min-w-0">
                        <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${getScoreBgColor(dim.score)}/10`}>
                          <Icon className={`size-5 ${getScoreColor(dim.score)}`} />
                        </div>
                        <div className={`text-lg font-semibold mt-1 ${getScoreColor(dim.score)}`}>
                          {dim.score}
                        </div>
                        <div className="text-xs text-[#8B9A9E] leading-tight truncate px-1">{dim.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* 分数进度条 */}
                <div className="space-y-3 pt-2 overflow-hidden">
                  {scoreDimensions.map((dim) => (
                    <div key={dim.label} className="space-y-1 overflow-hidden">
                      <div className="flex justify-between text-xs gap-2">
                        <span className="text-[#5C5552] truncate">{dim.label}</span>
                        <span className={`${getScoreColor(dim.score)} flex-shrink-0`}>{dim.score}/20</span>
                      </div>
                      <div className="h-2 bg-[#F2F2F2] rounded-full overflow-hidden flex-shrink-0">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${getScoreBgColor(dim.score)}`}
                          style={{ width: `${(dim.score / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 医生专业评语 */}
                <div className="mt-4 p-4 bg-[#F2F2F2] rounded-lg overflow-hidden">
                  <h4 className="text-sm font-medium text-[#5C5552] mb-2 flex items-center gap-2 flex-shrink-0">
                    <MessageSquare className="size-4 text-[#8B9A9E] flex-shrink-0" />
                    <span className="truncate">专业评估意见</span>
                  </h4>
                  <p className="text-sm text-[#5C5552] whitespace-pre-wrap break-words overflow-hidden max-h-40">{evaluationResult.doctor_comments}</p>
                </div>

                {/* 重新评估按钮 */}
                <Button
                  onClick={handleEvaluate}
                  variant="outline"
                  size="sm"
                  className="w-full border-[#8B9A9E] text-[#8B9A9E] hover:bg-[#8B9A9E]/10"
                >
                  <RefreshCw className="size-4 mr-2" />
                  重新评估
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Therapist Feedback Section */}
        {homework.status === 'submitted' && (
          <Card className="p-5 bg-white border-0 shadow-md mb-4 overflow-hidden">
            <h3 className="text-[#5C5552] mb-3">治疗师反馈</h3>
            {evaluationResult && (
              <p className="text-xs text-[#8B9A9E] mb-2 break-words">
                💡 已根据 AI 评估自动生成反馈建议，您可以直接使用或修改
              </p>
            )}
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="输入您的专业反馈和建议..."
              className="min-h-32 bg-white border-[#D4C5BC] text-[#5C5552] placeholder:text-[#8B9A9E] overflow-hidden"
            />
          </Card>
        )}

        {/* Completed Feedback Display */}
        {homework.status === 'completed' && (
          <Card className="p-5 bg-white border-0 shadow-md mb-4 overflow-hidden">
            <h3 className="text-[#5C5552] mb-3">治疗师反馈</h3>
            <div className="p-4 bg-[#8BA888]/5 rounded-lg overflow-hidden">
              <p className="text-[#5C5552] break-words">
                做得很好！你已经能够识别和记录自己的负面自动思维，这是CBT的重要一步。特别是在第三个情境中，你能够意识到"过度概括"这个认知偏差，说明你的自我觉察能力在提高。
                
                下一步建议：尝试在每个思维记录后，写下一个更平衡、更现实的替代想法。这将帮助你逐步改变思维模式。
              </p>
            </div>
          </Card>
        )}

        {/* Fixed Bottom Actions */}
        {homework.status === 'submitted' && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D4C5BC] p-4">
            <div className="max-w-lg mx-auto">
              <Button 
                onClick={() => {}}
                className="w-full bg-[#8BA888] hover:bg-[#7A9777] text-white h-12"
                disabled={!feedback.trim()}
              >
                <CheckCircle className="size-4 mr-2" />
                提交反馈并完成
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
