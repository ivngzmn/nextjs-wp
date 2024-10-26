import Link from 'next/link';
import camelCase from 'lodash.camelcase';
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  AwaitedReactNode,
} from 'react';

type Post = {
  id: Key | null | undefined;
  slug: string;
  title: {
    rendered:
      | string
      | number
      | bigint
      | boolean
      | ReactElement<string, string | JSXElementConstructor<string>>
      | Iterable<ReactNode>
      | ReactPortal
      | Promise<AwaitedReactNode>
      | null
      | undefined;
  };
  excerpt: { rendered: string };
  meta: {
    tcFeaturedArticle: boolean;
    tcBreakingNews: boolean;
    tcArticleBrief: boolean;
  };
};

let cache: { posts: Post[]; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

function convertKeysToCamelCase(obj: any) {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = camelCase(key);
      acc[camelKey] = convertKeysToCamelCase(obj[key]);
      return acc;
    }, {} as any);
  } else if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamelCase(item));
  }
  return obj;
}

async function getPosts() {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_DURATION) {
    console.log('Returning cached posts');
    return cache.posts;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/posts?per_page=20`
  );
  const posts = await response.json();
  const transformedPosts = posts.map((post: any) => ({
    ...post,
    meta: convertKeysToCamelCase(post.meta),
  }));
  cache = {
    posts: transformedPosts,
    timestamp: now,
  };

  return transformedPosts;
}

const BlogPage = async () => {
  const posts = await getPosts();

  return (
    <div className='blog-page grid items-center justify-items-center  p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <h2>All Blog Posts</h2>
      <p>All blog posts are fetched from WordPress via the WP REST API.</p>
      <div className='posts prose'>
        {posts.map((post: Post) => {
          // console.log(
          //   post.meta.tcFeaturedArticle,
          //   post.meta.tcBreakingNews,
          //   post.meta.tcArticleBrief
          // );
          return (
            <Link href={`/blog/${post.slug}`} className='post' key={post.slug}>
              <h3>{post.title.rendered}</h3>

              <div
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
              ></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BlogPage;
