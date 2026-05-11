import { useNavigate } from "react-router";
import {
  // Heart,
  Target,
  // Users,
  // Leaf,
  // Globe,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/card";
import { ImageWithFallback } from "../ui/ImageWithFallback";

import umutPic from "../../resources/CoFounder_Umut.jpeg";
import colinPic from "../../resources/CoFounder_Colin.jpeg";
import denisPic from "../../resources/CoFounder_Denis.jpeg";

export function AboutPage() {
  const navigate = useNavigate();
  const {t} = useTranslation();

  // const values = [
  //   {
  //     icon: Leaf,
  //     title: "Sustainability First",
  //     description:
  //       "Environmental responsibility is at the core of everything we do.",
  //   },
  //   {
  //     icon: Users,
  //     title: "Community Driven",
  //     description:
  //       "We believe in the power of collective action to create lasting change.",
  //   },
  //   {
  //     icon: Heart,
  //     title: "Inclusive Impact",
  //     description:
  //       "Making sustainable choices accessible and rewarding for everyone.",
  //   },
  //   {
  //     icon: Globe,
  //     title: "Local & Global",
  //     description:
  //       "Starting in Zürich with a vision to inspire sustainable tourism worldwide.",
  //   },
  // ];

  const team = [
    {
      name: "Umut Öztürk",
      role: "Co-Founder",
      image: umutPic,
      // bio: "Passionate about sustainable tourism.",
    },
    {
      name: "Colin Debuis",
      role: "Co-Founder",
      image: colinPic,
      // bio: "Expert in building strategic partnerships with local businesses.",
      // bio: "Tech entrepreneur focused on building platforms for positive social impact.",
    },
    {
      name: "Denis Djaferi",
      role: "Co-Founder",
      image: denisPic,
      // bio: "Dedicated to engaging and growing our community of eco-conscious users.",
    },
    // {
    //   name: "Placeholder",
    //   role: "Community Manager",
    //   bio: "Dedicated to engaging and growing our community of eco-conscious users.",
    // },
  ];

  // const milestones = [
  //   {
  //     year: "2024",
  //     title: "Platform Launch",
  //     description: "Launched zürimpact in Zürich with 20 partner venues.",
  //   },
  //   {
  //     year: "2024",
  //     title: "Growing Community",
  //     description: "Reached 5,000+ active users and 80+ partner businesses.",
  //   },
  //   {
  //     year: "2025",
  //     title: "Expansion Plans",
  //     description: "Planning to expand to other Swiss cities and beyond.",
  //   },
  // ];

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
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            {t('aboutPage.heroSubtitle')}
          </p>
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
              <h2 className="text-3xl md:text-4xl mb-6 text-foreground">
                {t('aboutPage.missionTitle')}
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                {t('aboutPage.missionDescription1')}
              </p>
              <p className="text-lg text-muted-foreground">
                {t('aboutPage.missionDescription2')}
              </p>
            </div>
            {/* <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center bg-gray-900 border-gray-800 hover:shadow-lg hover:shadow-green-500/10 transition-shadow">
                <div className="text-4xl font-bold text-green-500 mb-2">5,200+</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </Card>
              <Card className="p-6 text-center bg-gray-900 border-gray-800 hover:shadow-lg hover:shadow-green-500/10 transition-shadow">
                <div className="text-4xl font-bold text-green-500 mb-2">12,000kg</div>
                <div className="text-sm text-gray-400">Waste Collected</div>
              </Card>
              <Card className="p-6 text-center bg-gray-900 border-gray-800 hover:shadow-lg hover:shadow-green-500/10 transition-shadow">
                <div className="text-4xl font-bold text-green-500 mb-2">80+</div>
                <div className="text-sm text-gray-400">Partner Venues</div>
              </Card>
              <Card className="p-6 text-center bg-gray-900 border-gray-800 hover:shadow-lg hover:shadow-green-500/10 transition-shadow">
                <div className="text-4xl font-bold text-green-500 mb-2">25,000+</div>
                <div className="text-sm text-gray-400">Rewards Claimed</div>
              </Card>
            </div> */}
          </div>
        </div>
      </section>

      {/* Values Section */}
      {/* <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4 text-white">Our Values</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="p-6 text-center bg-gray-800 border-gray-700 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all"
              >
                <div className="bg-green-500/20 size-14 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="size-7 text-green-500" />
                </div>
                <h3 className="text-xl mb-3 text-white">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Team Section */}
      <section className="relative py-16 md:py-0 md:h-[600px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1583321500900-82807e458f3c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl mb-5 text-white">{t('aboutPage.teamTitle')}</h2>
            <p className="text-lg text-white mb-9 max-w-2xl mx-auto">
              {t('aboutPage.teamSubtitle')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-xs mx-auto md:max-w-none">
              {team.map((member, index) => (
                <Card key={index} className="p-7 text-center bg-card border-border hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10 transition-shadow">
                  <div className="relative w-40 h-40 md:w-50 md:h-50 mx-auto mb-4">
                    <img
                      src={member.image}
                      alt={`Photo of ${member.name}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 text-card-foreground">{member.name}</h3>
                  <p className="text-brand text-sm mb-3">{t('aboutPage.teamRole')}</p>
                  {/* <p className="text-gray-400 text-sm">{member.bio}</p> */}
                </Card>
              ))}
            </div>
        </div>
        
      </section>     

      {/* Journey Section */}
      {/* <section className="py-20 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4 text-white">Our Journey</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              From idea to impact—here's our story so far
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <Card
                key={index}
                className="p-6 bg-gray-800 border-gray-700 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-shadow"
              >
                <div className="flex items-start gap-6">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold min-w-[80px] text-center">
                    {milestone.year}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-white">{milestone.title}</h3>
                    <p className="text-gray-400">{milestone.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Impact Section */}
      {/* <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 bg-gradient-to-br from-green-600 to-teal-700 text-white border-0">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
                  <TrendingUp className="size-4" />
                  <span className="text-sm">Environmental Impact</span>
                </div>
                <h2 className="text-3xl md:text-4xl mb-4">
                  Making a Real Difference
                </h2>
                <p className="text-green-100 mb-6">
                  Every action counts. Together, our community has made significant
                  strides in making Zürich more sustainable through collective effort
                  and dedication.
                </p>
                <button
                  onClick={() => navigate("/partners")}
                  className="inline-flex items-center gap-2 bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg transition-colors"
                >
                  Become a Partner
                  <ArrowRight className="size-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <Award className="size-8 mb-3 opacity-80" />
                  <div className="text-2xl font-bold mb-1">25,000+</div>
                  <div className="text-green-100 text-sm">Sustainable Actions</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <Users className="size-8 mb-3 opacity-80" />
                  <div className="text-2xl font-bold mb-1">5,200+</div>
                  <div className="text-green-100 text-sm">Community Members</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <Leaf className="size-8 mb-3 opacity-80" />
                  <div className="text-2xl font-bold mb-1">12 tons</div>
                  <div className="text-green-100 text-sm">Waste Collected</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <Globe className="size-8 mb-3 opacity-80" />
                  <div className="text-2xl font-bold mb-1">80+</div>
                  <div className="text-green-100 text-sm">Partners</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-brand text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-6 text-primary-foreground">{t('aboutPage.ctaTitle')}</h2>
          <p className="text-lg text-primary-foreground mb-8">
            {t('aboutPage.ctaSubtitle')}
          </p>
          <button
            onClick={() => navigate("/contact")}
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