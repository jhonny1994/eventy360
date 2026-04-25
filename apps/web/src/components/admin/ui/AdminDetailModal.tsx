'use client';

import { ReactNode } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button 
} from 'flowbite-react';
import { useLocale } from 'next-intl';
import { HiX } from 'react-icons/hi';

interface AdminDetailModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  footer?: ReactNode;
  closeOnClickOutside?: boolean;
}

export default function AdminDetailModal({
  show,
  onClose,
  title,
  children,
  size = 'xl',
  footer,
  closeOnClickOutside = true
}: AdminDetailModalProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <Modal
      show={show}
      onClose={onClose}
      size={size}
      position="center"
      dismissible={closeOnClickOutside}
    >
      <ModalHeader className={`flex items-center justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
        <span>{title}</span>
        <Button
          color="gray"
          pill
          className="ml-auto h-8 w-8 p-0"
          onClick={onClose}
        >
          <HiX className="h-5 w-5" />
        </Button>
      </ModalHeader>
      
      <ModalBody className={isRtl ? 'rtl text-right' : 'ltr text-left'}>
        {children}
      </ModalBody>
      
      {footer && (
        <ModalFooter className="flex justify-end border-t pt-4">
          {footer}
        </ModalFooter>
      )}
    </Modal>
  );
} 