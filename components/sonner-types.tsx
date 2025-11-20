'use client';

import { Button } from '@/components/ui/button';
import {
  notify,
  notifySuccess,
  notifyInfo,
  notifyWarning,
  notifyError,
  notifyPromise,
} from '@/lib/toast';

export function SonnerTypes() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => notify('Event has been created')}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() => notifySuccess('Event has been created')}
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          notifyInfo('Be at the area 10 minutes before the event time')
        }
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          notifyWarning('Event start time cannot be earlier than 8am')
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() => notifyError('Event has not been created')}
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          notifyPromise<{ name: string }>(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ name: 'Event' }), 2000)
              ),
            {
              loading: 'Loading...',
              success: (data) => `${data.name} has been created`,
              error: () => 'Error',
            }
          );
        }}
      >
        Promise
      </Button>
    </div>
  );
}
