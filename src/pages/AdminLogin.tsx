import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if already logged in with admin/backoffice role
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .order('role', { ascending: true })
          .limit(1)
          .single();

        if (data && (data.role === 'ADMIN' || data.role === 'BACKOFFICE')) {
          navigate('/admin');
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      setLoading(false);
      toast({
        title: 'Erreur de connexion',
        description: 'Identifiants incorrects',
        variant: 'destructive',
      });
      return;
    }

    // Check if user has admin or backoffice role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.session.user.id)
      .order('role', { ascending: true })
      .limit(1)
      .single();

    setLoading(false);

    if (roleError || !roleData || (roleData.role !== 'ADMIN' && roleData.role !== 'BACKOFFICE')) {
      await supabase.auth.signOut();
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'avez pas les permissions nécessaires pour accéder au back-office',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Connexion réussie',
      description: 'Bienvenue dans le back-office',
    });
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Back-Office</h1>
          <p className="text-muted-foreground">Accès réservé aux administrateurs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion Back-Office</CardTitle>
            <CardDescription>
              Connectez-vous avec vos identifiants admin ou backoffice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                ← Retour au site
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
