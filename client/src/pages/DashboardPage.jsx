import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineChartBar, HiOutlineBriefcase, HiOutlineTrendingUp, HiOutlineUpload } from 'react-icons/hi';
import api from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, resumesRes] = await Promise.all([
          api.get('/analysis/dashboard/stats'),
          api.get('/resumes'),
        ]);
        setStats(statsRes.data.data.stats);
        setResumes(resumesRes.data.data.resumes);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSkeleton />;

  const statCards = [
    { icon: HiOutlineDocumentText, label: 'Total Resumes', value: stats?.totalResumes || 0, color: 'from-blue-500 to-cyan-500' },
    { icon: HiOutlineChartBar, label: 'Analyses Done', value: stats?.totalAnalyses || 0, color: 'from-primary-500 to-accent-500' },
    { icon: HiOutlineTrendingUp, label: 'Average Score', value: stats?.averageScore || 0, color: 'from-emerald-500 to-teal-500' },
    { icon: HiOutlineBriefcase, label: 'Job Matches', value: stats?.totalMatches || 0, color: 'from-orange-500 to-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Dashboard</h1>
        <p className="text-surface-500 mt-1">Overview of your resume analysis activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card !p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold dark:text-white">{card.value}</p>
                <p className="text-xs text-surface-500">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Resumes */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold dark:text-white">Recent Resumes</h2>
          <Link to="/dashboard/upload" className="btn-primary text-sm !px-4 !py-2 flex items-center gap-2">
            <HiOutlineUpload className="w-4 h-4" /> Upload New
          </Link>
        </div>
        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineDocumentText className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
            <p className="text-surface-500 mb-4">No resumes uploaded yet</p>
            <Link to="/dashboard/upload" className="btn-primary text-sm">Upload Your First Resume</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.slice(0, 5).map((r) => (
              <div key={r._id} className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <HiOutlineDocumentText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{r.originalName}</p>
                    <p className="text-xs text-surface-500">{new Date(r.createdAt).toLocaleDateString()} · {(r.fileSize / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${r.status === 'analyzed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : r.status === 'parsed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Trend */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold dark:text-white">
              Score Trend
            </h2>
            <p className="text-sm text-surface-500 mt-1">
              Track your ATS performance over time
            </p>
          </div>

          {stats?.recentScores?.length > 0 && (
            <span className="text-xs px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500">
              Last {stats.recentScores.length} analyses
            </span>
          )}
        </div>

        {stats?.recentScores?.length > 0 ? (
          <>
            {/* Chart */}
            <div className="w-full h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.recentScores.map((item) => ({
                    ...item,
                    score: Math.max(
                      0,
                      Math.min(100, Number(item.score) || 0)
                    ),
                    label: new Date(item.date).toLocaleDateString(
                      undefined,
                      {
                        day: "2-digit",
                        month: "short",
                      }
                    ),
                  }))}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    strokeOpacity={0.15}
                  />

                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 11,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    tick={{
                      fontSize: 11,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    formatter={(value) => [`${value}/100`, "ATS Score"]}
                    labelFormatter={(label) => `Analysis: ${label}`}
                  />

                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      strokeWidth: 2,
                      fill: "#10b981",
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Statistics */}
            {(() => {
              const scores = stats.recentScores
                .map((item) => Number(item.score))
                .filter((score) => !isNaN(score));

              const latest = scores[scores.length - 1] ?? 0;
              const best = Math.max(...scores);
              const average = Math.round(
                scores.reduce((sum, score) => sum + score, 0) /
                scores.length
              );

              const previous =
                scores.length > 1 ? scores[scores.length - 2] : null;

              const change =
                previous !== null ? latest - previous : null;

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  {/* Latest */}
                  <div className="rounded-xl bg-surface-50 dark:bg-surface-800/50 p-4">
                    <p className="text-xs text-surface-500">
                      Latest Score
                    </p>
                    <p className="text-2xl font-bold mt-1 dark:text-white">
                      {latest}
                      <span className="text-sm font-normal text-surface-500">
                        /100
                      </span>
                    </p>
                  </div>

                  {/* Best */}
                  <div className="rounded-xl bg-surface-50 dark:bg-surface-800/50 p-4">
                    <p className="text-xs text-surface-500">
                      Best Score
                    </p>
                    <p className="text-2xl font-bold mt-1 dark:text-white">
                      {best}
                      <span className="text-sm font-normal text-surface-500">
                        /100
                      </span>
                    </p>
                  </div>

                  {/* Average */}
                  <div className="rounded-xl bg-surface-50 dark:bg-surface-800/50 p-4">
                    <p className="text-xs text-surface-500">
                      Average
                    </p>
                    <p className="text-2xl font-bold mt-1 dark:text-white">
                      {average}
                      <span className="text-sm font-normal text-surface-500">
                        /100
                      </span>
                    </p>
                  </div>

                  {/* Change */}
                  <div className="rounded-xl bg-surface-50 dark:bg-surface-800/50 p-4">
                    <p className="text-xs text-surface-500">
                      Recent Change
                    </p>

                    <p
                      className={`text-2xl font-bold mt-1 ${change === null
                          ? "text-surface-500"
                          : change > 0
                            ? "text-emerald-500"
                            : change < 0
                              ? "text-red-500"
                              : "text-surface-500"
                        }`}
                    >
                      {change === null
                        ? "—"
                        : `${change > 0 ? "+" : ""}${change}`}
                    </p>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          /* Empty State */
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>

            <h3 className="font-semibold dark:text-white">
              Your score journey starts here
            </h3>

            <p className="text-sm text-surface-500 mt-1 max-w-sm">
              Analyze your resume to start tracking your ATS
              performance over time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div><div className="h-8 w-48 bg-surface-200 dark:bg-surface-800 rounded-lg" /><div className="h-4 w-72 bg-surface-200 dark:bg-surface-800 rounded mt-2" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
    </div>
  );
}
