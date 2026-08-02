import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, GitCommit, Users, BookOpen } from 'lucide-react';

interface GitHubStats {
  publicRepos: number;
  followers: number;
  publicGists: number;
  userName: string;
}

const defaultStats: GitHubStats = {
  publicRepos: 18,
  followers: 12,
  publicGists: 2,
  userName: 'KrishnamGupta'
};

const GithubGraph: React.FC = () => {
  const [stats, setStats] = useState<GitHubStats>(defaultStats);
  const [eventDates, setEventDates] = useState<string[]>([]);
  const [contributionsData, setContributionsData] = useState<any[]>([]);
  const [yearlyContributions, setYearlyContributions] = useState<number>(0);
  const [isLoadedFromApi, setIsLoadedFromApi] = useState<boolean>(false);
  const githubUser = 'krishnamgupta29';

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${githubUser}`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            publicRepos: data.public_repos,
            followers: data.followers,
            publicGists: data.public_gists,
            userName: data.login
          });
        }
      } catch (error) {
        console.warn('Failed to fetch github stats, falling back to placeholders', error);
      }
    };

    fetchStats();
  }, [githubUser]);

  // Fetch real contribution activity from Deno API
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const res = await fetch(`https://github-contributions-api.deno.dev/${githubUser}.json`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.contributions) {
            setContributionsData(data.contributions);
            setYearlyContributions(data.totalContributions);
            setIsLoadedFromApi(true);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch github contributions via deno API, falling back to events', err);
      }
    };
    fetchContributions();
  }, [githubUser]);

  // Fetch event history as fallback
  useEffect(() => {
    if (isLoadedFromApi) return;

    const fetchEvents = async () => {
      const allDates: string[] = [];
      try {
        // Fetch up to 3 pages (90 events) to stay within rate limits
        for (let page = 1; page <= 3; page++) {
          const res = await fetch(`https://api.github.com/users/${githubUser}/events?per_page=30&page=${page}`);
          if (!res.ok) break;
          const events = await res.json();
          if (!Array.isArray(events) || events.length === 0) break;
          events.forEach((ev: { created_at: string; type: string }) => {
            if (['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent', 'IssueCommentEvent'].includes(ev.type)) {
              allDates.push(ev.created_at.slice(0, 10)); // YYYY-MM-DD
            }
          });
        }
      } catch (err) {
        console.warn('Failed to fetch github events', err);
      }
      setEventDates(allDates);
    };

    fetchEvents();
  }, [githubUser, isLoadedFromApi]);

  // Build heatmap grid: 24 columns (weeks) × 7 rows (days)
  const heatmap = useMemo(() => {
    if (isLoadedFromApi && contributionsData.length > 0) {
      const last24Weeks = contributionsData.slice(-24);
      const grid: { count: number; date: string; intensity: number }[][] = [];
      
      for (let r = 0; r < 7; r++) {
        const row: any[] = [];
        for (let c = 0; c < 24; c++) {
          const week = last24Weeks[c];
          const day = week && week[r];
          if (day) {
            let intensity = 0;
            const level = day.contributionLevel || 'NONE';
            if (level === 'FIRST_QUARTILE') intensity = 1;
            else if (level === 'SECOND_QUARTILE') intensity = 2;
            else if (level === 'THIRD_QUARTILE') intensity = 3;
            else if (level === 'FOURTH_QUARTILE') intensity = 4;
            
            row.push({
              count: day.contributionCount || 0,
              date: day.date || '',
              intensity
            });
          } else {
            row.push({ count: 0, date: '', intensity: 0 });
          }
        }
        grid.push(row);
      }
      return grid;
    }

    // Fallback: Build a date → count map from event dates
    const countMap: Record<string, number> = {};
    eventDates.forEach((d) => {
      countMap[d] = (countMap[d] || 0) + 1;
    });

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
    const totalCells = 24 * 7;
    const endOffset = 6 - dayOfWeek;
    
    const grid: { count: number; date: string; intensity: number }[][] = [];
    for (let r = 0; r < 7; r++) {
      const row: any[] = [];
      for (let c = 0; c < 24; c++) {
        const cellIndex = c * 7 + r;
        const daysAgo = totalCells - 1 - endOffset - cellIndex;
        
        if (daysAgo < 0) {
          row.push({ count: 0, date: '', intensity: 0 });
          continue;
        }
        
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().slice(0, 10);
        
        const count = countMap[dateStr] || 0;
        let intensity = 0;
        if (count >= 5) intensity = 4;
        else if (count >= 3) intensity = 3;
        else if (count >= 2) intensity = 2;
        else if (count >= 1) intensity = 1;
        
        row.push({
          count,
          date: dateStr,
          intensity
        });
      }
      grid.push(row);
    }
    return grid;
  }, [isLoadedFromApi, contributionsData, eventDates]);

  // Count total contributions
  const totalContributionsToShow = useMemo(() => {
    if (isLoadedFromApi) {
      return yearlyContributions;
    }
    return eventDates.length;
  }, [isLoadedFromApi, yearlyContributions, eventDates]);

  const getHeatmapColorClass = (val: number) => {
    switch (val) {
      case 1: return 'bg-harvest-orange/20 border-harvest-orange/30';
      case 2: return 'bg-deep-saffron/40 border-deep-saffron/50';
      case 3: return 'bg-gold/70 border-gold/80';
      case 4: return 'bg-sunbeam-yellow border-sunbeam-yellow shadow-[0_0_8px_rgba(255,234,0,0.5)]';
      default: return 'bg-white/5 dark:bg-white/5 light:bg-black/5 border-transparent';
    }
  };

  return (
    <section className="py-16 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 overflow-hidden border-t border-white/5 dark:border-white/5 light:border-black/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-left">
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-black text-2xl sm:text-3xl text-white dark:text-white light:text-black tracking-tight flex items-center gap-2.5"
          >
            Building In Public
          </motion.h3>
          <p className="mt-1 text-[11px] text-white/40 font-sans">
            Live data from <a href={`https://github.com/${githubUser}`} target="_blank" rel="noopener noreferrer" className="text-harvest-orange hover:underline">@{githubUser}</a>
          </p>
          <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          {/* Heatmap Grid */}
          <div className="lg:col-span-8 p-6 rounded-3xl glass-card border border-white/5 flex flex-col justify-center">
            <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-white/40 dark:text-white/40 light:text-black/45 block mb-4">
              Contribution Activity (Last 24 Weeks)
            </span>
            
            {/* SVG Contribution Layout */}
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="flex flex-col gap-1.5 min-w-[340px]">
                {heatmap.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1.5">
                    {row.map((day, cIdx) => (
                      <div
                        key={cIdx}
                        className={`w-[12px] h-[12px] sm:w-[13px] sm:h-[13px] rounded-[3px] border transition-all duration-300 ${getHeatmapColorClass(
                          day.intensity
                        )}`}
                        title={day.date ? `${day.count} contributions on ${day.date}` : 'No contributions'}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Labels Legend */}
            <div className="flex items-center gap-2 text-[10px] text-white/40 dark:text-white/40 light:text-black/45 mt-4 self-end">
              <span>Less</span>
              <div className="w-[10px] h-[10px] rounded-[2px] bg-white/5" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-harvest-orange/20" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-deep-saffron/40" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-gold/70" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-sunbeam-yellow" />
              <span>More</span>
            </div>
          </div>

          {/* Stats Column */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            {/* Repos card */}
            <div className="p-5 rounded-2xl bg-white/3 dark:bg-white/3 light:bg-black/2 border border-white/5 dark:border-white/5 light:border-black/5 flex flex-col justify-between min-h-[110px]">
              <div className="p-2 w-max rounded-lg bg-harvest-orange/10 text-harvest-orange">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[22px] font-display font-black text-white dark:text-white light:text-black">
                  {stats.publicRepos}
                </span>
                <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-white/40 dark:text-white/40 light:text-black/45 block mt-0.5">
                  Public Repos
                </span>
              </div>
            </div>

            {/* Followers Card */}
            <div className="p-5 rounded-2xl bg-white/3 dark:bg-white/3 light:bg-black/2 border border-white/5 dark:border-white/5 light:border-black/5 flex flex-col justify-between min-h-[110px]">
              <div className="p-2 w-max rounded-lg bg-gold/10 text-gold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[22px] font-display font-black text-white dark:text-white light:text-black">
                  {stats.followers}
                </span>
                <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-white/40 dark:text-white/40 light:text-black/45 block mt-0.5">
                  Followers
                </span>
              </div>
            </div>

            {/* Contributions Card */}
            <div className="p-5 rounded-2xl bg-white/3 dark:bg-white/3 light:bg-black/2 border border-white/5 dark:border-white/5 light:border-black/5 flex flex-col justify-between min-h-[110px]">
              <div className="p-2 w-max rounded-lg bg-deep-saffron/10 text-deep-saffron">
                <GitCommit className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[22px] font-display font-black text-white dark:text-white light:text-black">
                  {totalContributionsToShow > 0 ? totalContributionsToShow : '—'}
                </span>
                <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-white/40 dark:text-white/40 light:text-black/45 block mt-0.5">
                  Yearly Contributions
                </span>
              </div>
            </div>

            {/* Gists Card */}
            <div className="p-5 rounded-2xl bg-white/3 dark:bg-white/3 light:bg-black/2 border border-white/5 dark:border-white/5 light:border-black/5 flex flex-col justify-between min-h-[110px]">
              <div className="p-2 w-max rounded-lg bg-school-bus/10 text-school-bus">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[22px] font-display font-black text-white dark:text-white light:text-black">
                  {stats.publicGists}
                </span>
                <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-white/40 dark:text-white/40 light:text-black/45 block mt-0.5">
                  Public Gists
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default GithubGraph;
