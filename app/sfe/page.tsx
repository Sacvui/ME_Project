import Link from "next/link";
import { ArrowLeft, HardHat } from "lucide-react";

export default function SFEPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-12 font-sans flex flex-col items-center justify-center text-center">
      <HardHat className="w-20 h-20 text-emerald-500 mb-6 opacity-80" />
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        Sales Force Effectiveness (SFE)
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mb-8">
        Phân hệ SFE hiện đang trong quá trình phát triển. Vui lòng quay lại sau!
      </p>
      <Link 
        href="/" 
        className="inline-flex items-center px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại Dashboard
      </Link>
    </div>
  );
}
