import Link from 'next/link';
import { Home, MapPin, BarChart3, Users, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-500">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline">Sales-DMS</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
          <Link href="/rtm" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
            <MapPin className="w-4 h-4" /> <span className="hidden sm:inline">RTM</span>
          </Link>
          <Link href="/bi" className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors">
            <BarChart3 className="w-4 h-4" /> <span className="hidden sm:inline">BI</span>
          </Link>
          <Link href="/sfe" className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors">
            <Users className="w-4 h-4" /> <span className="hidden sm:inline">SFE</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full transition-colors hidden sm:flex">
            Trang Chủ
          </Link>
          <button className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
