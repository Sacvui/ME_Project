import Link from "next/link";
import { ArrowRight, MapPin, BarChart3, Users } from "lucide-react";

export default function Home() {
  const modules = [
    {
      title: "RTM (Route To Market)",
      description: "Quản lý tuyến bán hàng, theo dõi độ phủ và phân tích vùng trắng tiềm năng.",
      href: "/rtm",
      icon: <MapPin className="w-8 h-8 text-blue-500" />,
      color: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50",
    },
    {
      title: "BI (Business Intelligence)",
      description: "Hệ thống báo cáo thông minh, phân tích dữ liệu chuyên sâu và dự báo doanh số.",
      href: "/bi",
      icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
      color: "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50",
    },
    {
      title: "SFE (Sales Force Effectiveness)",
      description: "Đánh giá hiệu suất nhân viên, quản lý KPI và tối ưu hóa lực lượng bán hàng.",
      href: "/sfe",
      icon: <Users className="w-8 h-8 text-emerald-500" />,
      color: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-12 lg:p-24 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sales-DMS <span className="text-blue-600 dark:text-blue-500">Dashboard</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Hệ thống quản lý phân phối và bán hàng toàn diện. Chọn một phân hệ bên dưới để bắt đầu.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <Link key={mod.title} href={mod.href}>
              <div
                className={`group h-full flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-zinc-900 ${mod.color}`}
              >
                <div className="mb-4 p-3 inline-flex rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700">
                  {mod.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {mod.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 flex-1">
                  {mod.description}
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Truy cập phân hệ
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
