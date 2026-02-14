'use client';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
}

export default function JobForm({}: FormProps) {
  return <div>JobForm</div>;
}
