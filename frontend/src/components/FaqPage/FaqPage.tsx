import {useTranslation} from 'react-i18next';
import {ChevronDown} from 'lucide-react';

export function FaqPage() {
  const {t} = useTranslation();

  const faqs = [
    {
      question: 'howItWorksTitle',
      answer: 'howItWorksAnswer',
    },
    {
      question: 'whatArePointsTitle',
      answer: 'whatArePointsAnswer',
    },
    {
      question: 'howToEarnPointsTitle',
      answer: 'howToEarnPointsAnswer',
    },
    {
      question: 'howToRedeemRewardsTitle',
      answer: 'howToRedeemRewardsAnswer',
    },
    {
      question: 'isAppFreeTitle',
      answer: 'isAppFreeAnswer',
    },
    {
      question: 'howIsImpactMeasuredTitle',
      answer: 'howIsImpactMeasuredAnswer',
    },
  ];

  return (
    <div className="bg-background">
      <div className="py-12">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">{t('faq.header')}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">{t('faq.subheader')}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-lg border bg-card p-4 transition-colors hover:border-brand open:border-brand"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-brand">
                {t(`faq.${faq.question}`)}
                <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 text-muted-foreground">
                <p>{t(`faq.${faq.answer}`)}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
