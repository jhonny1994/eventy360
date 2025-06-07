'use client';

import { useTranslations } from 'next-intl';
import { 
  Modal, 
  Button, 
  Card, 
  List, 
  Badge, 
  ListItem, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
} from 'flowbite-react';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import type { AppSettings } from '@/lib/appConfig';

interface PricingModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  appSettings: AppSettings | null;
  userType: 'researcher' | 'organizer' | null;
  onPlanSelect: (tier: 'researcher' | 'organizer', period: 'monthly' | 'quarterly' | 'biannual' | 'annual', amount: number) => void;
}

const FeatureListItem: React.FC<{ text: string; included: boolean }> = ({ text, included }) => (
  <ListItem icon={included ? HiCheckCircle : HiXCircle} className={`flex items-center ${included ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
    {text}
  </ListItem>
);

const PriceCard: React.FC<{
  periodKey: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  calculatedPrice: number;
  discount?: number;
  t: ReturnType<typeof useTranslations>;
  onSelect: () => void;
}> = ({ periodKey, calculatedPrice, discount, t, onSelect }) => {
  const periodLabel = t(`BillingPeriods.${periodKey}`);
  const perMonthEquivalent = periodKey === 'monthly' ? null : Math.round(calculatedPrice / (periodKey === 'quarterly' ? 3 : periodKey === 'biannual' ? 6 : 12));

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <div className="p-4 flex flex-col items-center text-center flex-grow min-h-[160px]">
        <h4 className="text-xl font-semibold mb-2">{periodLabel}</h4>
        <div className="flex flex-col justify-center flex-grow">
            {discount && 
                <Badge color="success" className="mb-2 py-1 px-2 self-center"> 
                    {t('discountApplied', { discount: Math.round(discount * 100) })}
                </Badge>
            }
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 my-1">
              {calculatedPrice} {t('currencySymbol')}
            </p>
            {perMonthEquivalent && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                ({t('equivalentTo')} {perMonthEquivalent} {t('currencySymbol')} / {t('monthLabel')})
              </p>
            )}
        </div>
      </div>
      <div className="p-4 mt-auto">
        <Button onClick={onSelect} color="gray" className="w-full">
          {t('selectThisPlan')}
        </Button>
      </div>
    </Card>
  );
};

export default function PricingModal({ isOpen, setIsOpen, appSettings, userType, onPlanSelect }: PricingModalProps) {
  const t = useTranslations('PricingModal');
  const tCommon = useTranslations('Common');

  if (!appSettings || !appSettings.calculated_prices) {
    return (
      <Modal show={isOpen} onClose={() => setIsOpen(false)} size="md">
        <ModalHeader>{t('loadingTitle')}</ModalHeader>
        <ModalBody><p>{t('loadingText')}</p></ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsOpen(false)} color="gray">{tCommon('closeButton')}</Button>
        </ModalFooter>
      </Modal>
    );
  }

  const { researcher: researcherPrices, organizer: organizerPrices } = appSettings.calculated_prices;

  const researcherFeatures = [
    { text: t('Features.Researcher.submitPapers'), included: true },
    { text: t('Features.Researcher.trackSubmissions'), included: true },
    { text: t('Features.Researcher.topicSubscriptions'), included: true },
    { text: t('Features.Researcher.bookmarkEvents'), included: true },
  ];

  const organizerFeatures = [
    { text: t('Features.Organizer.createManageEvents'), included: true },
    { text: t('Features.Organizer.reviewSubmissions'), included: true },
    { text: t('Features.Organizer.accessContactInfo'), included: true },
    { text: t('Features.Organizer.eventNotifications'), included: true },
  ];

  const handlePlanSelection = (tier: 'researcher' | 'organizer', period: 'monthly' | 'quarterly' | 'biannual' | 'annual') => {
    const price = tier === 'researcher' ? researcherPrices[period] : organizerPrices[period];
    onPlanSelect(tier, period, price);
  };

  const renderPlanOptions = (tier: 'researcher' | 'organizer') => {
    const prices = tier === 'researcher' ? researcherPrices : organizerPrices;
    const features = tier === 'researcher' ? researcherFeatures : organizerFeatures;
    
    return (
      <div className="mb-6">
        <div className="text-center mb-6">
            <h3 className="text-2xl lg:text-3xl font-semibold mb-1">
                {tier === 'researcher' ? t('researcherTierTitle') : t('organizerTierTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              {t('startsWith')} {tier === 'researcher' ? prices.monthly : prices.monthly} {t('currencySymbol')} / {t('monthLabel')}
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400 mb-4">
              {t('trialInfo', { tierName: tier === 'researcher' ? t('researcherTierTitle') : t('organizerTierTitle') })}
            </p>
        </div>
        <div className="mb-6 px-4">
            <h4 className="text-lg font-medium mb-2">{t('featuresLabel', { tierName: tier === 'researcher' ? t('researcherTierTitle') : t('organizerTierTitle')})}</h4>
            <List unstyled className="space-y-1 text-sm">
                {features.map(f => <FeatureListItem key={f.text} text={f.text} included={f.included} />)}
            </List>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          {(['monthly', 'quarterly', 'biannual', 'annual'] as const).map(period => (
            <PriceCard
              key={period}
              periodKey={period}
              calculatedPrice={prices[period]}
              discount={
                period === 'quarterly' ? appSettings.discount_quarterly ?? undefined :
                period === 'biannual' ? appSettings.discount_biannual ?? undefined :
                period === 'annual' ? appSettings.discount_annual ?? undefined :
                undefined
              }
              t={t}
              onSelect={() => handlePlanSelection(tier, period)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Modal show={isOpen} onClose={() => setIsOpen(false)} size="7xl">
      <ModalHeader>{t('modalTitle')}</ModalHeader>
      <ModalBody className="p-2 sm:p-4 md:p-6">
        <div> 
          {userType === 'researcher' && renderPlanOptions('researcher')}
          {userType === 'organizer' && renderPlanOptions('organizer')}
          {!userType && (
            <div className='text-center p-8'>
              <p>{t('noPlanForUserType')}</p>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter className="justify-center border-t pt-4">
        <Button onClick={() => setIsOpen(false)} color="gray" className="px-6 py-2">
            {t('maybeLater')}
        </Button>
      </ModalFooter>
    </Modal>
  );
} 