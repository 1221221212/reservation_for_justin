// frontend/src/components/ui/header/CustomerHeader.tsx
import Link from 'next/link';

export default function CustomerHeader() {
  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <Link href="/">
        <a className="text-2xl font-bold">予約システム</a>
      </Link>
    </header>
  );
}
