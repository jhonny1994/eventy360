"use client";

import { createTheme, ThemeProvider } from "flowbite-react";
import { useParams } from "next/navigation";

// Create RTL-aware theme customizations for Flowbite components
const rtlTheme = createTheme({
  card: {
    root: {
      base: "flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 flex-col",
      children: "flex h-full flex-col justify-center gap-4 p-6",
      horizontal: {
        off: "",
        on: "flex-col md:max-w-xl md:flex-row"
      }
    }
  },
  button: {
    base: "group flex items-center justify-center text-center font-medium relative focus:z-10 focus:outline-none",
  },
  modal: {
    root: {
      base: "fixed top-0 end-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
    },
    header: {
      base: "flex items-start justify-between rounded-t dark:border-gray-600 border-b"
    }
  },
  dropdown: {
    floating: {
      base: "z-10 w-fit rounded divide-y divide-gray-100 shadow",
      content: "py-1 text-sm text-gray-700 dark:text-gray-200",
      target: "w-fit dark:text-white"
    },
    content: "py-1 focus:outline-none"
  },
  navbar: {
    root: {
      base: "border-gray-200 bg-white px-2 py-2.5 dark:border-gray-700 dark:bg-gray-800 sm:px-4"
    }
  },
  sidebar: {
    root: {
      base: "h-full"
    },
    item: {
      base: "flex items-center justify-start rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
    }
  },
  avatar: {
    root: {
      base: "flex justify-center",
      bordered: "p-1 ring-2",
      rounded: "rounded-full",
      color: {
        dark: "ring-gray-800 dark:ring-gray-800",
        light: "ring-gray-300 dark:ring-gray-500"
      }
    }
  }
});

export interface FlowbiteProviderProps {
  children: React.ReactNode;
}

export default function FlowbiteProvider({ children }: FlowbiteProviderProps) {
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'ar';
  const isRtl = locale === 'ar';

  return (
    <ThemeProvider theme={isRtl ? rtlTheme : undefined}>
      {children}
    </ThemeProvider>
  );
} 