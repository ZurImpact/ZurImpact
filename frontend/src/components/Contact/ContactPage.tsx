import {useState} from 'react';
import {
  Mail,
  Phone,
  // MapPin,
  Send,
  // FileText,
  Building2,
  User,
  MessageSquare,
} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Card} from '../ui/card';
import {Input} from '../ui/input';
import {Label} from '../ui/label';
import {Button} from '../ui/button';
import {toast} from 'sonner';

export function ContactPage() {
  const {t} = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    type: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await fetch('https://formspree.io/f/xvzwdlbv', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      toast.success(t('contactPage.toastSuccess'));
      setFormData({name: '', email: '', company: '', phone: '', type: '', message: ''});
    } else {
      toast.error(t('contactPage.toastError'));
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-brand text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl mb-6">{t('contactPage.heroTitle')}</h1>
            <p className="text-lg">{t('contactPage.heroSubtitle')}</p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto gap-8">
            {/* Contact Form */}
            <Card className="p-8 bg-card hover:shadow-xl transition-shadow dark:hover:shadow-xl dark:hover:shadow-brand/30 border-border">
              <h2 className="text-2xl font-semibold mb-6 text-brand">{t('contactPage.formTitle')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">
                      {t('contactPage.nameLabel')} <span className="text-destructive">{t('contactPage.required')}</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder={t('contactPage.namePlaceholder')}
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 bg-input-background text-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      {t('contactPage.emailLabel')}{' '}
                      <span className="text-destructive">{t('contactPage.required')}</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t('contactPage.emailPlaceholder')}
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 bg-input-background text-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-foreground">
                      {t('contactPage.companyLabel')}
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        placeholder={t('contactPage.companyPlaceholder')}
                        value={formData.company}
                        onChange={handleChange}
                        className="pl-10 bg-input-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      {t('contactPage.phoneLabel')}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t('contactPage.phonePlaceholder')}
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 bg-input-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-foreground">
                    {t('contactPage.inquiryTypeLabel')}{' '}
                    <span className="text-destructive">{t('contactPage.required')}</span>
                  </Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-input-background text-foreground border-border border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                    required
                  >
                    <option value="">{t('contactPage.inquiryPlaceholder')}</option>
                    <option value="partner">{t('contactPage.inquiryOptionPartner')}</option>
                    <option value="general">{t('contactPage.inquiryOptionGeneral')}</option>
                    <option value="support">{t('contactPage.inquiryOptionSupport')}</option>
                    <option value="press">{t('contactPage.inquiryOptionPress')}</option>
                    <option value="other">{t('contactPage.inquiryOptionOther')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">
                    {t('contactPage.messageLabel')}{' '}
                    <span className="text-destructive">{t('contactPage.required')}</span>
                  </Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      placeholder={t('contactPage.messagePlaceholder')}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 bg-input-background text-foreground placeholder:text-muted-foreground border-border border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand hover:brightness-90 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    t('contactPage.sendingButton')
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      {t('contactPage.sendButton')}
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Pitch Deck Download */}
            {/* <div className="space-y-6">
           
              <Card className="p-6 bg-gradient-to-br from-green-900/50 to-teal-900/50 border-green-500/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 text-white">Download Our Pitch Deck</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Learn more about our vision, impact, and partnership opportunities.
                    </p>
                    <a
                      href="/pitch-deck.pdf"
                      download
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      Download PDF
                    </a>
                  </div>
                </div>
              </Card>
              
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
}
