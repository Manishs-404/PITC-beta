import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, ShieldAlert, Sparkles, AlertTriangle, Globe, 
  CornerDownLeft, ShieldCheck, HelpCircle, RefreshCw, X, 
  Cpu, Cloud, Zap
} from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { analyseThread, getSmartReply, runCoach } from './services/api';

export default function App() {
  const { languages, selectedLang, setSelectedLang, currentLanguage, isRTL } = useLanguage();

  // Model Provider Selection: 'auto' | 'cloud' | 'local'
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [activeModelBadge, setActiveModelBadge] = useState('Auto');

  // Active chat state
  const [messages, setMessages] = useState([
    { id: 1, speaker: 'Manager', text: 'Kal subah presentation client ke samne deni hai.', sender: 'them', time: '10:14 AM' }
  ]);

  const [inputText, setInputText] = useState('Haan tu chinta mat kar, ready kar dunga.');
  const [activeSpeaker, setActiveSpeaker] = useState('me');
  const [otherPartyName, setOtherPartyName] = useState('Manager');

  // Thread Health
  const [threadHealth, setThreadHealth] = useState(null);

  // Pre-Send Live Draft Analysis
  const [draftRisk, setDraftRisk] = useState(null);
  const [isEvaluatingDraft, setIsEvaluatingDraft] = useState(false);

  // Coach State
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachStage, setCoachStage] = useState('idle');
  const [coachData, setCoachData] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [clarificationAnswers, setClarificationAnswers] = useState({});

  // Smart Reply State
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyGoal, setReplyGoal] = useState('Politely acknowledge, apologize for informal tone, and confirm readiness');
  const [replyResult, setReplyResult] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Audit historical thread
  useEffect(() => {
    const auditThread = async () => {
      if (messages.length === 0) return;
      try {
        const formatted = messages.map(m => ({
          speaker: m.sender === 'me' ? 'You' : otherPartyName,
          message: m.text
        }));
        const res = await analyseThread({
          session_id: `thread-${Date.now()}`,
          language_code: selectedLang,
          thread: formatted,
          provider: selectedProvider
        });
        setThreadHealth(res.data);
        if (res.data.model_used) setActiveModelBadge(res.data.model_used);
      } catch (err) {
        console.error('Thread audit error:', err);
      }
    };
    auditThread();
  }, [messages, selectedLang, otherPartyName, selectedProvider]);

  // 2. Pre-Send Interception: Live draft analysis
  useEffect(() => {
    if (activeSpeaker !== 'me' || !inputText.trim() || inputText.length < 4) {
      setDraftRisk(null);
      setIsEvaluatingDraft(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsEvaluatingDraft(true);
      try {
        const hypotheticalThread = [
          ...messages.map(m => ({
            speaker: m.sender === 'me' ? 'You' : otherPartyName,
            message: m.text
          })),
          { speaker: 'You', message: inputText.trim() }
        ];

        const res = await analyseThread({
          session_id: `draft-eval-${Date.now()}`,
          language_code: selectedLang,
          thread: hypotheticalThread,
          provider: selectedProvider
        });

        const draftIdx = hypotheticalThread.length - 1;
        if (res.data.riskiest_message_index === draftIdx && res.data.health_score !== 'Low') {
          setDraftRisk(res.data);
        } else {
          setDraftRisk(null);
        }
        if (res.data.model_used) setActiveModelBadge(res.data.model_used);
      } catch (err) {
        console.error('Draft pre-evaluation error:', err);
      } finally {
        setIsEvaluatingDraft(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [inputText, activeSpeaker, selectedLang, messages, otherPartyName, selectedProvider]);

  // 3. Trigger Coach Pipeline
  const handleStartCoach = async (overrideText = null, answers = {}) => {
    const textToCoach = overrideText || inputText;
    if (!textToCoach.trim()) return;

    setCoachOpen(true);
    setReplyOpen(false);
    setCoachLoading(true);

    try {
      const res = await runCoach({
        session_id: `coach-${Date.now()}`,
        source_text: textToCoach,
        language_code: selectedLang,
        intent: {
          purpose: 'Workplace conversation',
          recipient: otherPartyName,
          tone: 'Respectful and culturally aligned'
        },
        clarification_answers: Object.keys(answers).length > 0 ? answers : null,
        provider: selectedProvider
      });

      setCoachData(res.data);
      if (res.data.model_used) setActiveModelBadge(res.data.model_used);

      if (res.data.needs_clarification && res.data.clarification_questions?.length > 0) {
        setCoachStage('clarification');
      } else {
        setCoachStage('ready');
      }
    } catch (err) {
      console.error('Coach pipeline error:', err);
      alert('Could not contact Coach API. Ensure backend is running on port 8000.');
    } finally {
      setCoachLoading(false);
    }
  };

  const handleClarificationSubmit = (e) => {
    e.preventDefault();
    handleStartCoach(inputText, clarificationAnswers);
  };

  // 4. Trigger Smart Reply
  const handleGenerateReply = async () => {
    setReplyLoading(true);
    try {
      const formatted = messages.map(m => ({
        speaker: m.sender === 'me' ? 'You' : otherPartyName,
        message: m.text
      }));
      const res = await getSmartReply({
        session_id: `reply-${Date.now()}`,
        language_code: selectedLang,
        thread: formatted,
        goal: replyGoal,
        provider: selectedProvider
      });
      setReplyResult(res.data);
      if (res.data.model_used) setActiveModelBadge(res.data.model_used);
    } catch (err) {
      console.error('Smart reply error:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  // 5. Send message action
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      speaker: activeSpeaker === 'me' ? 'You' : otherPartyName,
      text: inputText.trim(),
      sender: activeSpeaker,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputText('');
    setDraftRisk(null);
    setCoachOpen(false);
    setReplyOpen(false);
    setCoachData(null);
    setReplyResult(null);
    setClarificationAnswers({});
  };

  const applyReplacementText = (text) => {
    setInputText(text);
    setDraftRisk(null);
    setCoachOpen(false);
    setReplyOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b141a] text-slate-100 antialiased overflow-hidden font-sans">
      
      {/* Header Bar with Model Provider Selector */}
      <header className="h-16 bg-[#202c33] px-4 flex items-center justify-between border-b border-[#313d45] shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center font-bold text-white text-sm shadow">
              {otherPartyName.slice(0, 2).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#202c33] rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={otherPartyName}
                onChange={(e) => setOtherPartyName(e.target.value)}
                className="bg-transparent font-semibold text-sm text-slate-100 focus:outline-none focus:border-b border-sky-400 max-w-[150px]"
                title="Click to rename recipient"
              />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Auditing for <strong>{currentLanguage.name}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-teal-400 text-[10px] font-mono">{activeModelBadge}</span>
            </div>
          </div>
        </div>

        {/* Model Provider & Language Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Engine Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#111b21] px-2.5 py-1.5 rounded-lg border border-[#313d45]">
            {selectedProvider === 'cloud' && <Cloud className="w-3.5 h-3.5 text-sky-400" />}
            {selectedProvider === 'local' && <Cpu className="w-3.5 h-3.5 text-purple-400" />}
            {selectedProvider === 'auto' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
            <select
  value={selectedProvider}
  onChange={(e) => setSelectedProvider(e.target.value)}
  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
  title="Select LLM Engine"
>
  <option value="auto" className="bg-[#111b21]">Auto (Cloud + Fallback)</option>
  <option value="cloud" className="bg-[#111b21]">Cloud (Gemini Flash)</option>
  <option value="local" className="bg-[#111b21]">Local (Ollama Aya 8B)</option>
</select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-[#111b21] px-2.5 py-1.5 rounded-lg border border-[#313d45]">
            <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#111b21] text-slate-200">
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative z-0">
        <div className="flex justify-center my-1">
          <span className="bg-[#182229] text-[#8696a0] text-[11px] px-3 py-1 rounded-md shadow uppercase tracking-wider font-semibold">
            Engine: {selectedProvider.toUpperCase()} • {currentLanguage.name} ({currentLanguage.native})
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-3.5 py-2 text-sm shadow relative ${
                  isMe
                    ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                    : 'bg-[#202c33] text-[#d1d7db] rounded-tl-none'
                }`}
              >
                <div className="text-[11px] font-bold text-teal-300/80 mb-0.5">
                  {msg.speaker}
                </div>
                <p className="leading-relaxed break-words">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-white/50">{msg.time}</span>
                  {isMe && <span className="text-[11px] text-sky-300">✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* PROACTIVE DRAFT INTERVENTION BANNER */}
      {draftRisk && activeSpeaker === 'me' && (
        <div className="bg-red-950/90 border-t-2 border-red-500 px-4 py-3 shadow-2xl backdrop-blur flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 z-30">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-300 uppercase tracking-wide">
                  Relational Friction Detected ({draftRisk.crt_category})
                </span>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-semibold">
                  {draftRisk.health_score} Risk
                </span>
              </div>
              <p className="text-xs text-red-200 mt-0.5">
                {draftRisk.crt_explanation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => handleStartCoach(inputText)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coach & Fix Draft</span>
            </button>
          </div>
        </div>
      )}

      {/* COACH DRAWER (SIC, Formality Variants & Simulation) */}
      {coachOpen && (
        <div className="bg-[#111b21] border-t border-[#313d45] p-4 max-h-[50vh] overflow-y-auto z-40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#222d34]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Single Message Coach ({currentLanguage.name})
              </span>
            </div>
            <button 
              onClick={() => setCoachOpen(false)}
              className="p-1 rounded hover:bg-[#202c33] text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {coachLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
              <span>Auditing linguistic hierarchy and simulating outcomes...</span>
            </div>
          ) : coachStage === 'clarification' ? (
            <form onSubmit={handleClarificationSubmit} className="space-y-3 bg-[#182229] p-3.5 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <HelpCircle className="w-4 h-4" />
                <span>Clarification Needed: Recipient Social Dynamics</span>
              </div>
              <p className="text-xs text-slate-300">{coachData.clarification_reason}</p>

              <div className="space-y-2.5 pt-1">
                {coachData.clarification_questions.map((q, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-xs text-amber-200 font-medium">{q}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior boss, younger coworker, first-time contact..."
                      className="w-full bg-[#202c33] border border-[#313d45] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      onChange={(e) =>
                        setClarificationAnswers({ ...clarificationAnswers, [q]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold"
              >
                Confirm Intent & Generate Safe Variants
              </button>
            </form>
          ) : coachData ? (
            <div className="space-y-4">
              <div className="bg-[#202c33] p-3 rounded-lg border border-[#313d45] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wide">
                    Recommended Safe Version
                  </span>
                  <button
                    onClick={() => applyReplacementText(coachData.primary_translation)}
                    className="text-xs text-teal-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <span>Apply to Input</span>
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div dir={isRTL ? 'rtl' : 'ltr'} className={`text-base font-semibold text-white ${currentLanguage.font_class}`}>
                  {coachData.primary_translation}
                </div>
                <p className="text-xs text-slate-400 pt-1">{coachData.cultural_notes}</p>
              </div>

              {coachData.variants && coachData.variants.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Formality Variants (Click to Use)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {coachData.variants.map((v, i) => (
                      <div
                        key={i}
                        onClick={() => applyReplacementText(v.text)}
                        className="bg-[#202c33] hover:border-teal-500 border border-[#313d45] p-2.5 rounded-lg cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-teal-400">{v.register}</span>
                          <span className="text-[10px] text-slate-500">{v.nuance}</span>
                        </div>
                        <p dir={isRTL ? 'rtl' : 'ltr'} className={`text-xs text-white ${currentLanguage.font_class}`}>
                          {v.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {coachData.branches && coachData.branches.length > 0 && (
                <div className="bg-[#182229] p-3 rounded-lg border border-[#313d45] space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    What-If Branching Simulator (Predicted Reactions)
                  </span>
                  <div className="space-y-2">
                    {coachData.branches.map((b, i) => (
                      <div key={i} className="text-xs bg-[#111b21] p-2.5 rounded border border-[#313d45] space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="italic text-slate-200">"{b.anticipated_reply}"</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            b.risk_level === 'High' ? 'bg-red-500/20 text-red-400' :
                            b.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {b.risk_level} Risk
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{b.risk_reason}</p>
                        <div className="text-[11px] text-teal-300 pt-0.5">
                          <strong>Safer alternative:</strong> {b.safer_alternative}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* SMART REPLY DRAWER */}
      {replyOpen && (
        <div className="bg-[#111b21] border-t border-[#313d45] p-4 max-h-80 overflow-y-auto z-40 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#222d34]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Generate Smart Reply ({currentLanguage.name})
              </span>
            </div>
            <button 
              onClick={() => setReplyOpen(false)}
              className="p-1 rounded hover:bg-[#202c33] text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={replyGoal}
              onChange={(e) => setReplyGoal(e.target.value)}
              placeholder="State goal (e.g. Apologize sincerely, request extension politely)..."
              className="flex-1 bg-[#202c33] border border-[#313d45] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleGenerateReply}
              disabled={replyLoading}
              className="px-3.5 py-1.5 bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0"
            >
              {replyLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Draft</span>
            </button>
          </div>

          {replyResult && (
            <div className="bg-[#202c33] p-3 rounded-lg border border-[#313d45] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wide">
                  Drafted Reply ({currentLanguage.name})
                </span>
                <button
                  onClick={() => applyReplacementText(replyResult.translated_reply)}
                  className="text-xs text-teal-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Use in Chat</span>
                  <CornerDownLeft className="w-3 h-3" />
                </button>
              </div>

              <div
                dir={isRTL ? 'rtl' : 'ltr'}
                className={`text-sm text-white font-medium p-2 bg-[#111b21] rounded border border-[#313d45] ${currentLanguage.font_class}`}
              >
                {replyResult.translated_reply}
              </div>
              <p className="text-xs text-slate-400">
                <strong>Register Explanation:</strong> {replyResult.register_explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-[#202c33] border-t border-[#313d45] flex items-center gap-2 shrink-0 z-20">
        
        <button
          type="button"
          onClick={() => {
            const next = activeSpeaker === 'me' ? 'them' : 'me';
            setActiveSpeaker(next);
            setDraftRisk(null);
          }}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSpeaker === 'me'
              ? 'bg-[#00a884] text-white'
              : 'bg-slate-700 text-slate-300'
          }`}
          title="Toggle sender"
        >
          {activeSpeaker === 'me' ? 'You' : otherPartyName}
        </button>

        <button
          type="button"
          onClick={() => {
            setCoachOpen(!coachOpen);
            setReplyOpen(false);
            if (!coachData) handleStartCoach(inputText);
          }}
          className={`p-2 rounded-full border transition-all ${
            coachOpen
              ? 'bg-teal-500/20 border-teal-400 text-teal-300'
              : 'bg-[#111b21] border-[#313d45] text-slate-400 hover:text-white'
          }`}
          title="Open Coach"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            setReplyOpen(!replyOpen);
            setCoachOpen(false);
          }}
          className={`p-2 rounded-full border transition-all ${
            replyOpen
              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
              : 'bg-[#111b21] border-[#313d45] text-slate-400 hover:text-white'
          }`}
          title="Ghostwrite Smart Reply"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center px-3 py-1.5 relative">
          <input
            type="text"
            placeholder={
              activeSpeaker === 'me'
                ? `Draft message in English or ${currentLanguage.name}...`
                : `Type message received from ${otherPartyName}...`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
          />

          {isEvaluatingDraft && (
            <div className="absolute right-3">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!inputText.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shadow ${
            draftRisk && activeSpeaker === 'me'
              ? 'bg-amber-600 hover:bg-amber-500'
              : 'bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40'
          }`}
          title={draftRisk ? 'Draft has cultural risks! Click to send anyway' : 'Send message'}
        >
          {draftRisk && activeSpeaker === 'me' ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4 ml-0.5" />
          )}
        </button>
      </div>

    </div>
  );
}