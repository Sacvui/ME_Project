import { HardHat } from "lucide-react";

export default function BIPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-12 font-sans">
      <HardHat className="w-20 h-20 text-purple-500 mb-6 opacity-80" />
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        Business Intelligence (BI)
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mb-8">
        Phân hệ BI hiện đang trong quá trình phát triển. Vui lòng quay lại sau!
      </p>
    </div>
  );
}
