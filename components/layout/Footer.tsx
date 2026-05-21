export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Sales-DMS. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Chính sách</a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Điều khoản</a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Hỗ trợ</a>
        </div>
      </div>
    </footer>
  );
}
