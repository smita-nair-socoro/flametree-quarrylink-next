import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Hook to detect when a toolbar needs to switch to compact mode
 * based on available space, preventing wrapping before it happens.
 *
 * Usage:
 * ```tsx
 * const { containerRef, controlRef, isCompact } = useToolbarCompact({
 *   hasControls: true,
 *   itemCount: filters.length,
 * });
 *
 * <div ref={containerRef}>
 *   {isCompact ? <MobileView /> : <DesktopView />}
 *   <button ref={controlRef}>Control</button>
 * </div>
 * ```
 */
export function useToolbarCompact(options?: {
  hasControls?: boolean;
  itemCount?: number;
  minGap?: number;
  estimatedItemWidth?: number;
}) {
  const {
    hasControls = true,
    itemCount = 0,
    minGap = 16,
    estimatedItemWidth = 150,
  } = options || {};

  const [isCompact, setIsCompact] = useState(true); // Start with compact to avoid flicker
  const containerRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const toolbarContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const checkCompact = () => {
      // Check screen width first
      const screenWidth = window.innerWidth;
      const MOBILE_BREAKPOINT = 768; // Match md breakpoint

      if (screenWidth < MOBILE_BREAKPOINT) {
        setIsCompact(true);
        return;
      }

      if (itemCount === 0) {
        setIsCompact(false);
        return;
      }

      // If there's no control button, always show desktop mode
      if (!hasControls) {
        setIsCompact(false);
        return;
      }

      const toolbarContainer = toolbarContainerRef.current;
      const control = controlRef.current;

      if (!toolbarContainer || !control) {
        setIsCompact(true);
        return;
      }

      // Calculate available space
      const toolbarRect = toolbarContainer.getBoundingClientRect();
      const controlRect = control.getBoundingClientRect();

      // Get search input width (it's the first child with flex-shrink-0)
      const searchInput = toolbarContainer.querySelector('.flex-shrink-0');
      const searchWidth = searchInput ? searchInput.getBoundingClientRect().width : 350;

      // Calculate space needed:
      // - Search input width
      // - Control button width
      // - Gaps between elements (8px per gap, 2 gaps minimum for search + control)
      // - Estimated width for all filter items
      const controlWidth = controlRect.width;
      const gapCount = 2 + itemCount; // gaps: search-filters, between filters, filters-control
      const totalGaps = gapCount * 8; // 8px gap between items

      // Estimate total width needed for filters
      let estimatedFiltersWidth = 0;
      const container = containerRef.current;
      if (container) {
        const buttons = container.querySelectorAll('button');
        if (buttons.length > 0) {
          // Measure actual button widths
          buttons.forEach(button => {
            estimatedFiltersWidth += button.getBoundingClientRect().width;
          });
        } else {
          // Fallback to estimation if buttons not rendered
          estimatedFiltersWidth = itemCount * estimatedItemWidth;
        }
      } else {
        estimatedFiltersWidth = itemCount * estimatedItemWidth;
      }

      const neededWidth = searchWidth + estimatedFiltersWidth + controlWidth + totalGaps + minGap;
      const availableWidth = toolbarRect.width;

      // Switch to compact if there's not enough space
      setIsCompact(neededWidth > availableWidth);
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      checkCompact();
    });

    // Add resize listener
    const handleResize = () => {
      requestAnimationFrame(checkCompact);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [itemCount, hasControls, minGap, estimatedItemWidth]);

  // Check if we should hide the control button even in compact mode
  const [shouldHideControl, setShouldHideControl] = useState(false);

  useLayoutEffect(() => {
    if (!isCompact) {
      setShouldHideControl(false);
      return;
    }

    const checkControlVisibility = () => {
      const toolbarContainer = toolbarContainerRef.current;
      const control = controlRef.current;

      if (!toolbarContainer || !control || !hasControls) {
        setShouldHideControl(false);
        return;
      }

      const toolbarRect = toolbarContainer.getBoundingClientRect();
      const controlRect = control.getBoundingClientRect();

      // Get search input and compact filter button widths
      const searchInput = toolbarContainer.querySelector('.flex-shrink-0');
      const filterButton = toolbarContainer.querySelector('[data-filter-button]');

      const searchWidth = searchInput ? searchInput.getBoundingClientRect().width : 350;
      const filterButtonWidth = filterButton ? filterButton.getBoundingClientRect().width : 100;
      const controlWidth = controlRect.width;

      // Calculate needed width: search + filter button + control + gaps
      const gaps = 3 * 8; // 3 gaps of 8px
      const neededWidth = searchWidth + filterButtonWidth + controlWidth + gaps + minGap;
      const availableWidth = toolbarRect.width;

      setShouldHideControl(neededWidth > availableWidth);
    };

    const rafId = requestAnimationFrame(() => {
      checkControlVisibility();
    });

    const handleResize = () => {
      requestAnimationFrame(checkControlVisibility);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isCompact, hasControls, minGap]);

  return {
    containerRef,
    controlRef,
    toolbarContainerRef,
    isCompact,
    shouldHideControl,
  };
}
