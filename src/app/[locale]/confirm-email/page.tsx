'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button, Alert, Spinner } from 'flowbite-react';
import { HiOutlineMail, HiOutlineLogout, HiOutlineRefresh, HiInformationCircle, HiCheckCircle } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export default function ConfirmEmailPage() {
  const t = useTranslations('Auth.ConfirmEmailPage');
  const tCommon = useTranslations('Auth.LoginPage');
  const locale = useLocale();
  const { supabase, session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userEmail = session?.user?.email || null;
  const emailConfirmed = !!session?.user?.email_confirmed_at;

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace(`/${locale}/redirect`);
    }
  }, [session, authLoading, router, locale]);

  const handleResendConfirmation = async () => {
    if (!userEmail) {
      setError(t('sessionError'));
      toast.error(t('sessionError'));
      return;
    }
    setIsResending(true);
    setError(null);
    const toastId = toast.loading(t('resendingButton'));

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: userEmail,
    });

    if (resendError) {
      setError(resendError.message);
      toast.error(`${t('resendErrorToast')}: ${resendError.message}`, { id: toastId });
    } else {
      toast.success(t('resendSuccessToast'), { id: toastId });
    }
    setIsResending(false);
  };

  const handleLogout = async () => {
    const toastId = toast.loading('Logging out...');
    await supabase.auth.signOut();
    toast.success('Logged out successfully.', { id: toastId });
    router.push(`/${locale}/login`);
  };

  const handleContinueToCompleteProfile = () => {
    router.push(`/${locale}/complete-profile`);
  };

  if (authLoading || (!session && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Spinner size="xl" aria-label="Loading page content..." />
      </div>
    );
  }

  if (!session && !authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-6">
        <Alert color="failure">Redirecting to login...</Alert>
      </div>
    );
  }

  const renderNoticeContent = () => {
    if (emailConfirmed) {
      return (
        <div className="flex flex-col items-center text-center">
          <HiCheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="mb-4 text-2xl font-bold leading-9 tracking-tight text-foreground">
            {t('emailSuccessfullyConfirmedTitle')}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {t('emailSuccessfullyConfirmedMessage')}
          </p>
          <Button
            onClick={handleContinueToCompleteProfile}
            color="gray"
            className="w-full mb-3"
          >
            {t('continueButton')}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center text-center">
        <HiOutlineMail className="w-16 h-16 text-primary mb-4" />
        <h1 className="mb-4 text-2xl font-bold leading-9 tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="mb-2 text-sm text-muted-foreground">
          {t('infoTextLine1')}
        </p>
        <p className="mb-3 text-sm font-semibold text-foreground">
          {userEmail || t('emailAddress')}
        </p>
        <p className="mb-2 text-sm text-muted-foreground">
          {t('infoTextLine2')}
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          {t('infoTextLine3')}
        </p>

        {error && (
          <Alert color="failure" icon={HiInformationCircle} className="mb-4 w-full text-start">
            {error}
          </Alert>
        )}

        <Button
          onClick={handleResendConfirmation}
          disabled={isResending || !userEmail}
          color="primary"
          className="w-full mb-3"
          aria-live="polite"
        >
          {isResending ? (
            <>
              <Spinner size="sm" />
              <span className="ps-3">{t('resendingButton')}</span>
            </>
          ) : (
            <><HiOutlineRefresh className="me-2 h-5 w-5" /> {t('resendButton')}</>
          )}
        </Button>

        <Button
          onClick={handleLogout}
          color="gray"
          className="w-full"
        >
          <HiOutlineLogout className="me-2 h-5 w-5" />
          {t('logoutButton')}
        </Button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-stretch bg-background text-foreground">
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md bg-card dark:bg-card-dark shadow-2xl rounded-xl p-6 sm:p-8">
          <div className="mb-8 text-center">
            <Link href="/">
              <Image
                src="/png/logo.png"
                alt={tCommon('logoAltText')}
                width={180}
                height={60}
                priority
                className="mx-auto"
              />
            </Link>
          </div>

          {userEmail ? renderNoticeContent() : (
            <div className="flex flex-col items-center text-center">
              <Spinner size="lg" aria-label="Loading user information..." />
              <p className="mt-4 text-muted-foreground">{t('sessionError')}</p>
            </div>
          )}

        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-primary-50 dark:bg-primary-950/30 p-12">
        <div className="w-full max-w-md text-center">
          <Image
            src="/illustrations/email-sent.svg"
            alt={t('illustrationAlt') || "Email confirmation illustration"}
            width={450}
            height={450}
            priority
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
} 