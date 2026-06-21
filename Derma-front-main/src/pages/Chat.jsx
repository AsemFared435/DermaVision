import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaCheck,
  FaCopy,
  FaFileAlt,
  FaHistory,
  FaPaperPlane,
  FaPrint,
  FaRobot,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaUpload,
  FaUser,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { useTranslation } from '../hooks/useTranslation';
import chatService from '../services/chatService';
import toast from 'react-hot-toast';

const MAX_CHARS = 1200;
const CHAT_STORAGE_PREFIX = 'dermavision_chat_';
const DEFAULT_WELCOME_MESSAGE = 'This chat is based on your selected diagnosis report. I can explain the condition, general care options, common treatment approaches, and questions to ask your dermatologist. This is educational only and not a personal prescription.';

const hasArabicText = (value) => /[\u0600-\u06FF]/.test(value || '');
const getChatStorageKey = (analysisId) => `${CHAT_STORAGE_PREFIX}${analysisId}`;

const normalizeTimestamp = (timestamp) => {
  const date = timestamp ? new Date(timestamp) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const serializeMessages = (messages) => messages.map((message) => ({
  ...message,
  timestamp: normalizeTimestamp(message.timestamp).toISOString(),
}));

const deserializeMessages = (storedMessages) => {
  if (!storedMessages) return null;

  try {
    const parsed = JSON.parse(storedMessages);
    if (!Array.isArray(parsed)) return null;

    return parsed
      .map((message, index) => ({
        ...message,
        id: message.id || `${Date.now()}-${index}`,
        type: message.type === 'user' ? 'user' : 'bot',
        text: typeof message.text === 'string' ? message.text : '',
        sources: Array.isArray(message.sources) ? message.sources : [],
        timestamp: normalizeTimestamp(message.timestamp),
      }))
      .filter((message) => message.text);
  } catch {
    return null;
  }
};

const formatConfidence = (confidence) => {
  const value = Number(confidence || 0);
  const percent = value <= 1 ? value * 100 : value;
  return `${percent.toFixed(1)}%`;
};

const formatReportDate = (value, isArabic) => {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  return safeDate.toLocaleString(isArabic ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildFinalReportText = (report, labels, isArabic) => {
  if (!report) return '';
  const section = (title, value) => {
    if (Array.isArray(value)) {
      return `${title}\n${value.map((item) => `- ${item}`).join('\n')}`;
    }
    return `${title}\n${value || ''}`;
  };

  return [
    labels.title || 'Consultation Report',
    `${labels.diagnosisResult || 'Diagnosis Result'}: ${report.diagnosis?.display_name || ''}`,
    `${labels.confidence || 'Confidence'}: ${formatConfidence(report.diagnosis?.confidence)}`,
    `${labels.generatedAt || 'Generated at'}: ${formatReportDate(report.generated_at, isArabic)}`,
    section(labels.caseSummary || 'Case Summary', report.summary),
    section(labels.patientQuestionsSummary || 'Patient Questions Summary', report.patient_questions_summary),
    section(labels.generalCareGuidance || 'General Care Guidance', report.general_care_guidance),
    section(labels.commonTreatmentOptions || 'General Care & Treatment Guidance', report.common_treatment_options),
    section(labels.redFlags || 'When to Seek Urgent Care', report.red_flags),
    section(labels.medicalDisclaimer || 'Medical Disclaimer', report.disclaimer),
  ].filter(Boolean).join('\n\n');
};

const renderInlineMarkdown = (text, keyPrefix, strongClassName = '') => (
  String(text || '').split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={key} className={strongClassName}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  })
);

const MessageContent = ({ text, isUser }) => {
  const lines = String(text || '').split(/\r?\n/);
  const strongClassName = isUser ? 'font-extrabold text-white' : 'font-extrabold text-gray-900 dark:text-white';
  const elements = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        const itemText = lines[index].trim().replace(/^[-*]\s+/, '');
        items.push(
          <li key={`item-${index}`} className="leading-relaxed">
            {renderInlineMarkdown(itemText, `li-${index}`, strongClassName)}
          </li>
        );
        index += 1;
      }
      index -= 1;
      elements.push(
        <ul key={`list-${index}`} className="my-2 list-disc ps-5 space-y-1 text-sm leading-relaxed">
          {items}
        </ul>
      );
      continue;
    }

    const isHeading = /^\*\*[^*]+\*\*$/.test(trimmed);
    elements.push(
      <p
        key={`line-${index}`}
        className={`${isHeading ? 'mt-3 first:mt-0 font-extrabold text-gray-900 dark:text-white' : 'mt-2 first:mt-0'} text-sm leading-relaxed`}
      >
        {renderInlineMarkdown(trimmed, `line-${index}`, strongClassName)}
      </p>
    );
  }

  if (elements.length === 0) return null;
  return <div className="text-start">{elements}</div>;
};

