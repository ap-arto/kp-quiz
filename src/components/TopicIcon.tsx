const icons: Record<string, string> = {
  symbols: 'M5 21V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0',
  geography: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15',
  history: 'M4 21V9h16v12M2 9l10-6 10 6M8 12v6m4-6v6m4-6v6M2 21h20',
  traditions: 'M5 10h14v11H5ZM3 6h18v4H3Zm9 0v15M12 6C4 6 5 0 9 3l3 3Zm0 0c8 0 7-6 3-3l-3 3Z',
  people: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-3a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v3',
  general: 'm3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8',
}

export function TopicIcon({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icons[id]} />
    </svg>
  )
}
