'use client';

interface Category {
  id: string;
  name: string;
  _count: {
    bookmarks: number;
  };
}

interface Tag {
  id: string;
  name: string;
  _count: {
    bookmarks: number;
  };
}

interface SidebarProps {
  categories: Category[];
  tags: Tag[];
  selectedCategory: string | null;
  selectedTag: string | null;
  onCategoryClick: (category: string | null) => void;
  onTagClick: (tag: string | null) => void;
}

export default function Sidebar({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  onCategoryClick,
  onTagClick,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-delicious-lightblue p-4 rounded-lg">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-delicious-darkblue mb-3">Categories</h2>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategoryClick(null)}
              className={`w-full text-left px-3 py-1 rounded hover:bg-white transition ${
                selectedCategory === null ? 'bg-white font-semibold' : ''
              }`}
            >
              All
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onCategoryClick(category.name)}
                className={`w-full text-left px-3 py-1 rounded hover:bg-white transition ${
                  selectedCategory === category.name ? 'bg-white font-semibold' : ''
                }`}
              >
                {category.name} ({category._count.bookmarks})
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-bold text-delicious-darkblue mb-3">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagClick(selectedTag === tag.name ? null : tag.name)}
              className={`px-3 py-1 rounded text-sm transition ${
                selectedTag === tag.name
                  ? 'bg-delicious-blue text-white'
                  : 'bg-white hover:bg-delicious-blue hover:text-white'
              }`}
            >
              {tag.name} ({tag._count.bookmarks})
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
