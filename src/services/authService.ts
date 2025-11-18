import { supabase } from '../lib/supabase';
import { User, ApiResponse } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'inspector' | 'manager' | 'viewer';
  companyId?: string;
}

interface AuthResponse {
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          company:companies(
            id,
            name
          )
        `)
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(profileError.message);
      }

      if (!profile) {
        throw new Error('User profile not found');
      }

      const user: User = {
        id: profile.id,
        email: authData.user.email!,
        name: profile.name,
        role: profile.role,
        companyId: profile.company_id || undefined,
        companyName: profile.company?.name,
        avatar: profile.avatar_url || undefined,
      };

      return {
        data: { user },
        success: true,
        message: 'Login successful'
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    }
  }

  async signup(credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name: credentials.name,
            role: credentials.role || 'viewer',
            company_id: credentials.companyId || null,
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch the created profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        name: profile?.name || credentials.name,
        role: profile?.role || credentials.role || 'viewer',
        companyId: profile?.company_id || credentials.companyId,
      };

      return {
        data: { user },
        success: true,
        message: 'Signup successful'
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Add timeout to getSession to prevent hanging
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: null }, error: null }>((resolve) => {
        setTimeout(() => resolve({ data: { session: null }, error: null }), 2000);
      });

      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]);

      if (sessionError) {
        console.error('Session error:', sessionError);
        return null;
      }

      if (!session?.user) {
        console.log('No active session');
        return null;
      }

      console.log('Fetching profile for user:', session.user.id);

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          company:companies(
            id,
            name
          )
        `)
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }

      if (!profile) {
        console.log('No profile found for user');
        return null;
      }

      console.log('Profile found:', profile);

      return {
        id: profile.id,
        email: session.user.email!,
        name: profile.name,
        role: profile.role,
        companyId: profile.company_id || undefined,
        companyName: profile.company?.name,
        avatar: profile.avatar_url || undefined,
      };
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  }

  async updateUserProfile(updates: { company_id?: string | null }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      // Validate UUID format or null
      let companyIdToSave = updates.company_id;

      // If it's 'all' or doesn't look like a UUID, set to null
      if (!companyIdToSave || companyIdToSave === 'all' || !this.isValidUUID(companyIdToSave)) {
        companyIdToSave = null;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          company_id: companyIdToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      console.error('Update profile error:', error);
      throw new Error(errorMessage);
    }
  }

  async updateUserLanguage(language: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          preferred_language: language,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update language';
      console.error('Update language error:', error);
      throw new Error(errorMessage);
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event, 'Session:', !!session);

      // Handle sign out explicitly
      if (event === 'SIGNED_OUT') {
        callback(null);
        return;
      }

      // For all other events with a valid session, fetch and update user
      if (session?.user) {
        try {
          const user = await this.getCurrentUser();
          if (user) {
            callback(user);
          }
          // Don't call callback with null if user fetch fails during TOKEN_REFRESHED
          // This prevents unexpected logouts during temporary network issues
        } catch (error) {
          console.error('Error fetching user during auth state change:', error);
          // Only log out if explicitly signed out, not on fetch errors
          if (event === 'SIGNED_OUT') {
            callback(null);
          }
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        // Only clear user state for explicit sign out events
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
