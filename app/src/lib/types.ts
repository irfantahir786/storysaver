export interface ProfileData {
  handle: string;
  name: string;
  avatarUrl: string;
  bio: string;
  stats: {
    posts: number;
    followers: string;
    following: number;
  };
  posts: ContentItem[];
  stories: ContentItem[];
}

export interface ContentItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl: string;
}
