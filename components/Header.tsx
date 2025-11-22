'use client';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function Header({ onSearch, searchQuery }: HeaderProps) {
  return (
    <header className="bg-delicious-blue text-white shadow-md">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">link.pile</h1>
          <div className="flex-1 max-w-xl mx-8">
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full px-4 py-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-delicious-lightblue"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
