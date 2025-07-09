'use client';

import Link from 'next/link';

/**
 * オーナー画面のサイドメニュー
 */
export default function OwnerSideMenu() {
  return (
    <aside className="w-64 p-4 bg-gray-100">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/admin/owner/store" className="block px-2 py-1 rounded hover:bg-gray-200">
              店舗管理
            </Link>
          </li>
          <li>
            <Link
              href="/admin/owner/user"
              className="block px-2 py-1 rounded hover:bg-gray-200"
            >
              ユーザー管理
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
