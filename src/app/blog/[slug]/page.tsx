import Link from 'next/link';
import Image from 'next/image';

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
  featured_media: number;
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

async function getMediaById(id: number) {
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

async function page(props: { params: Params }) {
  const params = await props.params;
  const slug = params.slug;
  const post = await getSinglePost(slug);
  const featuredImage = await getMediaById(post.featured_media);
  console.log('featuredImage', featuredImage);
  return (
    <div className='grid justify-items-center h-fit p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <Link href='/blog'>Back</Link>
      <article className='prose'>
        <Image
          width={800}
          height={400}
          src={featuredImage.source_url}
          alt={featuredImage.alt_text}
          loading='lazy'
          style={{ objectFit: 'contain' }}
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
        <h1 dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h1>
        <div className='blog-post'>
          <div
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          ></div>
        </div>
      </article>
    </div>
  );
}

export default page;
