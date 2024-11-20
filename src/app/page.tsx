import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center h-dvh p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-8 row-start-2 items-center sm:items-start'>
        <div className='hero'>
          <h1>Next.js + Headless WordPress</h1>
          <p>
            This combination empowers seamless integration between Next.js and
            WordPress, providing dynamic and efficient web experiences.
          </p>

          <Link href='/blog' className={buttonVariants({ variant: 'default' })}>
            Read Blog Posts
          </Link>
        </div>
      </main>
    </div>
  );
}
