import {
  // ArrowRight,
  Trash2,
  Leaf,
  TrendingUp,
  Gift,
} from 'lucide-react';
import {ImageWithFallback} from '../ui/ImageWithFallback';
import {Card} from '../ui/card';
import {Badge} from '../ui/badge';
import {useTranslation} from 'react-i18next';
// import {useNavigate} from 'react-router';

export function HomePage() {
  // const navigate = useNavigate();
  const {t} = useTranslation();

  const steps = [
    {
      icon: Trash2,
      title: t('homePage.step1Title'),
      description: t('homePage.step1Desc'),
    },
    {
      icon: TrendingUp,
      title: t('homePage.step2Title'),
      description: t('homePage.step2Desc'),
    },
    {
      icon: Gift,
      title: t('homePage.step3Title'),
      description: t('homePage.step3Desc'),
    },
  ];

  const stats = [
    {value: '200+', label: t('homePage.statsParticipants')},
    {value: '1,000kg', label: t('homePage.statsWasteCollected')},
    {value: '10+', label: t('homePage.statsPartnerVenues')},
    {value: '4,000+', label: t('homePage.statsRewardsRedeemed')},
  ];

  const featuredActivities = [
    {
      image:
        'https://images.unsplash.com/photo-1758599669327-83d310882929?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBjb2xsZWN0aW5nJTIwbGl0dGVyJTIwZ2FyYmFnZXxlbnwxfHx8fDE3NzI2MTg2MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Collecting litter',
      points: t('homePage.featured1Points'),
      title: t('homePage.featured1Title'),
      desc: t('homePage.featured1Desc'),
    },
    {
      image:
        'https://images.unsplash.com/photo-1501147830916-ce44a6359892?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Cycling in Zürich',
      points: t('homePage.featured2Points'),
      title: t('homePage.featured2Title'),
      desc: t('homePage.featured2Desc'),
    },
    {
      image:
        'https://images.unsplash.com/photo-1549992609-7a9043b5bf6b?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Public transport',
      points: t('homePage.featured3Points'),
      title: t('homePage.featured3Title'),
      desc: t('homePage.featured3Desc'),
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1620563092215-0fbc6b55cfc5?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Zurich cityscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-brand/90 px-4 py-2 rounded-full mb-6">
            <Leaf className="size-4 text-primary-foreground" />
            <span className="text-sm text-primary-foreground">{t('homePage.hero.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-6xl mb-6">
            {t('homePage.hero.titleLine1')}
            <br />
            {t('homePage.hero.titleLine2')}
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto">{t('homePage.hero.subtitle')}</p>
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-primary-foreground px-8 py-3 rounded-lg transition-colors"
            >
              Start Earning Rewards
              <ArrowRight className="size-5" />
            </button> */}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl text-brand-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-brand-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-foreground mb-4">{t('homePage.howItWorksTitle')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('homePage.howItWorksSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="relative p-8 border hover:border-brand hover:shadow-lg transition-all">
                <div className="absolute -top-4 left-8 bg-brand text-brand-foreground size-8 rounded-full flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <div className="bg-brand-container size-14 rounded-lg flex items-center justify-center mb-4">
                  <step.icon className="size-7 text-brand" />
                </div>
                <h3 className="text-xl mb-3 text-brand">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Activities Preview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-foreground mb-4">{t('homePage.featuredTitle')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('homePage.featuredSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {featuredActivities.map((activity, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition-shadow dark:hover:shadow-xl dark:hover:shadow-brand/30 p-0"
              >
                <ImageWithFallback src={activity.image} alt={activity.alt} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <Badge variant="secondary" className="mb-3">
                    {activity.points}
                  </Badge>
                  <h3 className="text-xl mb-2 text-brand">{activity.title}</h3>
                  <p className="text-muted-foreground text-sm">{activity.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand text-brand-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-6 text-brand-foreground">{t('homePage.ctaTitle')}</h2>
          <p className="text-lg text-brand-foreground/80 mb-8">{t('homePage.ctaSubtitle')}</p>
          {/* <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 bg-white dark:bg-card text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg transition-colors"
          >
            Get Started Now
            <ArrowRight className="size-5" />
          </button> */}
        </div>
      </section>
    </div>
  );
}
