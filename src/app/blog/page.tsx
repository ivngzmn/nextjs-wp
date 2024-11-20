import Link from 'next/link';
import Image from 'next/image';
// TODO: check kebab case meta to show particular post
import { Key } from 'react';

type Post = {
  id: Key | null | undefined;
  slug: string;
  title: {
    rendered: string;
  };
  featured_media: number;
  featured_image?: WordPressMedia;
  excerpt: { rendered: string };
  meta: {
    tcFeaturedArticle: boolean;
    tcBreakingNews: boolean;
    tcArticleBrief: boolean;
  };
};

type WordPressMedia = {
  id: number;
  source_url: string;
  alt_text: string;
};

async function getMediaById(id: number): Promise<WordPressMedia> {
  const response = await fetch(
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL + `/media/${id}`
  );
  const media = await response.json();
  return {
    id: media.id,
    source_url: media.source_url,
    alt_text: media.alt_text,
  };
}

let cache: { posts: Post[]; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

async function getPosts(): Promise<Post[]> {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_DURATION) {
    console.log('Returning cached posts');
    return cache.posts;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/posts?per_page=20`
  );
  const posts = await response.json();
  // fetch featured images for all posts that have featured_media
  const postsWithImages = await Promise.all(
    posts.map(async (post: Post) => {
      if (post.featured_media) {
        const mediaData = await getMediaById(post.featured_media);
        return {
          ...post,
          meta: post.meta || {},
          featured_image: mediaData,
        };
      }
      return {
        ...post,
        meta: post.meta || {},
      };
    })
  );

  cache = {
    posts: postsWithImages,
    timestamp: now,
  };

  return postsWithImages;
}

const BlogPage = async () => {
  const posts = await getPosts();

  return (
    <div className='blog-page grid items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <h2>All Blog Posts</h2>
      <p>All blog posts are fetched from WordPress via the WP REST API.</p>
      <div className='posts prose'>
        {posts.map((post: Post) => {
          return (
            <article key={post.id}>
              <Link href={`/blog/${post.slug}`} className='post'>
                <Image
                  width={800}
                  height={400}
                  src={post.featured_image?.source_url || ''}
                  alt={post.featured_image?.alt_text || ''}
                  loading='lazy'
                  style={{ objectFit: 'contain' }}
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />
                <h3
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                ></h3>
                <div
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                ></div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default BlogPage;
