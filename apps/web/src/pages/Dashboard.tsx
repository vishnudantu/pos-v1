import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { MessageSquare, Calendar, TrendingUp, Users, AlertCircle, Megaphone, Clock, MapPin, ChevronRight, Zap } from 'lucide-react';

interface StatCard {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
  gradient: string;
}

export default function Dashboard() {
  const { activePolitician } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    setTimeout(() => {
      setStats([
        { icon: MessageSquare, label: 'Pending Grievances', value: 12, trend: '+3 today', gradient: 'from-orange-500 to-red-500' },
        { icon: Calendar, label: "Today's Events", value: 4, trend: '2 upcoming', gradient: 'from-blue-500 to-cyan-500' },
        { icon: TrendingUp, label: 'Approval Rating', value: '78%', trend: '+5% this month', gradient: 'from-emerald-500 to-green-500' },
        { icon: Users, label: 'Constituents Reached', value: '2.4K', trend: '+12% this week', gradient: 'from-purple-500 to-pink-500' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-100/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/50 mb-1">{greeting}</p>
              <h1 className="text-3xl font-bold text-white">
                {activePolitician?.display_name || activePolitician?.full_name || 'Dashboard'}
              </h1>
              <p className="text-white/40 mt-1">{activePolitician?.designation} • {activePolitician?.constituency_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-white font-semibold">{activePolitician?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}</p>
                <p className="text-white/40 text-sm">Online</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-500/30">
                {activePolitician?.full_name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {['📊 View Reports', '📝 New Grievance', '📅 Schedule', '📢 Broadcast'].map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-brand-500/50 transition-all"
              >
                {action}
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                  {stat.trend && (
                    <span className="text-emerald-400 text-sm font-semibold bg-emerald-500/20 px-3 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Priority Alerts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Priority Alerts</h2>
            <button className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-error/10 border border-error/30">
              <div className="w-10 h-10 rounded-xl bg-error/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-error" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">3 Urgent Grievances</p>
                <p className="text-white/50 text-sm">Require immediate attention</p>
              </div>
              <ChevronRight className="text-white/30" />
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-warning/10 border border-warning/30">
              <div className="w-10 h-10 rounded-xl bg-warning/30 flex items-center justify-center flex-shrink-0">
                <Megaphone className="text-warning" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">5 Negative Mentions</p>
                <p className="text-white/50 text-sm">Last 24 hours</p>
              </div>
              <ChevronRight className="text-white/30" />
            </div>
          </div>
        </section>

        {/* Today's Schedule */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Today's Schedule</h2>
            <button className="text-brand-400 hover:text-brand-300 text-sm font-medium">Add Event</button>
          </div>
          <div className="space-y-3">
            {[
              { time: '10:00 AM', title: 'Constituency Meeting', location: 'Office', icon: '🏛️' },
              { time: '02:00 PM', title: 'Ground Visit', location: 'Booth 45', icon: '📍' },
              { time: '05:00 PM', title: 'Press Conference', location: 'Media Center', icon: '🎤' },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 4 }}
                className="glass-card p-5 flex items-center gap-4 cursor-pointer"
              >
                <div className="text-3xl">{event.icon}</div>
                <div className="w-1 h-12 rounded-full bg-gradient-to-b from-brand-500 to-accent-500" />
                <div className="flex-1">
                  <p className="text-brand-400 font-semibold mb-1">{event.time}</p>
                  <p className="text-white font-medium">{event.title}</p>
                  <p className="text-white/40 text-sm flex items-center gap-1">
                    <MapPin size={12} /> {event.location}
                  </p>
                </div>
                <ChevronRight className="text-white/30" />
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-24 right-6 w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-2xl shadow-brand-500/50 flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Zap size={28} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
