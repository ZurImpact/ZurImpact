import {useNavigate} from 'react-router';
import {Target, ArrowRight, FileText} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Card} from '../ui/card';
import {ImageWithFallback} from '../ui/ImageWithFallback';

import umutPic from '../../resources/CoFounder_Umut.jpeg';
import colinPic from '../../resources/CoFounder_Colin.jpeg';
import denisPic from '../../resources/CoFounder_Denis.jpeg';

export function AboutPage() {
  const navigate = useNavigate();
  const {t} = useTranslation();

  const team = [
    {
      name: 'Umut Öztürk',
      role: 'Co-Founder',
      image: umutPic,
    },
    {
      name: 'Colin Debuis',
      role: 'Co-Founder',
      image: colinPic,
    },
    {
      name: 'Denis Djaferi',
      role: 'Co-Founder',
      image: denisPic,
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[250px] md:h-[250px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1597150899069-efb9c8c6010c?q=80&w=1638&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="cafe"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl mb-6">{t('aboutPage.heroTitle')}</h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">{t('aboutPage.heroSubtitle')}</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="grid md:grid-cols-2 gap-12 items-center"> */}
          <div className="items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-container text-on-brand-container px-4 py-2 rounded-full mb-6 border border-brand/30">
                <Target className="size-4" />
                <span className="text-sm font-medium">{t('aboutPage.missionBadge')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl mb-6 text-foreground">{t('aboutPage.missionTitle')}</h2>
              <p className="text-lg text-muted-foreground mb-4">{t('aboutPage.missionDescription1')}</p>
              <p className="text-lg text-muted-foreground mb-8">{t('aboutPage.missionDescription2')}</p>
              <a
                href="/Zurimpact_PitchDeck.pdf"
                download
                className="inline-flex items-center justify-center gap-2 bg-brand/10 backdrop-blur-sm text-brand px-8 py-3 rounded-lg border border-brand transition-colors"
              >
                <FileText className="size-5" />
                Download Pitch Deck
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-16 md:py-0 md:h-[600px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1583321500900-82807e458f3c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl mb-5 text-white">{t('aboutPage.teamTitle')}</h2>
          <p className="text-lg text-white mb-9 max-w-2xl mx-auto">{t('aboutPage.teamSubtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-xs mx-auto md:max-w-none">
            {team.map((member, index) => (
              <Card
                key={index}
                className="p-7 text-center bg-card border-border hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10 transition-shadow"
              >
                <div className="relative w-40 h-40 md:w-50 md:h-50 mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={`Photo of ${member.name}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-1 text-card-foreground">{member.name}</h3>
                <p className="text-brand text-sm mb-3">{t('aboutPage.teamRole')}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-6 text-primary-foreground">{t('aboutPage.ctaTitle')}</h2>
          <p className="text-lg text-primary-foreground mb-8">{t('aboutPage.ctaSubtitle')}</p>
          <button
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2 bg-white dark:bg-card text-brand hover:bg-gray-100 px-8 py-3 rounded-lg transition-colors"
          >
            {t('aboutPage.ctaButton')}
            <ArrowRight className="size-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
