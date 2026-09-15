import React, { useState, useRef, useEffect, useCallback } from 'react';
import Markdown from 'react-markdown';
import {
  TrainingRadar,
  MuscleExposureData,
  AIWorkoutPlan,
  AIMessage,
  Workout,
  MuscleId
} from '../../types';
import { api } from '../../lib/api';
import { MUSCLE_CATALOG, FRESHNESS_COLORS } from '../../lib/muscleMath';
import {
  Sparkles,
  Send,
  Play,
  BookmarkPlus,
  Zap,
  Activity,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  Clock,
  Dumbbell,
  ChevronDown
} from 'lucide-react';

interface AITrainerProps {
  radar: TrainingRadar;
  musclesData: Record<MuscleId, MuscleExposureData>;
  onStartGeneratedWorkout: (plan: AIWorkoutPlan) => void;
  onSaveTemplate: (plan: AIWorkoutPlan) => void;
}

export const AITrainer: React.FC<AITrainerProps> = ({
  radar,
  musclesData,
  onStartGeneratedWorkout,
  onSaveTemplate
}) => {
  const getDefaultWelcome = useCallback((): AIMessage => ({
    id: 'msg_welcome',
    sender: 'assistant',
    timestamp: new Date().toISOString(),
    text: `Hello! I am your **Training Intelligence AI Coach**.\n\nI have real-time access to your logged workout history, muscle fatigue models, and 1RM progressions. \n\n**Current Status**:\n• **Recommended Focus Today**: ${radar.suggestedFocusToday.title}\n• **Rationale**: ${radar.suggestedFocusToday.rationale}\n\nAsk me any question or request a hyper-targeted workout!`,
    suggestedActions: [
      'What should I train today?',
      'Generate a workout for today',
      'Which muscles am I neglecting?',
      'How is my bench progression?'
    ]
  }), [radar.suggestedFocusToday.title, radar.suggestedFocusToday.rationale]);

  const [messages, setMessages] = useState<AIMessage[]>([getDefaultWelcome()]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll and user scroll tracking refs & state
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom <= 120;
    isNearBottomRef.current = nearBottom;
    setShowScrollBottomBtn(distanceFromBottom > 160);
  };

  // Restore persisted chat history on mount
  useEffect(() => {
    let isMounted = true;
    api.getChatHistory().then((saved) => {
      if (!isMounted) return;
      if (Array.isArray(saved) && saved.length > 0) {
        setMessages(saved);
      } else {
        setMessages([getDefaultWelcome()]);
      }
      setTimeout(() => scrollToBottom('auto'), 80);
    }).catch(() => {});

    return () => { isMounted = false; };
  }, [getDefaultWelcome]);

  // Auto-scroll down when new messages are added or coach is typing, unless user scrolled up
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    // Always scroll down immediately if the message was sent by the user, or if user is near bottom, or when loading starts
    if (lastMsg?.sender === 'user' || isNearBottomRef.current || isLoading) {
      scrollToBottom('smooth');
    }
  }, [messages, isLoading]);

  // Helper to append message and automatically persist to vault and backend
  const appendMessage = (newMsg: AIMessage) => {
    setMessages(prev => {
      const updated = [...prev, newMsg];
      api.saveChatHistory(updated).catch(() => {});
      return updated;
    });
  };

  // Quick Workout Generator options
  const [customFocus, setCustomFocus] = useState(radar.suggestedFocusToday.title);
  const [customDuration, setCustomDuration] = useState(50);
  const [customEquipment, setCustomEquipment] = useState('Standard Gym');
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [activePlanPreview, setActivePlanPreview] = useState<AIWorkoutPlan | null>(null);
  const [mobileSubTab, setMobileSubTab] = useState<'chat' | 'tools'>('chat');

  const FOCUS_PRESETS = [
    'Push (Chest & Triceps)',
    'Pull (Back & Biceps)',
    'Legs & Calves',
    'Upper Body Hypertrophy',
    'Shoulders & Arms',
    'Full Body Functional'
  ];

  const handleClearChat = async () => {
    const fresh = [getDefaultWelcome()];
    setMessages(fresh);
    await api.clearChatHistory();
    await api.saveChatHistory(fresh);
    isNearBottomRef.current = true;
    setShowScrollBottomBtn(false);
    scrollToBottom('smooth');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: AIMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text
    };

    // Auto-scroll on user send
    isNearBottomRef.current = true;
    setShowScrollBottomBtn(false);
    appendMessage(userMsg);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Check if user is asking to generate a workout
      if (
        text.toLowerCase().includes('generate') ||
        text.toLowerCase().includes('create workout') ||
        text.toLowerCase().includes('workout for today')
      ) {
        const plan = await api.generateAIWorkout({
          focus: customFocus,
          durationMinutes: customDuration,
          equipment: customEquipment
        });
        setActivePlanPreview(plan);

        const aiMsg: AIMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          text: `I've synthesized a customized **${plan.name}** based on your freshness data (${plan.durationMinutes} min):\n\n${plan.rationale}`,
          recommendedWorkout: plan,
          suggestedActions: ['Start this workout now', 'Adjust duration to 45 mins', 'Which muscles are neglected?']
        };
        appendMessage(aiMsg);
      } else {
        const response = await api.askAICoach(text, messages);
        const aiMsg: AIMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          text: response.reply,
          suggestedActions: response.suggestedActions || [
            'What should I train today?',
            'Generate a workout for me'
          ]
        };
        appendMessage(aiMsg);
      }
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: `Here is your current grounded assessment:\n\n• **Suggested Focus**: ${radar.suggestedFocusToday.title}\n• **High Exposure Group**: ${radar.highExposureMuscles.map(m => m.name).join(', ') || 'None'}\n• **Recovered Ready Group**: ${radar.recoveredMuscles.map(m => m.name).join(', ') || 'All Balanced'}`
      };
      appendMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWorkoutDirectly = async () => {
    setIsGeneratingWorkout(true);
    try {
      const plan = await api.generateAIWorkout({
        focus: customFocus,
        durationMinutes: customDuration,
        equipment: customEquipment
      });
      setActivePlanPreview(plan);

      const aiMsg: AIMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: `Generated **${plan.name}** (~${plan.durationMinutes} min).\n\n${plan.rationale}`,
        recommendedWorkout: plan
      };
      appendMessage(aiMsg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bot className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            AI Training Intelligence Coach
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Context-aware fitness intelligence grounded in your volume, recovery decay, and PR metrics.
          </p>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (Mobile Only) */}
      <div className="flex lg:hidden items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
        <button
          onClick={() => setMobileSubTab('chat')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileSubTab === 'chat'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Coach Chat</span>
        </button>
        <button
          onClick={() => setMobileSubTab('tools')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileSubTab === 'tools'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Routine Generator & Recovery</span>
        </button>
      </div>

      {/* Main Grid: Left Chat Arena & Right Live State Context Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chat & Workout Previews */}
        <div className={`lg:col-span-2 relative flex-col h-[540px] sm:h-[640px] lg:h-[720px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
          mobileSubTab === 'tools' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Chat Session Status Bar & Reset Action */}
          <div className="px-4 sm:px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Grounded Intelligence Session
              </span>
              <span className="hidden sm:inline text-[10px] text-slate-400 dark:text-slate-500">
                • Persisted
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearChat}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset to fresh conversation"
            >
              <RotateCcw className="w-3 h-3" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat Messages Log */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 scroll-smooth"
          >
            {messages.map(msg => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAssistant
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="max-w-[85%] space-y-3">
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isAssistant
                          ? 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800'
                          : 'bg-blue-600 text-white font-medium rounded-tr-xs'
                      }`}
                    >
                      {isAssistant ? (
                        <div className="ai-markdown space-y-2 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-4 [&>strong]:font-bold [&>strong]:text-slate-950 dark:[&>strong]:text-white [&>h3]:font-bold [&>h3]:text-sm [&>h3]:mt-3 [&>h3]:mb-1 [&>h4]:font-bold [&>h4]:text-xs [&>h4]:mt-2 [&>h4]:mb-1 [&>li]:leading-normal">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      )}
                    </div>

                    {/* AI Structured Workout Preview if attached to message */}
                    {msg.recommendedWorkout && (
                      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-blue-800/40 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                              AI Synthesized Session
                            </span>
                            <h4 className="text-base font-bold text-white mt-0.5">
                              {msg.recommendedWorkout.name}
                            </h4>
                            <span className="text-xs text-slate-400">
                              Duration: ~{msg.recommendedWorkout.durationMinutes} mins • Warmup: {msg.recommendedWorkout.warmupTip}
                            </span>
                          </div>
                        </div>

                        {/* Exercises Breakdown */}
                        <div className="space-y-2">
                          {msg.recommendedWorkout.exercises.map((ex, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-white block">
                                  {i + 1}. {ex.exerciseName}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {ex.sets} sets × {ex.repMin}-{ex.repMax} reps (Rest {ex.restSeconds}s)
                                </span>
                              </div>
                              <span className="font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-1 rounded-md">
                                {ex.suggestedWeightKg} kg
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            id="start-ai-workout-from-chat-btn"
                            onClick={() => onStartGeneratedWorkout(msg.recommendedWorkout!)}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" /> Start This Workout
                          </button>

                          <button
                            onClick={() => onSaveTemplate(msg.recommendedWorkout!)}
                            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Save to My Templates"
                          >
                            <BookmarkPlus className="w-4 h-4" /> Save
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Suggested Prompt Action Chips */}
                    {isAssistant && msg.suggestedActions && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleSendMessage(action)}
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                <span>AI Coach is analyzing recovery models & calculating workouts...</span>
              </div>
            )}
            <div ref={messagesEndRef} className="h-px w-full" />
          </div>

          {/* Floating Jump to Latest Button (Shows when user scrolls up) */}
          {showScrollBottomBtn && (
            <button
              type="button"
              onClick={() => {
                isNearBottomRef.current = true;
                setShowScrollBottomBtn(false);
                scrollToBottom('smooth');
              }}
              className="absolute bottom-20 right-6 sm:right-8 z-20 px-3.5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-bottom-2 active:scale-95"
              title="Scroll down to latest messages"
            >
              <ChevronDown className="w-4 h-4" />
              <span>Latest messages</span>
            </button>
          )}

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask about recovery, bench progress, or request a specific workout..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Live Contextual Status & Workout Generator Controls */}
        <div className={`space-y-6 ${mobileSubTab === 'chat' ? 'hidden lg:block' : 'block'}`}>
          {/* Quick Workout Generator Box */}
          <div className="p-5 rounded-3xl bg-linear-to-b from-blue-950 to-slate-900 text-white border border-blue-800/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Workout Generator
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                AI Powered
              </span>
            </div>

            {/* Focus presets */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FOCUS_PRESETS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomFocus(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                      customFocus === preset
                        ? 'bg-blue-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                    }`}
                  >
                    {preset.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Muscle Focus</label>
                <input
                  type="text"
                  value={customFocus}
                  onChange={e => setCustomFocus(e.target.value)}
                  placeholder="e.g. Chest & Triceps, Back & Biceps"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Equipment</label>
                <select
                  value={customEquipment}
                  onChange={e => setCustomEquipment(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Standard Gym">Full Commercial Gym (Barbells, Cables, Dumbbells)</option>
                  <option value="Dumbbells Only">Dumbbells & Bench Only</option>
                  <option value="Home & Bodyweight">Home Bodyweight & Bands</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex justify-between">
                  <span>Session Duration</span>
                  <span className="font-bold text-blue-400">{customDuration} mins</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="90"
                  step="5"
                  value={customDuration}
                  onChange={e => setCustomDuration(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleGenerateWorkoutDirectly}
                disabled={isGeneratingWorkout}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isGeneratingWorkout ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Synthesizing Routine...
                  </>
                ) : (
                  <>
                    <Dumbbell className="w-4 h-4" />
                    Synthesize Workout Plan
                  </>
                )}
              </button>
            </div>

            {/* Inline Generated Workout Preview Card */}
            {activePlanPreview && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-blue-500/40 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{activePlanPreview.name}</h4>
                    <span className="text-[10px] text-blue-300 font-medium">
                      {activePlanPreview.durationMinutes} mins • {activePlanPreview.exercises.length} movements
                    </span>
                  </div>
                  <button
                    onClick={() => setActivePlanPreview(null)}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded-sm hover:bg-slate-800"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-[11px]">
                  {activePlanPreview.exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50"
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-white truncate">{ex.exerciseName}</p>
                        <p className="text-[10px] text-slate-400">{ex.sets} sets × {ex.repMin}-{ex.repMax} reps</p>
                      </div>
                      {ex.suggestedWeightKg ? (
                        <span className="font-mono text-[10px] font-bold text-blue-300 shrink-0">
                          {ex.suggestedWeightKg}kg
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onStartGeneratedWorkout(activePlanPreview)}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Launch This Session
                </button>
              </div>
            )}
          </div>

          {/* Current Recovery State Inspector */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-500" /> Grounded Recovery Context
              </h3>
              <span className="text-[11px] text-slate-500">Live</span>
            </div>

            {/* Fatigued Groups */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-1.5">
                High Exposure (Protect Today)
              </span>
              {radar.highExposureMuscles.length > 0 ? (
                <div className="space-y-1.5">
                  {radar.highExposureMuscles.map(m => {
                    const daysAgo = m.daysSinceTraining === null ? null : Math.floor(m.daysSinceTraining);
                    const label = daysAgo === null ? 'Never' : daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;
                    return (
                      <div
                        key={m.muscleId}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-300"
                      >
                        <span className="font-semibold">{m.name}</span>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No muscles currently overloaded.</p>
              )}
            </div>

            {/* Recovered Prime Groups */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 block mb-1.5">
                Supercompensated & Primed
              </span>
              {radar.recoveredMuscles.length > 0 ? (
                <div className="space-y-1.5">
                  {radar.recoveredMuscles.slice(0, 4).map(m => {
                    const daysAgo = m.daysSinceTraining === null ? null : Math.floor(m.daysSinceTraining);
                    const label = daysAgo === null ? 'Never' : daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;
                    return (
                      <div
                        key={m.muscleId}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                      >
                        <span className="font-semibold">{m.name}</span>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">All groups evenly trained.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
