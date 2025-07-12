// frontend/src/components/ui/sidemenu/storeMenu.ts
export interface StoreMenuItem {
  key: string;
  label: string;
  href?: string;
  roles?: string[];           // 表示許可ロール
  children?: StoreMenuItem[];
}

export const STORE_MENU: StoreMenuItem[] = [
  {
    key: 'layout',
    label: '店舗レイアウト設定',
    href: '/admin/store/[storeId]/layout',
    roles: ['owner', 'manager'],
    children: [
      {
        key: 'seatAttributes',
        label: '座席属性設定',
        href: '/admin/store/[storeId]/layout/attribute',
      },
      {
        key: 'seatConfiguration',
        label: '座席設定',
        href: '/admin/store/[storeId]/layout/seat',
      },
      {
        key: 'layout',
        label: 'レイアウト設定',
        href: '/admin/store/[storeId]/layout',
      },
    ],
  },
  {
    key: 'schedule',
    label: '営業日／休業日設定',
    href: '/admin/store/[storeId]/schedule',
    roles: ['owner', 'manager'],
    children: [
      {
        key: 'openDays',
        label: '営業日設定',
        href: '/admin/store/[storeId]/schedule/weekly',
      },
      {
        key: 'closedDays',
        label: '定休日設定',
        href: '/admin/store/[storeId]/schedule/closed',
      },
      {
        key: 'specialDates',
        label: '臨時営業日／休業日設定',
        href: '/admin/store/[storeId]/schedule/special-day',
      },
    ],
  },
  {
    key: 'course',
    label: 'コース設定',
    href: '/admin/store/[storeId]/course',
    roles: ['owner', 'manager'],
    children: [
      {
        key: 'courseConfig',
        label: 'コース設定',
        href: '/admin/store/[storeId]/course',
      },
      {
        key: 'ingredient',
        label: '材料設定',
        href: '/admin/store/[storeId]/course/materials',
      },
    ],
  },
  {
    key: 'reservations',
    label: '予約確認',
    href: '/admin/store/[storeId]/reservations/list',
    roles: ['owner', 'manager', 'staff'],
    children: [
      {
        key: 'reservationList',
        label: '予約リスト・検索',
        href: '/admin/store/[storeId]/reservations/list',
      },
      {
        key: 'calendar',
        label: 'カレンダー',
        href: '/admin/store/[storeId]/reservations/calendar',
      },
      {
        key: 'dailyView',
        label: '日別予約ビュー',
        href: '/admin/store/[storeId]/reservations/daily',
      },
      {
        key: 'manualAdd',
        label: '予約手動追加',
        href: '/admin/store/[storeId]/reservations/manual',
      },
    ],
  },
  {
    key: 'reports',
    label: 'レポート',
    href: '/admin/store/[storeId]/reports/sales',
    roles: ['owner', 'manager'],
    children: [
      {
        key: 'salesForecast',
        label: '売上予測',
        href: '/admin/store/[storeId]/reports/sales',
      },
      {
        key: 'orderForecast',
        label: '発注予測',
        href: '/admin/store/[storeId]/reports/orders',
      },
    ],
  },
  {
    key: 'settings',
    label: '各種設定',
    href: '/admin/store/[storeId]/settings/info',
    roles: ['owner', 'manager'],
    children: [
      {
        key: 'storeInfo',
        label: '店舗情報設定',
        href: '/admin/store/[storeId]/settings/info',
      },
      {
        key: 'reservationConfig',
        label: '予約設定',
        href: '/admin/store/[storeId]/settings/reservation',
      },
    ],
  },
];
