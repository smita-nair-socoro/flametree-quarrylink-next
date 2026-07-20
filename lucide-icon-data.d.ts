// Lucide ships raw icon data (__iconNode) in its per-icon modules without types.
declare module 'lucide-react/dist/esm/icons/*' {
  import type { IconNode } from 'lucide-react';
  export const __iconNode: IconNode;
}
