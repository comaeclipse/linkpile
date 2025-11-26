export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: number;
  isRead: boolean;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface SuggestionResponse {
  tags: string[];
  suggestedDescription?: string;
}