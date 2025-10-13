'use client';
import { useEffect } from 'react';
import { APP_VERSION } from '@/lib/utils/version';

export default function VersionLogger() {
  useEffect(() => {
    console.log(`🔖 App version: ${APP_VERSION}`);
  }, []);
  return null;
}
