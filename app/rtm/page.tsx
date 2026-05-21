import Link from "next/link";
import { ArrowLeft, Map, Target, TrendingUp } from "lucide-react";

export default function RTMPage() {
  const features = [
    {
      title: "Phân tích Vùng Trắng",
      description: "Bản đồ hiển thị các cửa hàng tiềm năng chưa được khai thác trong bán kính nhất định.",
      href: "/rtm/white-space",
      icon: <Map className="w-6 h-6 text-orange-500" />,
      color: "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50",
    },
    {
      title: "Quản lý Tuyến (Đang phát triển)",
      description: "Lên kế hoạch và tối ưu hóa tuyến đường cho nhân viên sales.",
      href: "#",
      icon: <Target className="w-6 h-6 text-blue-500" />,
      color: "bg-blue-500/10 border-blue-500/20 opacity-60 cursor-not-allowed",
    },
    {
      title: "Báo cáo Độ Phủ (Đang phát triển)",
      description: "Phân tích độ phủ sản phẩm trên từng khu vực địa lý.",
      href: "#",
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      color: "bg-green-500/10 border-green-500/20 opacity-60 cursor-not-allowed",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại Dashboard
        </Link>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Route To Market (RTM)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý và tối ưu hóa hệ thống phân phối, bao gồm bản đồ vùng trắng, định tuyến và độ phủ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className={feature.href === "#" ? "pointer-events-none" : ""}>
              <div className={`group p-6 rounded-2xl border transition-all duration-300 ${feature.href !== "#" && "hover:shadow-lg hover:-translate-y-1"} bg-white dark:bg-zinc-900 ${feature.color}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700">
                    {feature.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
