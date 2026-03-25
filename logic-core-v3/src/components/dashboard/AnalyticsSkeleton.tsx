import React from 'react'

export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl h-[180px] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10" />
              <div className="h-6 w-16 rounded-full bg-white/5 border border-white/10" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-24 rounded bg-white/5" />
              <div className="h-10 w-32 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Skeleton */}
      <div className="rounded-3xl border border-white/5 bg-[#0c0e12]/40 p-8 backdrop-blur-3xl h-[400px] relative overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-2">
            <div className="h-5 w-48 rounded bg-white/10" />
            <div className="h-3 w-64 rounded bg-white/5" />
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-20 rounded bg-white/5" />
            <div className="h-4 w-20 rounded bg-white/5" />
          </div>
        </div>
        
        {/* Mocking the chart lines with blurred bars */}
        <div className="absolute inset-x-8 bottom-8 top-32 flex items-end gap-2">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="flex-1 bg-white/[0.03] rounded-t-sm" 
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
        
        {/* Blurred overlay for extra depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12]/60 to-transparent pointer-events-none" />
      </div>

      {/* List Skeleton (for Top Pages) */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl">
        <div className="h-5 w-48 rounded bg-white/10 mb-8" />
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-2">
                <div className="flex gap-4 items-center">
                  <div className="h-3 w-4 rounded bg-white/5" />
                  <div className="h-4 w-40 rounded bg-white/10" />
                </div>
                <div className="h-4 w-12 rounded bg-white/10" />
              </div>
              <div className="h-2 w-full rounded-full bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
