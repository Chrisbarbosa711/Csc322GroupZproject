import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFetchTokenStats } from '../costumeQuerys/tokenQuery';
import { useDocumentStats } from '../costumeQuerys/DocumentQuery';

export const UsageStats = () => {
  const { data, isPending, isError } = useDocumentStats();

  const stats = [
    {
      label: 'Words',
      value: data?.stats?.total_words?.toString() || '0',
      description: 'words edited in total',
    },
    {
      label: 'Documents',
      value: data?.stats?.total_documents?.toString() || '0',
      description: 'documents made in total',
    }
  ];

  return (
    <div className="bg-white border-1 border-gray-100 p-6 rounded-lg shadow-sm w-full max-w-4xl mx-auto">
      {/* <h2 className="text-2xl font-semibold text-gray-800 mb-6">Usage Statistics</h2> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="border-r border-gray-300 last:border-r-0 pr-6 last:pr-0">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>
      {/* <div className="text-sm text-gray-500 mt-4 text-right">All Time</div> */}
    </div>
  );
};


export const TokenStats = () => {
  const { userInfo } = useAuth();
  const { tokenStats, isPending, isError, error } = useFetchTokenStats();
  
  // define default stats data
  console.log(tokenStats);
  const defaultStats = [
    {
      label: 'Balance',
      value: userInfo?.tokens?.toString() || '0',
      description: 'tokens available',
    },
    {
      label: 'Pay',
      value: tokenStats?.data?.pay?.toString() || '0',
      description: 'Tokens paid in total',
    },
    {
      label: 'Reward',
      value: tokenStats?.data?.reward?.toString() || '0',
      description: 'Tokens rewarded in total',
    }
  ];
  
  // if userInfo exists, update stats data
  const stats = userInfo ? [
    {
      label: 'Balance',
      value: userInfo.tokens?.toString() || '0',
      description: 'tokens available',
    },
    ...defaultStats.slice(1)
  ] : defaultStats;

  return (
    <div className="bg-white border-1 border-gray-100 p-6 rounded-lg shadow-sm w-full max-w-4xl mx-auto">
      {/* <h2 className="text-2xl font-semibold text-gray-800 mb-6">Usage Statistics</h2> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="border-r border-gray-300 last:border-r-0 pr-6 last:pr-0">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>
      {/* <div className="text-sm text-gray-500 mt-4 text-right">All Time</div> */}
    </div>
  );
};

