/**
 * Returns appropriate CSS classes for RTL/LTR text alignment and spacing
 * @param isRtl Whether the current layout is RTL
 * @returns Object with CSS classes for text alignment, margins, etc.
 */
export function getRtlClass(isRtl: boolean) {
  return {
    textAlign: isRtl ? 'text-right' : 'text-left',
    margin: isRtl ? 'ml-2' : 'mr-2',
    iconMargin: isRtl ? 'ml-2' : 'mr-2',
    direction: isRtl ? 'rtl' : 'ltr',
    flex: isRtl ? 'flex-row-reverse' : 'flex-row',
    space: 'space-x-2 rtl:space-x-reverse',
  };
} 