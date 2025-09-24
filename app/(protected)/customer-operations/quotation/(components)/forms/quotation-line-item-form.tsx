'use client';

import React from 'react';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function QuotationLineItemForm({
  id,
  onCancel,
  className,
}: FormProps) {
  console.log(id);
  console.log(onCancel);
  console.log(className);
  return <div>Quotation Line Item Form</div>;
}
