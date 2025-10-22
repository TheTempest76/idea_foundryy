export type PostRow = {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  published: Date | null;
  createdAt: Date | null;
  authorId: number;
  username: string | null;
};