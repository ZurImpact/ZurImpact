import {useNavigate} from 'react-router';
import {Users, TrendingUp, Handshake, Award, FileText, ArrowRight} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Card} from '../ui/card';
import {ImageWithFallback} from '../ui/ImageWithFallback';

export function PartnersPage() {
  const navigate = useNavigate();
  const {t} = useTranslation();

  const benefits = [
    {
      icon: Users,
      title: t('partnerPage.benefit1Title'),
      description: t('partnerPage.benefit1Desc'),
    },
    {
      icon: TrendingUp,
      title: t('partnerPage.benefit2Title'),
      description: t('partnerPage.benefit2Desc'),
    },
    {
      icon: Award,
      title: t('partnerPage.benefit3Title'),
      description: t('partnerPage.benefit3Desc'),
    },
    {
      icon: Handshake,
      title: t('partnerPage.benefit4Title'),
      description: t('partnerPage.benefit4Desc'),
    },
  ];

  const partnerTypes = [
    {
      title: t('partnerPage.partnerType1Title'),
      description: t('partnerPage.partnerType1Desc'),
      examples: t('partnerPage.partnerType1Examples'),
    },
    {
      title: t('partnerPage.partnerType2Title'),
      description: t('partnerPage.partnerType2Desc'),
      examples: t('partnerPage.partnerType2Examples'),
    },
    {
      title: t('partnerPage.partnerType3Title'),
      description: t('partnerPage.partnerType3Desc'),
      examples: t('partnerPage.partnerType3Examples'),
    },
    {
      title: t('partnerPage.partnerType4Title'),
      description: t('partnerPage.partnerType4Desc'),
      examples: t('partnerPage.partnerType4Examples'),
    },
  ];

  const howItWorksSteps = [
    {n: 1, title: t('partnerPage.step1Title'), body: t('partnerPage.step1Body')},
    {n: 2, title: t('partnerPage.step2Title'), body: t('partnerPage.step2Body')},
    {n: 3, title: t('partnerPage.step3Title'), body: t('partnerPage.step3Body')},
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt={t('partnerPage.heroImageAlt')}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl mb-6">{t('partnerPage.heroTitle')}</h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto">{t('partnerPage.heroSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-primary-foreground px-8 py-6 rounded-lg transition-colors"
            >
              {t('partnerPage.heroCta')}
              <ArrowRight className="size-5" />
            </button>
            <a
              href="/Zurimpact_PitchDeck.pdf"
              download
              className="inline-flex items-center justify-center gap-2 bg-green-600/20 backdrop-blur-sm hover:bg-green-600/30 text-green-500 px-8 py-6 rounded-lg border border-green-600 transition-colors"
            >
              <FileText className="size-5" />
              {t('partnerPage.downloadPitchDeck')}
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-foreground mb-4">{t('partnerPage.benefitsTitle')}</h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">{t('partnerPage.benefitsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="relative p-8 bg-card rounded-xl border-border hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10 transition-all"
              >
                <div className="bg-brand-container size-14 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="size-7 text-brand" />
                </div>
                <h3 className="text-xl mb-3 text-brand">{benefit.title}</h3>
                <p className="text-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Partner Section */}
      <section className="py-20 bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-brand-foreground mb-4">{t('partnerPage.whoCanPartnerTitle')}</h2>
            <p className="text-lg text-brand-foreground/80 max-w-2xl mx-auto">
              {t('partnerPage.whoCanPartnerSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="flex flex-col gap-6">
              {partnerTypes.map((type, index) => (
                <div key={index} className="flex gap-5 items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-brand-foreground mb-3">{type.title}</h3>
                    <p className="text-brand-foreground/80 text-base mb-1">{type.description}</p>
                    <p className="text-sm text-brand-foreground/70 italic">
                      {t('partnerPage.examples')} {type.examples}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden h-[550px]">
              <img
                src="https://images.unsplash.com/photo-1520156557489-31c63271fcd4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt={t('partnerPage.whoCanPartnerImgAlt')}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-foreground mb-4">{t('partnerPage.howItWorksTitle')}</h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">{t('partnerPage.howItWorksSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-18 items-stretch">
            <div className="rounded-2xl overflow-hidden self-stretch">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop"
                alt={t('partnerPage.howItWorksImgAlt')}
                className="w-full min-h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-9">
              {howItWorksSteps.map(({n, title, body}) => (
                <div key={n} className="flex gap-6 items-start">
                  <div className="bg-brand text-brand-foreground size-8 rounded-full flex items-center justify-center shrink-0 mt-1 text-sm font-bold">
                    {n}
                  </div>
                  <div>
                    <h3 className="text-xl text-brand mb-3">{title}</h3>
                    <p className="text-foreground mb-3">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand text-brand-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-6 text-brand-foreground">{t('partnerPage.ctaTitle')}</h2>
          <p className="text-lg text-brand-foreground/80 mb-8">{t('partnerPage.ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 bg-white dark:bg-card text-brand hover:bg-gray-100 dark:hover:bg-card/80 px-8 py-3 rounded-lg transition-colors"
            >
              {t('partnerPage.ctaButton')}
              <ArrowRight className="size-5" />
            </button>
            <button
              onClick={() => navigate('/about')}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-brand-foreground px-8 py-3 rounded-lg border border-white/30 transition-colors"
            >
              {t('partnerPage.ctaSecondary')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
