import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'ADMIN' | 'BACKOFFICE' | 'USER' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('role', { ascending: true })
          .limit(1)
          .single();

        if (error || !data) {
          setRole('USER');
        } else {
          setRole(data.role as UserRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('USER');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const hasRole = (requiredRole: 'ADMIN' | 'BACKOFFICE') => {
    if (requiredRole === 'ADMIN') {
      return role === 'ADMIN';
    }
    return role === 'ADMIN' || role === 'BACKOFFICE';
  };

  return { role, loading, hasRole, isAdmin: role === 'ADMIN', isBackoffice: role === 'BACKOFFICE' };
};
