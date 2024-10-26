export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/posts?per_page=20`
    );
    const posts = await response.json();

    if (!Array.isArray(posts)) {
      throw new Error('Invalid response format');
    }

    return posts.map((post: { slug: { toString: () => string } }) => ({
      slug: post.slug.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

type Params = Promise<{ slug: string }>;

type Post = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  // other fields from wp...
};

const postCache: { [key: string]: { post: Post; timestamp: number } } = {};
const POST_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function getSinglePost(slug: string) {
  const now = Date.now();

  if (
    postCache[slug] &&
    now - postCache[slug].timestamp < POST_CACHE_DURATION
  ) {
    console.log('Returned cache rendered post');
    return postCache[slug].post;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/posts?slug=${slug}`
  );
  const post = await response.json();

  postCache[slug] = {
    post: post[0], // need to go one level deeper into object
    timestamp: now,
  };

  return post[0];
}

import Link from 'next/link';

async function page(props: { params: Params }) {
  const params = await props.params;
  const slug = params.slug;
  const post = await getSinglePost(slug);

  return (
    <div className='single-blog-page grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <Link href='/blog'>Back</Link>
      <h2>{post.title.rendered}</h2>
      <div className='blog-post prose '>
        <div dangerouslySetInnerHTML={{ __html: post.content.rendered }}></div>
      </div>
    </div>
  );
}

export default page;
