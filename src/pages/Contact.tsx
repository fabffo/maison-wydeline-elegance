import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message envoyé avec succès!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-luxury-cream">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-medium text-center mb-16">
          {t.contact.title}
        </h1>

        <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-lg p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">{t.contact.name}</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">{t.contact.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="message">{t.contact.message}</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="mt-2 min-h-[150px]"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              {t.contact.send}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Contact;
