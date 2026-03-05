import { BlogPost } from "@/data/blogData";

export const getSortedPosts = (posts: BlogPost[]): BlogPost[] =>
  [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
