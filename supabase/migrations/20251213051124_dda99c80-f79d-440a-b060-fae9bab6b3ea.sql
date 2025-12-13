-- Create table for configurable contact recipients
CREATE TABLE public.contact_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_recipients ENABLE ROW LEVEL SECURITY;

-- Public can view active recipients (needed by edge function)
CREATE POLICY "Public can view active contact recipients"
ON public.contact_recipients
FOR SELECT
USING (is_active = true);

-- Admin and backoffice can manage recipients
CREATE POLICY "Admin and backoffice can manage contact recipients"
ON public.contact_recipients
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_contact_recipients_updated_at
BEFORE UPDATE ON public.contact_recipients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default contact
INSERT INTO public.contact_recipients (name, email) 
VALUES ('Contact Principal', 'contact@maisonwydeline.com');