const MessageBubble = ({ message, isNew, labels, isArabic }) => {
  const [copied, setCopied] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const isUser = message.type === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{ animation: isNew ? 'slideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards' : 'none' }}
    >
      <div className={`flex items-end gap-2.5 max-w-[88%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md mb-1 ${
          isUser
            ? 'bg-gradient-to-br from-violet-500 to-pink-500'
            : message.isError
              ? 'bg-red-500'
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
        }`}>
          {isUser ? <FaUser className="text-white text-xs" /> : <FaRobot className="text-white text-xs" />}
        </div>

        <div className="flex-1 group">
          <div className={`rounded-2xl px-4 py-3 shadow-sm relative ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-br-sm'
              : message.isError
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700 rounded-bl-sm'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
          }`}>
            {!isUser && !message.isError && (
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-700 to-transparent opacity-60 rounded-t-2xl" />
            )}
            <MessageContent text={message.text} isUser={isUser} />

            {!isUser && message.sources?.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setSourcesOpen(open => !open)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {sourcesOpen ? labels.hideSources : labels.viewSources}
                </button>
                {sourcesOpen && (
                  <div className="mt-2 space-y-2">
                    {message.sources.map((source, index) => (
                      <div key={`${source.source}-${index}`} className="rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 p-3">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">{source.source}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                          {source.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser && !message.isError && (
              <button
                type="button"
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
              >
                {copied
                  ? <><FaCheck className="text-green-500 text-[9px]" /><span className="text-green-500">{labels.copied}</span></>
                  : <><FaCopy className="text-[9px]" /><span>{labels.copy}</span></>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportList = ({ items }) => {
  if (!items?.length) return null;
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

const FinalReportModal = ({
  report,
  labels,
  isArabic,
  reportRef,
  onClose,
  onPrint,
  onCopy,
  copied,
}) => {
  if (!report) return null;

  const diagnosis = report.diagnosis || {};
  const generatedAt = formatReportDate(report.generated_at, isArabic);

  const sections = [
    { key: 'patient_questions_summary', title: labels.patientQuestionsSummary || 'Patient Questions Summary', items: report.patient_questions_summary },
    { key: 'general_care_guidance', title: labels.generalCareGuidance || 'General Care Guidance', items: report.general_care_guidance },
    { key: 'common_treatment_options', title: labels.commonTreatmentOptions || 'Common Treatment Options', items: report.common_treatment_options },
    { key: 'red_flags', title: labels.redFlags || 'When to Seek Urgent Care', items: report.red_flags },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md final-report-no-print"
      onClick={onClose}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/15 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 sm:flex-row sm:items-center sm:justify-between final-report-no-print">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              {labels.badge || 'Patient-friendly summary'}
            </p>
            <h2 className="mt-1 text-xl font-black text-gray-900 dark:text-white">
              {labels.title || 'Consultation Report'}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
            >
              <FaPrint />
              <span>{labels.print || 'Print / Save PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
              <span>{copied ? labels.copied || 'Copied' : labels.copy || 'Copy Report'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label={labels.close || 'Close'}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <article ref={reportRef} className="final-report-print-scope px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-violet-50 p-5 dark:border-blue-900/50 dark:from-blue-950/40 dark:to-violet-950/30">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
              {labels.diagnosisResult || 'Diagnosis Result'}
            </p>
            <h3 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
              {diagnosis.display_name || diagnosis.predicted_label}
            </h3>
            <div className="mt-3 grid gap-3 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-3">
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500">{labels.confidence || 'Confidence'}</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{formatConfidence(diagnosis.confidence)}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500">{labels.analysisId || 'Analysis ID'}</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{report.analysis_id}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500">{labels.generatedAt || 'Generated at'}</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{generatedAt}</span>
              </div>
            </div>
          </div>

          <section className="mb-6">
            <h4 className="text-base font-black text-gray-900 dark:text-white">{labels.caseSummary || 'Case Summary'}</h4>
            <p className="mt-3 text-sm leading-7 text-gray-700 dark:text-gray-200">{report.summary}</p>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            {sections.map((section) => (
              <section key={section.key} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-5 dark:border-gray-700 dark:bg-gray-800/70">
                <h4 className="text-base font-black text-gray-900 dark:text-white">{section.title}</h4>
                <ReportList items={section.items} />
              </section>
            ))}
          </div>

          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/60 dark:bg-amber-950/30">
            <h4 className="text-base font-black text-amber-900 dark:text-amber-200">{labels.medicalDisclaimer || 'Medical Disclaimer'}</h4>
            <p className="mt-3 text-sm leading-7 text-amber-900/90 dark:text-amber-100/90">{report.disclaimer}</p>
          </section>
        </article>
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="flex items-end gap-2" style={{ animation: 'slideIn 0.3s ease forwards' }}>
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md mb-1 flex-shrink-0">
      <FaRobot className="text-white text-xs" />
    </div>
    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-1.5">
        {[0, 0.18, 0.36].map((delay, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"
            style={{ animation: `typingBounce 1.1s ease-in-out ${delay}s infinite` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const Chat = () => {
  const location = useLocation();
  const { t, language } = useTranslation();
  const isArabic = language === 'ar';
  const labels = t.chat || {};
  const queryAnalysisId = new URLSearchParams(location.search).get('analysisId');
  const analysisId = queryAnalysisId || location.state?.analysisId || '';
  const labelsRef = useRef(labels);

  const buildWelcomeMessage = useCallback((sourceLabels = labelsRef.current) => ({
    id: Date.now(),
    type: 'bot',
    text: sourceLabels.diagnosisWelcome || DEFAULT_WELCOME_MESSAGE,
    timestamp: new Date(),
  }), []);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [newMessageId, setNewMessageId] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const reportRef = useRef(null);

  useEffect(() => {
    labelsRef.current = labels;
  }, [labels]);

  const quickQuestions = useMemo(() => labels.ragQuickQuestions || [
    'What should I know about this condition?',
    'What are general treatment options?',
    'What symptoms need urgent care?',
    'What should I ask my dermatologist?',
  ], [labels.ragQuickQuestions]);

  useEffect(() => {
    if (!analysisId) {
      setMessages([]);
      setMessageCount(0);
      return;
    }

    const savedMessages = deserializeMessages(sessionStorage.getItem(getChatStorageKey(analysisId)));
    if (savedMessages?.length) {
      setMessages(savedMessages);
      setMessageCount(savedMessages.filter((message) => message.type === 'user').length);
      return;
    }

    const welcomeMessage = buildWelcomeMessage();
    setMessages([welcomeMessage]);
    setMessageCount(0);
    sessionStorage.setItem(getChatStorageKey(analysisId), JSON.stringify(serializeMessages([welcomeMessage])));
  }, [analysisId, buildWelcomeMessage]);

  useEffect(() => {
    if (!analysisId || messages.length === 0) return;
    sessionStorage.setItem(getChatStorageKey(analysisId), JSON.stringify(serializeMessages(messages)));
  }, [analysisId, messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return undefined;

    const frameId = requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });

    return () => cancelAnimationFrame(frameId);
  }, [messages, isTyping]);

  const getErrorMessage = useCallback((status) => {
    if (status === 401) return labels.errors?.unauthorized || 'Please sign in again to continue.';
    if (status === 403) return labels.errors?.forbidden || 'You cannot access this diagnosis.';
    if (status === 404) return labels.errors?.notFound || 'The selected diagnosis was not found.';
    return labels.errors?.generic || 'Unable to get an answer right now. Please try again later.';
  }, [labels.errors]);

  const handleSendMessage = useCallback(async (e, overrideText) => {
    e?.preventDefault();
    const text = (overrideText || inputMessage).trim();
    if (!text || isTyping || !analysisId) return;

    const userMessage = { id: Date.now(), type: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setNewMessageId(userMessage.id);
    setInputMessage('');
    setIsTyping(true);
    setMessageCount(prev => prev + 1);

    const result = await chatService.sendRagMessage({
      analysisId,
      message: text,
      language: hasArabicText(text) ? 'ar' : language,
    });

    if (result.success) {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: result.data.answer,
        disclaimer: result.data.disclaimer,
        sources: result.data.sources || [],
        diagnosisContext: result.data.diagnosis_context,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setNewMessageId(botMessage.id);
    } else {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: getErrorMessage(result.status),
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(labels.sendFailed || 'Failed to send message');
    }

    setIsTyping(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [analysisId, getErrorMessage, inputMessage, isTyping, labels.sendFailed, language]);

  const handleQuickQuestion = (question) => {
    if (isTyping) return;
    handleSendMessage(null, question);
  };

  const handleClearChat = () => {
    if (analysisId) {
      sessionStorage.removeItem(getChatStorageKey(analysisId));
    }
    const welcomeMessage = buildWelcomeMessage();
    setMessages([welcomeMessage]);
    setMessageCount(0);
    if (analysisId) {
      sessionStorage.setItem(getChatStorageKey(analysisId), JSON.stringify(serializeMessages([welcomeMessage])));
    }
    toast.success(labels.chatCleared || 'Chat cleared');
  };

  const reportLabels = labels.finalReport || {};

  const handleGenerateFinalReport = async () => {
    if (!analysisId || isReportLoading) return;

    const reportMessages = messages
      .filter((message) => message.text?.trim() && !message.isError)
      .map((message) => ({
        role: message.type === 'user' ? 'user' : 'assistant',
        content: message.text.trim(),
        timestamp: normalizeTimestamp(message.timestamp).toISOString(),
      }));

    setIsReportLoading(true);
    setReportCopied(false);
    const result = await chatService.generateFinalReport({
      analysisId,
      messages: reportMessages,
      language,
    });
    setIsReportLoading(false);

    if (result.success) {
      setFinalReport(result.data);
      setIsReportOpen(true);
      toast.success(reportLabels.generated || 'Consultation report generated');
      return;
    }

    toast.error(getErrorMessage(result.status) || reportLabels.generateFailed || 'Unable to generate the consultation report.');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleCopyReport = async () => {
    if (!finalReport) return;

    try {
      await navigator.clipboard.writeText(buildFinalReportText(finalReport, reportLabels, isArabic));
      setReportCopied(true);
      toast.success(reportLabels.copiedToast || 'Report copied');
      setTimeout(() => setReportCopied(false), 2000);
    } catch {
      toast.error(reportLabels.copyFailed || 'Unable to copy the report.');
    }
  };

  const charsLeft = MAX_CHARS - inputMessage.length;
  const isNearLimit = charsLeft < 100;

  if (!analysisId) {
    return (
      <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen py-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <FaRobot className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
              {labels.noAnalysisTitle || 'Diagnosis report required'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {labels.noAnalysisText || 'Start from a diagnosis report to get personalized educational guidance.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/history" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all inline-flex items-center justify-center gap-2">
                <FaHistory />
                <span>{labels.goToHistory || 'Go to History'}</span>
              </Link>
              <Link to="/upload" className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all inline-flex items-center justify-center gap-2">
                <FaUpload />
                <span>{labels.goToDiagnose || 'Start Diagnosis'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .chat-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
        @media print {
          body * { visibility: hidden !important; }
          .final-report-print-scope, .final-report-print-scope * { visibility: visible !important; }
          .final-report-print-scope {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #111827 !important;
            box-shadow: none !important;
          }
          .final-report-print-scope * {
            color: #111827 !important;
            border-color: #e5e7eb !important;
            box-shadow: none !important;
          }
          .final-report-no-print { display: contents !important; }
          .final-report-no-print > *:not(.final-report-print-scope) { visibility: hidden !important; }
        }
      `}</style>

      <div dir={isArabic ? 'rtl' : 'ltr'} className="h-[calc(100vh-80px)] min-h-[calc(100vh-80px)] overflow-hidden py-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-0 flex flex-col">
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-100/50 dark:shadow-black/40 border border-white/80 dark:border-gray-700/50 flex-1 min-h-0 flex flex-col">
            <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700/80">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full bg-blue-400 dark:bg-blue-500 opacity-20" style={{ animation: 'pulseRing 2s ease-out infinite' }} />
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/40 relative z-10">
                        <FaRobot className="text-white text-xl" />
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 rtl:right-auto rtl:left-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800 z-20" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        {labels.title || 'DermaVision Assistant'}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/30 dark:to-violet-900/30 border border-blue-100 dark:border-blue-800/50 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        <HiSparkles className="text-[9px]" /> RAG
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {isTyping ? labels.thinking || 'Thinking...' : labels.diagnosisMode || 'Diagnosis-aware guidance'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                      {labels.analysisLabel || 'Analysis ID'}: {analysisId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {messageCount > 0 && (
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 rounded-full border border-blue-100 dark:border-blue-800/50">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{messageCount} {labels.messages || 'msgs'}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateFinalReport}
                    disabled={isReportLoading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-800/50 text-xs font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isReportLoading ? <FaSpinner className="text-[10px] animate-spin" /> : <FaFileAlt className="text-[10px]" />}
                    <span className="hidden md:inline">
                      {isReportLoading ? reportLabels.generating || 'Generating...' : reportLabels.generateButton || 'Generate Consultation Report'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-100 dark:border-red-800/50 text-xs font-semibold hover:scale-105"
                  >
                    <FaTrash className="text-[10px]" />
                    <span className="hidden md:inline">{labels.clear || 'Clear'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div ref={messagesContainerRef} className="chat-scrollbar bg-gradient-to-b from-gray-50 to-slate-50/80 dark:from-gray-900 dark:to-gray-900/95 flex-1 min-h-0 overflow-y-auto px-5 py-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                  {new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
              </div>

              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isNew={message.id === newMessageId}
                    labels={{
                      copied: labels.copied || 'Copied',
                      copy: labels.copy || 'Copy',
                      sources: labels.sources || 'Sources',
                      viewSources: labels.viewSources || (isArabic ? 'عرض المصادر' : 'View sources'),
                      hideSources: labels.hideSources || 'Hide sources',
                      disclaimerLabel: labels.disclaimerLabel || (isArabic ? 'تنبيه طبي:' : 'Medical disclaimer:'),
                    }}
                    isArabic={isArabic}
                  />
                ))}
                {isTyping && <TypingDots />}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 px-5 py-3.5 border-t border-gray-100 dark:border-gray-700/80">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-2.5 uppercase tracking-widest flex items-center gap-1.5">
                <HiSparkles className="text-blue-400" /> {labels.quickQuestions || 'Quick Questions'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleQuickQuestion(question)}
                    disabled={isTyping}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 hover:from-blue-100 hover:to-violet-100 dark:hover:from-blue-900/40 dark:hover:to-violet-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200/70 dark:border-blue-700/50 transition-all hover:scale-105 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className={`bg-white dark:bg-gray-800 p-4 border-t transition-all duration-200 ${
              isFocused
                ? 'border-blue-300 dark:border-blue-600 shadow-inner shadow-blue-50 dark:shadow-blue-900/20'
                : 'border-gray-100 dark:border-gray-700/80'
            }`}>
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value.slice(0, MAX_CHARS))}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={labels.placeholder || 'Ask about this diagnosis...'}
                    rows={inputMessage.split('\n').length > 1 ? Math.min(inputMessage.split('\n').length, 4) : 1}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700/80 dark:text-white rounded-2xl focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all outline-none text-sm placeholder-gray-400 dark:placeholder-gray-500 resize-none leading-relaxed"
                    disabled={isTyping}
                  />
                  {inputMessage.length > 0 && (
                    <div className={`absolute bottom-2.5 ${isArabic ? 'left-3' : 'right-3'} text-[10px] font-semibold transition-colors ${
                      isNearLimit ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {charsLeft}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="w-11 h-11 bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/40 hover:shadow-lg hover:shadow-blue-300/50 hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex-shrink-0 mb-0.5"
                >
                  {isTyping ? <FaSpinner className="animate-spin text-sm" /> : <FaPaperPlane className="text-sm" />}
                </button>
              </form>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-2.5">
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {labels.safetyNote || 'Educational guidance only. It is not a personal prescription.'}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  {labels.enterHint || 'Shift+Enter for new line'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FinalReportModal
        report={isReportOpen ? finalReport : null}
        labels={reportLabels}
        isArabic={isArabic}
        reportRef={reportRef}
        onClose={() => setIsReportOpen(false)}
        onPrint={handlePrintReport}
        onCopy={handleCopyReport}
        copied={reportCopied}
      />
    </>
  );
};

export default Chat;
