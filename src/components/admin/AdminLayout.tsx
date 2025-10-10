import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Truck, 
  Users,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Produits', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Commandes', path: '/admin/orders' },
  { icon: FileText, label: 'Factures', path: '/admin/invoices' },
  { icon: Truck, label: 'Livraisons', path: '/admin/shipments' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
];

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { role, loading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Déconnecté avec succès' });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!role || (role !== 'ADMIN' && role !== 'BACKOFFICE')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
          <p className="text-muted-foreground mb-4">Vous n'avez pas les permissions nécessaires pour accéder au back-office.</p>
          <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-card border-r transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Back-Office</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {sidebarOpen && 'Déconnexion'}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-card border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Administration</h2>
            <p className="text-sm text-muted-foreground">
              Connecté en tant que <Badge variant="secondary">{role}</Badge>
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
