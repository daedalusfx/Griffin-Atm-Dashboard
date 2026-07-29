import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from '@/app//components/Dashboard';
import '@/app/i18n'; // Initialize i18n

// 👇 این دو خط بسیار مهم هستند و استایل‌های اصلی را لود می‌کنند
import '@/app/styles/globals.css';
import '@/app/styles/app.css'; 
// 👆 (بسته به اینکه کدام فایل حاوی دستورات Tailwind است، آن را ایمپورت کنید)

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}