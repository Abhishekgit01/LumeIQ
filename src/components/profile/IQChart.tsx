'use client';

import { motion } from 'framer-motion';
import { User } from '@/types';
import { getIQHistoryData } from '@/lib/mockData';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip 
} from 'recharts';

interface IQChartProps {
  user: User;
  days?: number;
}

export function IQChart({ user, days = 30 }: IQChartProps) {
  const data = getIQHistoryData(user, days);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-semibold text-[#1a2e1a]">IQ History</h3>
        <span className="text-[12px] text-[#5e7a5e]">Last {days} days</span>
      </div>
      
      <div className="card-surface p-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="date" 
                stroke="#c8dfc8"
                tick={{ fontSize: 10, fill: '#5e7a5e' }}
                tickFormatter={(value) => value.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#c8dfc8"
                tick={{ fontSize: 10, fill: '#5e7a5e' }}
                domain={['dataMin - 5', 'dataMax + 5']}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #c8dfc8',
                  borderRadius: '12px',
                  color: '#1a2e1a',
                  fontSize: '13px',
                  boxShadow: '0 4px 16px rgba(45,138,78,0.08)'
                }}
                labelStyle={{ color: '#5e7a5e', fontSize: '11px' }}
              />
              <Line
                type="monotone"
                dataKey="iq"
                stroke="#2d8a4e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: '#2d8a4e', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
