import { Spinner } from './ui/spinner';

interface LoadingSpinnerProps {
  message: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center space-x-2">
      <Spinner className="h-8 w-8 animate-spin" />
      <span className="text-lg font-medium">{message}</span>
    </div>
  );
}
