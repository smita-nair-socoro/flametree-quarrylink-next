'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';
import { MobileScrollableTabs } from '@/components/mobile/mobile-scrollable-tabs';

function Tabs({ ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'flex h-9 items-center justify-between bg-muted p-1 text-muted-foreground w-full',
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  );
}

// Wrapper component with your desired props
interface TabItem {
  name: string;
  value?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

interface CustomTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  tabsClassName?: string;
  tabsTriggerClassName?: string;
  variant?: 'default' | 'underline';
  /** When true, shows a dropdown for tab selection on viewports below md breakpoint instead of horizontal tabs */
  enableDropdownOnMobile?: boolean;
}

function Tab({
  tabs,
  defaultTab,
  value: controlledValue,
  onValueChange,
  className,
  tabsClassName,
  tabsTriggerClassName,
  variant = 'default',
  enableDropdownOnMobile = false,
}: CustomTabsProps) {
  const defaultValue = defaultTab || tabs[0]?.value || tabs[0]?.name || '';
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = controlledValue ?? internalValue;
  const handleValueChange = React.useCallback(
    (v: string) => {
      setInternalValue(v);
      onValueChange?.(v);
    },
    [onValueChange]
  );

  const listStyles =
    variant === 'underline'
      ? 'flex h-auto items-center justify-start gap-0 bg-transparent p-0 border-b  w-fit'
      : 'flex h-9 items-center justify-between bg-muted p-1 text-muted-foreground w-full';

  const triggerStyles =
    variant === 'underline'
      ? 'inline-flex justify-start whitespace-nowrap text-left border-b-2 border-transparent pr-15 py-3 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-purple-50 data-[state=active]:shadow-none'
      : 'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow';

  return (
    <Tabs value={currentValue} onValueChange={handleValueChange} className={className}>
      {enableDropdownOnMobile ? (
        <>
          <div className="w-full max-[910px]:block min-[911px]:hidden">
            <MobileScrollableTabs
              tabs={tabs.map((t) => ({ value: t.value || t.name, label: t.name, icon: t.icon }))}
              value={currentValue}
              onValueChange={handleValueChange}
            />
          </div>
          <TabsList
            className={cn(listStyles, tabsClassName, 'hidden min-[911px]:flex')}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.name}
                value={tab.value || tab.name}
                className={cn(
                  variant === 'default' && 'w-full',
                  triggerStyles,
                  tabsTriggerClassName
                )}
              >
                {variant === 'underline' ? (
                  <>
                    {tab.icon}
                    <span>{tab.name}</span>
                    {tab.rightElement}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.name}</span>
                    {tab.rightElement}
                  </div>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </>
      ) : (
        <TabsList className={cn(listStyles, tabsClassName)}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.name}
              value={tab.value || tab.name}
              className={cn(
                variant === 'default' && 'w-full',
                triggerStyles,
                tabsTriggerClassName
              )}
            >
              {variant === 'underline' ? (
                <>
                  {tab.icon}
                  <span>{tab.name}</span>
                  {tab.rightElement}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <span>{tab.name}</span>
                  {tab.rightElement}
                </div>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      )}

      {tabs.map((tab) => (
        <TabsContent key={tab.name} value={tab.value || tab.name}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export { Tab };
