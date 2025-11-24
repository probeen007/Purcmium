import React from 'react';
import { motion } from 'framer-motion';

const MetricsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  trend, 
  trendDirection = 'up',
  className = '' 
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      text: 'text-blue-600',
      light: 'bg-blue-50'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      text: 'text-green-600',
      light: 'bg-green-50'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      text: 'text-purple-600',
      light: 'bg-purple-50'
    },
    gold: {
      bg: 'from-yellow-500 to-yellow-600',
      text: 'text-yellow-600',
      light: 'bg-yellow-50'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      text: 'text-red-600',
      light: 'bg-red-50'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {value}
          </p>
          {trend && (
            <p className="text-sm text-gray-500 flex items-center">
              {trendDirection === 'up' && (
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trendDirection === 'down' && (
                <svg className="w-3 h-3 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend}
            </p>
          )}
        </div>
        
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colors.light} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsCard;