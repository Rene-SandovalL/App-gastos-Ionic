import { Injectable } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async signUp(email: string, password: string, username: string): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService.getClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    return {
      error: error?.message ?? null,
    };
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService.getClient().auth.signInWithPassword({
      email,
      password,
    });

    return {
      error: error?.message ?? null,
    };
  }

  async signOut(): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService.getClient().auth.signOut();

    return {
      error: error?.message ?? null,
    };
  }

  async getSession(): Promise<{ session: Session | null; error: string | null }> {
    const { data, error } = await this.supabaseService.getClient().auth.getSession();

    return {
      session: data.session,
      error: error?.message ?? null,
    };
  }
}
