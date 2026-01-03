import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Seo } from '@/components/Seo';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (formData.name.length > 100) {
      toast.error('Le nom ne peut pas dépasser 100 caractères');
      return;
    }

    if (formData.message.length > 5000) {
      toast.error('Le message ne peut pas dépasser 5000 caractères');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        },
      });

      if (error) throw error;

      toast.success('Message envoyé avec succès ! Vous recevrez une confirmation par email.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Error sending contact email:', error);
      toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo />
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
                maxLength={100}
                className="mt-2"
                disabled={isSubmitting}
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
                maxLength={255}
                className="mt-2"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="message">{t.contact.message}</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                maxLength={5000}
                className="mt-2 min-h-[150px]"
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi en cours...' : t.contact.send}
            </Button>
          </form>
        </div>
      </div>
    </main>
    </>
  );
};

export default Contact;
