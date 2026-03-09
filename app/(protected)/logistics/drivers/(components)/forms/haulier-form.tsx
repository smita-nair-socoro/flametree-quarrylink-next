'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/ui/phone-input';
import type { SelectCreateEditItem } from '@/components/ui/select-create-edit';

interface HaulierFormProps {
  editingItem?: SelectCreateEditItem | null;
  isEditing: boolean;
  onSave: (item: SelectCreateEditItem) => void;
  onCancel: () => void;
}

export default function HaulierForm({
  editingItem,
  isEditing,
  onSave,
  onCancel,
}: HaulierFormProps) {

  const [name, setName] = React.useState(editingItem?.label ?? '');
  const [email, setEmail] = React.useState(editingItem?.fields?.email ?? '');
  const [phone, setPhone] = React.useState(editingItem?.fields?.phone ?? '');

  React.useEffect(() => {
    setName(editingItem?.label ?? '');
    setEmail(editingItem?.fields?.email ?? '');
    setPhone(editingItem?.fields?.phone ?? '');
  }, [editingItem]);

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      id: editingItem?.id ?? String(Date.now()),
      label: name.trim(),
      fields: { email: email.trim(), phone },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Separator />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Haulier Name*</label>
        <Input
          placeholder="Enter Haulier Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Haulier Email*</label>
        <Input
          placeholder="Enter email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Haulier Phone*</label>
        <PhoneInput
          defaultCountry="AU"
          placeholder="Enter phone number"
          value={phone}
          onChange={setPhone}
        />
      </div>

      <div className="flex justify-center gap-3 pt-2 pb-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
        >
          {isEditing ? 'Update Haulier' : 'Add Haulier'}
        </Button>
      </div>
    </div>
  );
}
