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

  async uploadAvatar(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();

      const fileName = `${Date.now()}-perfil.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await this.supabaseService.getClient().storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Fallo al subir a Storage:', uploadError);
        throw uploadError;
      }

      const { data } = this.supabaseService.getClient().storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      const { error: updateError } = await this.supabaseService.getClient().auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) {
        console.error('Fallo al actualizar el perfil:', updateError);
        throw updateError;
      }
      return publicUrl;

    } catch (error) {
      console.error('Error crítico en uploadAvatar:', error);
      throw error;
    }
  }
}
