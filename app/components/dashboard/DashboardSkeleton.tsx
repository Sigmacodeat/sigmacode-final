/**
 * SIGMACODE AI - Premium Dashboard Skeleton
 *
 * Loading-State für Dashboard mit Premium Animations
 * Design: Shimmer Effects, Staggered Animations, Realistic Layout
 */

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Header Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gradient-to-br from-muted to-muted/50 animate-pulse rounded-xl" />
          <div className="h-10 w-48 bg-gradient-to-r from-muted to-muted/50 animate-shimmer rounded-lg" />
        </div>
        <div className="h-4 w-96 bg-gradient-to-r from-muted to-muted/50 animate-shimmer rounded" />
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-36 bg-gradient-to-br from-card to-card/80 border border-border/50 animate-pulse rounded-2xl shadow-lg"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-muted/50 rounded" />
                  <div className="h-8 w-16 bg-muted/70 rounded" />
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Firewall Widget Skeleton */}
        <div
          className="lg:col-span-3 h-64 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 border border-border/50 animate-pulse rounded-2xl shadow-lg"
          style={{ animationDelay: '200ms' }}
        >
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white/20 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-white/20 rounded" />
                  <div className="h-4 w-48 bg-white/10 rounded" />
                </div>
              </div>
              <div className="h-14 w-28 bg-white/20 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/10 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Agent List Skeleton */}
        <div
          className="lg:col-span-2 bg-gradient-to-br from-card to-card/50 border border-border/50 animate-pulse rounded-2xl shadow-lg"
          style={{ animationDelay: '300ms' }}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500/20 rounded-xl" />
                <div className="h-6 w-40 bg-muted rounded" />
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gradient-to-r from-muted to-muted/50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div
          className="bg-gradient-to-br from-card to-card/50 border border-border/50 animate-pulse rounded-2xl shadow-lg"
          style={{ animationDelay: '400ms' }}
        >
          <div className="p-6 space-y-4">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted/50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Handbook Skeleton */}
        <div
          className="lg:col-span-3 h-48 bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200/30 dark:border-blue-800/30 animate-pulse rounded-2xl shadow-lg"
          style={{ animationDelay: '500ms' }}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-500/20 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-40 bg-blue-500/20 rounded" />
                <div className="h-3 w-64 bg-blue-500/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
