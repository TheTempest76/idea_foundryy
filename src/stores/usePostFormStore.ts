'use client';

import { create } from 'zustand';

type State = {
  title: string;
  slug: string;
  touchedSlug: boolean;
  category: string;
  content: string;
  authorUsername: string;
};

type Actions = {
  setTitle: (v: string) => void;
  setSlug: (v: string) => void;
  touchSlug: () => void;
  setCategory: (v: string) => void;
  setContent: (v: string) => void;
  setAuthorUsername: (v: string) => void;
  reset: () => void;
};

const initial: State = {
  title: '',
  slug: '',
  touchedSlug: false,
  category: 'notes',
  content: '',
  authorUsername: 'guest',
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const usePostFormStore = create<State & Actions>((set, get) => ({
  ...initial,
  setTitle: (v) =>
    set((state) => ({
      title: v,
      // auto-generate slug until user edits it manually
      slug: state.touchedSlug ? state.slug : slugify(v),
    })),
  setSlug: (v) => set({ slug: v }),
  touchSlug: () => set({ touchedSlug: true }),
  setCategory: (v) => set({ category: v }),
  setContent: (v) => set({ content: v }),
  setAuthorUsername: (v) => set({ authorUsername: v }),
  reset: () => set(() => ({ ...initial })),
}));
