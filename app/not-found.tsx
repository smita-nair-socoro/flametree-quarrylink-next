import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex justify-center items-center min-h-screen px-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <h1 className="text-6xl font-bold text-[#0F172A]">404</h1>
        <p className="text-lg font-medium text-[#0F172A]">Page not found</p>
        <p className="text-sm text-[#64748B] max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Button asChild className="mt-2">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
