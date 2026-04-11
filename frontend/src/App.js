import React, { useEffect, useState } from 'react';
import './index.css';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { TopKeywords } from './components/TopKeywords';
import { SentimentGauge } from './components/SentimentGauge';
import { 
  Youtube, Instagram, Twitter, 
  Hash, FileText, Menu, Search, SendHorizontal, Copy 
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [platform, setPlatform] = useState('youtube');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ analysis: [], word_cloud: [] });
  const [theme, setTheme] = useState('dark');
  const [currentPage, setCurrentPage] = useState('landing');
  const [toast, setToast] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

  const themeOptions = [
    { id: 'dark', label: 'Midnight', description: 'Deep contrast and strong clarity' },
    { id: 'light', label: 'Bright', description: 'Clean, calm workspace' },
    { id: 'ocean', label: 'Ocean', description: 'Cool teal gradients' },
    { id: 'sunset', label: 'Sunset', description: 'Warm amber highlights' },
  ];

  useEffect(() => {
    const activeTheme = themeOptions.find((option) => option.id === theme) ? theme : 'dark';
    const allThemes = themeOptions.map((option) => option.id);
    document.body.classList.remove(...allThemes.filter((name) => name !== activeTheme));
    document.body.classList.add(activeTheme);
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const isDark = theme !== 'light';
  const themeLabel = themeOptions.find((option) => option.id === theme)?.label || 'Theme';
  const themeDescription = themeOptions.find((option) => option.id === theme)?.description || '';
  const notify = (message) => setToast(message);
  const cycleTheme = () => {
    const currentIndex = themeOptions.findIndex((option) => option.id === theme);
    const nextIndex = (currentIndex + 1) % themeOptions.length;
    setTheme(themeOptions[nextIndex].id);
  };

  const optionActive = 'bg-white border-white text-black scale-105 shadow-lg shadow-white/10';
  const optionInactive = 'bg-[var(--panel-bg)] border-[var(--panel-border)] text-[var(--text-secondary)] hover:border-white/30';
  const panelBg = 'bg-[var(--panel-bg)]';
  const panelBorder = 'border-[var(--panel-border)]';
  const panelBorderStrong = 'border-[var(--panel-border-strong)]';
  const panelText = 'text-[var(--text-primary)]';
  const mutedText = 'text-[var(--text-muted)]';
  const secondaryText = 'text-[var(--text-secondary)]';
  const inputBg = 'bg-[var(--input-bg)]';
  const inputBorder = 'border-[var(--input-border)]';
  const placeholderText = 'placeholder:[var(--placeholder)]';


  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: <Youtube size={20}/>, placeholder: 'Paste Video URL...' },
    { id: 'instagram', name: 'Instagram', icon: <Instagram size={20}/>, placeholder: 'Enter @username...' },
    { id: 'twitter', name: 'Twitter', icon: <Twitter size={20}/>, placeholder: 'Topic or #Hashtag...' },
    { id: 'doc', name: 'Doc AI', icon: <FileText size={20}/>, placeholder: 'Paste text content...' },
  ];

  const handleAnalyze = async () => {
    if (!query) {
      notify('Please enter a URL or search term before running analysis.');
      return;
    }

    setLoading(true);
    setHasAnalyzed(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/analyze?query=${encodeURIComponent(query)}&platform=${platform}`
      );
      
      if (!response.ok) throw new Error("Backend connection failed");
      
      const result = await response.json();
      setData(result);
      notify('Insight generated successfully.');
    } catch (err) {
      console.error("Error:", err);
      notify("Error connecting to Backend. Ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTags = () => {
    if (data.metadata?.tags?.length > 0) {
      navigator.clipboard.writeText(data.metadata.tags.map(t => `#${t}`).join(' '));
      notify("Tags copied to clipboard!");
    } else {
      notify("No tags available to copy.");
    }
  };

  const handleCopyComments = () => {
    if (data.metadata?.top_10_comments?.length > 0) {
      const copyText = data.metadata.top_10_comments
        .map((c, i) => `${i+1}. ${c.author}: "${c.text}" (${Number(c.likes).toLocaleString()} likes)`)
        .join('\n\n');
      navigator.clipboard.writeText(copyText);
      notify("Top 10 Comments copied to clipboard!");
    } else {
      notify("No comments available to copy.");
    }
  };

  const calculateVibeScore = () => {
    if (!data.analysis || data.analysis.length === 0) return "0%";
    const positiveCount = data.analysis.filter(item => item.sentiment === "POSITIVE").length;
    return Math.round((positiveCount / data.analysis.length) * 100) + "%";
  };

  const sentimentCounts = [
    { name: 'Positive', value: data.analysis.filter(item => item.sentiment === 'POSITIVE').length, fill: '#22c55e' },
    { name: 'Neutral', value: data.analysis.filter(item => item.sentiment === 'NEUTRAL').length, fill: '#38bdf8' },
    { name: 'Negative', value: data.analysis.filter(item => item.sentiment === 'NEGATIVE').length, fill: '#f97316' },
  ];

  const keywordBreakdown = data.word_cloud.slice(0, 6).map((word) => ({ name: word.text, value: word.size || 8 }));

  const reachData = data.metadata?.reach_stats ? [
    { period: '24h', value: Number(data.metadata.reach_stats.daily) },
    { period: '7d', value: Number(data.metadata.reach_stats.weekly) },
    { period: '30d', value: Number(data.metadata.reach_stats.monthly) },
    { period: '1y', value: Number(data.metadata.reach_stats.yearly) },
  ] : [];

  const topKeyword = data.word_cloud?.[0]?.text || 'your topic';
  const similarRecommendations = [
    {
      title: 'Close Content Match',
      hint: data.metadata?.title ? `Build a follow-up on “${data.metadata.title}” with a fresh spin around ${topKeyword}` : `Build a follow-up using ${topKeyword}`,
    },
    {
      title: 'Trending Topic',
      hint: data.word_cloud.length > 0 ? `Lean into ${data.word_cloud[0].text}, ${data.word_cloud[1]?.text || 'related terms'}, and ${data.word_cloud[2]?.text || 'more topics'}` : 'Use trending keywords from your next analysis.',
    },
    {
      title: 'Tag Strategy',
      hint: data.metadata?.tags?.length > 0 ? `Promote this content using ${data.metadata.tags.slice(0, 4).map((tag) => `#${tag}`).join(' ')}` : 'Add rich tags once analysis returns metadata.',
    },
  ];

  const hasAnalyticsData = data.analysis.length > 0 || data.metadata;

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-500 ${isDark ? 'bg-black text-white selection:bg-white selection:text-black' : 'bg-slate-100 text-slate-900 selection:bg-slate-900 selection:text-white'}`}>
      <main className={`relative flex-1 transition-all duration-300 ${currentPage !== 'landing' && sidebarOpen ? 'lg:ml-64' : currentPage !== 'landing' ? 'lg:ml-20' : ''}`}>
        {currentPage !== 'landing' && (
          <div className={`fixed right-6 top-6 z-50 rounded-full border px-5 py-3 text-sm shadow-2xl backdrop-blur-xl transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'} ${isDark ? 'border-white/10 bg-slate-950/85 text-white' : 'border-slate-200 bg-white/95 text-slate-900'}`}>
            {toast}
          </div>
        )}
        {/* Mobile Header */}
        {currentPage !== 'landing' && (
          <div className={`lg:hidden flex items-center justify-between p-4 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
            <button onClick={() => setSidebarOpen(true)} className={isDark ? 'text-white' : 'text-slate-900'}>
              <Menu size={24}/>
            </button>
            <span className={`font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>VibeTrack</span>
            <button onClick={cycleTheme} className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${isDark ? 'border-white/20 bg-white text-black' : 'border-slate-300 bg-slate-900 text-white'}`}>
              {themeLabel}
            </button>
          </div>
        )}

        {currentPage !== 'landing' && (
          <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className={`text-5xl font-black tracking-tighter uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  VibeTrack<span className="text-[var(--text-secondary)]">.AI</span>
                </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
                Transform social media signals into polished sentiment insights, keyword intelligence, and audience-ready reports.
              </p>
              <p className="text-[var(--text-secondary)] mt-4 font-mono text-sm uppercase tracking-widest italic">
                // System Status: <span className={loading ? 'text-emerald-500 animate-pulse' : 'text-[var(--text-secondary)]'}>
                  {loading ? 'Analyzing Real-time Data...' : 'Ready'}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${theme === option.id ? 'bg-white border-white text-black shadow-lg shadow-white/10' : 'bg-[var(--panel-bg)] border-[var(--panel-border)] text-[var(--text-secondary)] hover:border-white/30'}`}>
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={cycleTheme} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${isDark ? 'border-white/20 bg-white text-black' : 'border-slate-300 bg-slate-900 text-white'}`}>
                  Switch Palette
                </button>
                <button className={`hidden lg:block transition-colors ${isDark ? 'text-[var(--text-secondary)] hover:text-white' : 'text-slate-600 hover:text-slate-900'}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
                  {sidebarOpen ? '[ Minimize ]' : '[ Expand ]'}
                </button>
              </div>
              <p className="text-[var(--text-secondary)] text-xs uppercase tracking-[0.3em]">{themeLabel} palette</p>
            </div>
          </header>

          {/* Platform Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-10">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPlatform(p.id);
                  setQuery('');
                }}
                className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${platform === p.id ? optionActive : optionInactive}`}
              >
                {p.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{p.name}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative mb-12 group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[var(--text-secondary)]">
              <Search size={20}/>
            </div>
            <input 
              type="text"
              className={`w-full ${inputBg} ${inputBorder} py-6 pl-14 pr-32 rounded-2xl ${panelText} outline-none focus:border-white transition-all text-lg ${placeholderText}`}
              placeholder={platforms.find(p => p.id === platform)?.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className={`absolute right-3 top-3 bottom-3 px-8 bg-white text-black font-black uppercase tracking-tighter rounded-xl transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 active:scale-95'}`}
            >
              {loading ? "Processing" : "Run"} <SendHorizontal size={18} className={loading ? "animate-ping" : ""}/>
            </button>
          </div>

          {/* Page Content */}
{currentPage === 'landing' ? (
          <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center px-6 py-20">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className={`text-6xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  VibeTrack<span className="text-[var(--text-secondary)]">.AI</span>
                </h1>
                <p className={`text-xl md:text-2xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                  Transform social media signals into polished sentiment insights, keyword intelligence, and audience-ready reports.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Get Started
                  </button>
                  <button 
                    onClick={() => setCurrentPage('explore')}
                    className={`border-2 ${isDark ? 'border-white text-white hover:bg-white hover:text-black' : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'} font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300`}
                  >
                    Explore Features
                  </button>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6">
              <div className="max-w-6xl mx-auto">
                <h2 className={`text-4xl font-black text-center mb-12 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Powerful Social Analytics
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                    <Youtube className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>YouTube Analysis</h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                      Analyze YouTube video comments for sentiment, keywords, and audience engagement metrics.
                    </p>
                  </div>
                  <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                    <Twitter className="w-12 h-12 text-blue-400 mb-4" />
                    <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Twitter Insights</h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                      Extract sentiment from Twitter threads and replies with real-time trend analysis.
                    </p>
                  </div>
                  <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                    <Instagram className="w-12 h-12 text-pink-500 mb-4" />
                    <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Instagram Reports</h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                      Scrape Instagram post comments and generate comprehensive sentiment reports.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className={`py-20 px-6 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className={`text-4xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Ready to Analyze?
                </h2>
                <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                  Start transforming social media data into actionable insights today.
                </p>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Launch Dashboard
                </button>
              </div>
            </section>
          </div>
        ) : (
          <>
            <div>
              <Sidebar theme={theme} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentView={currentPage} setCurrentView={setCurrentPage} />
            </div>
            <div className="content">
              <div className={`fixed right-6 top-6 z-50 rounded-full border px-5 py-3 text-sm shadow-2xl backdrop-blur-xl transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'} ${isDark ? 'border-white/10 bg-slate-950/85 text-white' : 'border-slate-200 bg-white/95 text-slate-900'}`}>
                {toast}
              </div>
            {/* Mobile Header */}
            <div className={`lg:hidden flex items-center justify-between p-4 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
              <button onClick={() => setSidebarOpen(true)} className={isDark ? 'text-white' : 'text-slate-900'}>
                <Menu size={24}/>
              </button>
              <span className={`font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>VibeTrack</span>
              <button onClick={cycleTheme} className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${isDark ? 'border-white/20 bg-white text-black' : 'border-slate-300 bg-slate-900 text-white'}`}>
                {themeLabel}
              </button>
            </div>

            <main className={`relative flex-1 transition-all duration-300 ${currentPage !== 'landing' && sidebarOpen ? 'lg:ml-64' : currentPage !== 'landing' ? 'lg:ml-20' : ''}`}>

            <div className="p-6 md:p-10 max-w-7xl mx-auto">
              {/* Header Section */}
              <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className={`text-5xl font-black tracking-tighter uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    VibeTrack<span className="text-[var(--text-secondary)]">.AI</span>
                  </h1>
                </div>
              </header>

              {currentPage === 'dashboard' && (
                <div>
              <StatsCards 
                total={data.analysis.length} 
                positive={calculateVibeScore()} 
                status={loading ? 'BUSY' : 'IDLE'} 
              />

              {!data.metadata && !loading && (
                <div className={`mt-10 ${panelBg} ${panelBorder} rounded-3xl p-10 text-center`}> 
                  <p className={`text-xl font-semibold ${panelText}`}>Ready when you are.</p>
                  <p className={`${secondaryText} mt-3 max-w-2xl mx-auto leading-relaxed`}>Paste a URL, handle, or hashtag above and click Run to uncover sentiment trends, keyword momentum, and high-impact engagement insights.</p>
                </div>
              )}

              {data.metadata && (
                <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Base Info */}
                  <div className="grid gap-6 lg:grid-cols-[1.85fr_1fr]">
                    <div>
                      <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em] mb-4">Video Intelligence</p>
                      <div className={`${panelBg} ${panelBorder} p-8 rounded-3xl hover:border-white/50 transition-all duration-500`}>
                        <h3 className={`text-2xl font-black ${panelText} tracking-tight`}>{data.metadata.title}</h3>
                        <div className={`flex flex-wrap gap-4 text-[var(--text-secondary)] text-sm mt-3 mb-6 font-medium`}>
                           <span className={panelText}>👤 {data.metadata.channel}</span>
                           <span>👁️ {Number(data.metadata.views).toLocaleString()} Views</span>
                           <span>👍 {Number(data.metadata.likes).toLocaleString()} Likes</span>
                           <span>💬 {Number(data.metadata.comments_count).toLocaleString()} Comments</span>
                           <span>⏳ {data.metadata.duration}</span>
                           <span>📅 {data.metadata.published_at}</span>
                        </div>
                        <p className={`${secondaryText} text-sm border-l-2 border-[var(--panel-border-strong)] pl-5 italic tracking-wide leading-relaxed`}>
                          {data.metadata.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <SentimentGauge value={Number(calculateVibeScore().replace('%', ''))} />
                    </div>
                  </div>

                  {data.metadata.reach_stats && (
                    <div>
                      <p className={`text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em] mb-4 pt-4 border-t ${panelBorderStrong}`}>Estimated Reach Performance</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <ReachTile label="24 Hours" value={data.metadata.reach_stats.daily} />
                        <ReachTile label="7 Days" value={data.metadata.reach_stats.weekly} />
                        <ReachTile label="30 Days" value={data.metadata.reach_stats.monthly} />
                        <ReachTile label="1 Year" value={data.metadata.reach_stats.yearly} />
                      </div>
                    </div>
                  )}

                  {data.metadata.tags && data.metadata.tags.length > 0 && (
                    <div>
                      <div className={`flex items-center justify-between mb-4 pt-4 border-t ${panelBorderStrong}`}>
                        <p className={`text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em]`}>Video Tags Database</p>
                        <button onClick={handleCopyTags} className="flex items-center gap-2 text-xs font-bold text-white bg-[#222] hover:bg-white hover:text-black px-4 py-2 rounded-lg transition-colors">
                          <Copy size={14}/> COPY TAGS
                        </button>
                      </div>
                      <div className={`${panelBg} ${panelBorder} p-6 rounded-3xl flex flex-wrap gap-2`}>
                        {data.metadata.tags.map((tag, i) => (
                          <span key={i} className={`text-[var(--text-secondary)] bg-[var(--surface-strong)] border-[var(--panel-border)] px-3 py-1.5 rounded-lg text-xs font-mono`}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.metadata.top_10_comments && data.metadata.top_10_comments.length > 0 && (
                    <div>
                      <div className={`flex items-center justify-between mb-4 pt-4 border-t ${panelBorderStrong}`}>
                        <p className={`text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em]`}>Top 10 High-Engagement Comments</p>
                        <button onClick={handleCopyComments} className="flex items-center gap-2 text-xs font-bold text-black bg-white hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors">
                          <Copy size={14}/> COPY COMMENTS
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.metadata.top_10_comments.map((comment, i) => (
                          <div key={i} className={`${panelBg} ${panelBorderStrong} p-5 rounded-2xl group hover:border-[var(--panel-border)] transition-all relative overflow-hidden`}>
                              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--panel-border-strong)] group-hover:bg-white transition-colors"></div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[var(--text-secondary)] text-xs font-bold">👤 {comment.author}</span>
                                <span className="text-[var(--text-muted)] text-xs font-mono">👍 {Number(comment.likes).toLocaleString()}</span>
                              </div>
                              <p className={`${panelText} text-sm`}>&quot;{comment.text}&quot;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {false && (
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-3 mb-6">
                <div className={`${panelBg} ${panelBorder} p-6 rounded-3xl`}>
                  <p className="text-[var(--text-secondary)] uppercase tracking-[0.3em] text-[10px] mb-3">Analytics Summary</p>
                  <h2 className={`text-3xl font-black ${panelText}`}>Data Review</h2>
                  <p className={`${secondaryText} mt-3 text-sm leading-7`}>Deep dives into sentiment trends, keyword performance and engagement projections.</p>
                </div>
                <div className={`${panelBg} ${panelBorder} p-6 rounded-3xl`}>
                  <p className="text-[var(--text-secondary)] uppercase tracking-[0.3em] text-[10px] mb-3">Current Score</p>
                  <h2 className="text-5xl font-black text-emerald-400">{calculateVibeScore()}</h2>
                  <p className={`${secondaryText} mt-3 text-sm`}>{data.analysis.length} total mentions reviewed.</p>
                </div>
                <div className={`${panelBg} ${panelBorder} p-6 rounded-3xl`}>
                  <p className="text-[var(--text-secondary)] uppercase tracking-[0.3em] text-[10px] mb-3">Data Sources</p>
                  <h2 className={`text-3xl font-black ${panelText}`}>{platform.toUpperCase()}</h2>
                  <p className={`${secondaryText} mt-3 text-sm`}>Sentiment, comments, reach estimates and keywords from the selected source.</p>
                </div>
              </div>

              {!hasAnalyticsData ? (
                <div className={`${panelBg} ${panelBorder} rounded-3xl p-10 text-center`}>
                  <p className={`text-xl font-semibold ${panelText}`}>Analytics is waiting for your first report.</p>
                  <p className={`${secondaryText} mt-3`}>Run an analysis in Dashboard to unlock charts, trends, and recommendations.</p>
                </div>
              ) : (
                <div className="grid gap-6 xl:grid-cols-2">
                  <div className={`${panelBg} ${panelBorder} p-6 rounded-3xl`}>
                    <p className="text-[var(--text-secondary)] uppercase tracking-[0.3em] text-[10px] mb-4">Sentiment Distribution</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={sentimentCounts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                        <XAxis dataKey="name" stroke={isDark ? '#cbd5e1' : '#475569'} />
                        <YAxis stroke={isDark ? '#cbd5e1' : '#475569'} />
                        <Tooltip wrapperStyle={{ background: isDark ? '#0f172a' : '#ffffff', border: 'none' }} />
                        <Bar dataKey="value" radius={[12,12,0,0]}>{sentimentCounts.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={`${panelBg} ${panelBorder} p-6 rounded-3xl`}>
                    <p className="text-[var(--text-secondary)] uppercase tracking-[0.3em] text-[10px] mb-4">Keyword Share</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={keywordBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                          {keywordBreakdown.map((entry, index) => (
                            <Cell key={`slice-${index}`} fill={[ '#38bdf8', '#f59e0b', '#34d399', '#a855f7', '#fb7185', '#60a5fa' ][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip wrapperStyle={{ background: isDark ? '#0f172a' : '#ffffff', border: 'none' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {reachData.length > 0 && (
                <div className={`${panelBg} ${panelBorder} p-6 rounded-3xl`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[var(--text-secondary)] uppercase tracking-[0.3em] text-[10px] mb-2">Reach Forecast</p>
                      <h3 className={`text-2xl font-bold ${panelText}`}>Projected engagement trend</h3>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={reachData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="period" stroke={isDark ? '#cbd5e1' : '#475569'} />
                      <YAxis stroke={isDark ? '#cbd5e1' : '#475569'} />
                      <Tooltip wrapperStyle={{ background: isDark ? '#0f172a' : '#ffffff', border: 'none' }} />
                      <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="url(#reachGradient)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {false && (
            <div className="space-y-8">
              <div className={`${panelBg} ${panelBorder} p-8 rounded-3xl`}>
                <p className="text-[var(--text-secondary)] uppercase tracking-[0.3em] text-[10px] mb-3">Explore Recommendations</p>
                <h2 className={`text-3xl font-black ${panelText}`}>Similar Content Pathways</h2>
                <p className={`${secondaryText} mt-3 text-sm leading-7`}>Actionable ideas generated from your latest analysis and keyword strengths.</p>
              </div>

              {!hasAnalyticsData ? (
                <div className={`${panelBg} ${panelBorder} rounded-3xl p-10 text-center`}>
                  <p className={`text-xl font-semibold ${panelText}`}>Explore is waiting for analysis data.</p>
                  <p className={`${secondaryText} mt-3`}>Run something on the Dashboard to surface tailored recommendations.</p>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                  {similarRecommendations.map((item, index) => (
                    <div key={index} className={`${panelBg} ${panelBorder} p-6 rounded-3xl hover:-translate-y-1 transition-all`}>
                      <p className="text-[var(--text-secondary)] uppercase tracking-[0.3em] text-[10px] mb-4">Recommendation</p>
                      <h3 className={`text-xl font-black ${panelText} mb-3`}>{item.title}</h3>
                      <p className={`${secondaryText} text-sm`}>{item.hint}</p>
                    </div>
                  ))}
                </div>
              )}

              {data.metadata?.tags?.length > 0 && (
                <div className={`${panelBg} ${panelBorder} p-8 rounded-3xl`}>
                  <p className="text-[var(--text-secondary)] uppercase tracking-[0.3em] text-[10px] mb-3">Similar Campaigns</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.metadata.tags.slice(0, 4).map((tag, index) => (
                      <div key={index} className={`${panelBg} border-[var(--panel-border)] p-5 rounded-3xl`}>
                        <p className="text-[var(--text-secondary)] text-xs uppercase tracking-[0.3em] mb-2">Use this tag</p>
                        <p className={`text-lg font-bold ${panelText}`}>#{tag}</p>
                        <p className={`${secondaryText} mt-3 text-sm`}>Build a series around this topic and cross-promote it for higher visibility.</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.word_cloud.length > 0 && (
                <div className={`${panelBg} ${panelBorder} p-8 rounded-3xl`}>
                  <p className="text-[var(--text-secondary)] uppercase tracking-[0.3em] text-[10px] mb-3">Explore Similar Topics</p>
                  <div className="flex flex-wrap gap-3">
                    {data.word_cloud.slice(0, 10).map((word, index) => (
                      <span key={index} className="bg-[var(--surface-strong)] text-[var(--text-secondary)] px-4 py-2 rounded-full text-xs font-semibold">{word.text}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Keyword Insight Tags */}
          {data.word_cloud.length > 0 && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <TopKeywords words={data.word_cloud} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatsTile({ label, value, color = "text-white" }) {
  return (
    <div className="bg-[var(--panel-bg)] border-[var(--panel-border)] p-8 rounded-3xl group hover:border-white transition-all duration-500">
      <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mb-3 group-hover:text-[var(--text-primary)] transition-colors">{label}</p>
      <h2 className={`text-6xl font-black tracking-tighter ${color}`}>{value}</h2>
    </div>
  );
}

function ReachTile({ label, value }) {
  return (
    <div className="bg-[var(--panel-bg)] border-[var(--panel-border)] p-5 rounded-2xl flex flex-col items-center justify-center text-center">
      <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mb-1">{label}</span>
      <span className="text-2xl font-black text-[var(--text-primary)]">{Number(value).toLocaleString()}</span>
    </div>
  );
}