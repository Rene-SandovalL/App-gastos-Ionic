import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Familia {
  id: string;
  nombre: string;
  codigo_invitacion: string;
  fecha_creacion: string;
}

export interface MiembroFamilia {
  id: string;
  familia_id: string;
  user_id: string;
  rol: 'padre' | 'hijo';
  familias?: Familia;
}

export interface Integrante {
  miembro_id: string;
  user_id: string;
  rol: 'padre' | 'hijo';
  nombre: string;
  avatar_url: string | null;
  iniciales: string;
}

@Injectable({
  providedIn: 'root',
})
export class FamiliaService {
  constructor(private supabaseService: SupabaseService) {}

  /** Genera un código alfanumérico aleatorio de 6 caracteres en mayúsculas */
  generarCodigo(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /** Obtiene el registro de miembro (con datos de la familia) para un usuario */
  async getMiembroConFamilia(userId: string): Promise<{ data: MiembroFamilia | null; error: string | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('miembros_familia')
      .select('*, familias(*)')
      .eq('user_id', userId)
      .maybeSingle();

    return { data: data as MiembroFamilia | null, error: error?.message ?? null };
  }

  /** Crea una familia nueva e inserta al usuario como 'padre' */
  async crearFamilia(nombre: string, userId: string): Promise<{ error: string | null }> {
    const client = this.supabaseService.getClient();
    const codigo_invitacion = this.generarCodigo();
    // Generamos el UUID en el cliente para evitar hacer SELECT en familias
    // antes de que el usuario esté en miembros_familia (lo bloquearía la policy)
    const familiaId = crypto.randomUUID();

    const { error: errorFamilia } = await client
      .from('familias')
      .insert({ id: familiaId, nombre: nombre.trim(), codigo_invitacion });

    if (errorFamilia) {
      return { error: errorFamilia.message };
    }

    const { error: errorMiembro } = await client
      .from('miembros_familia')
      .insert({ familia_id: familiaId, user_id: userId, rol: 'padre' });

    if (errorMiembro) {
      return { error: errorMiembro.message };
    }

    const { error: errorSync } = await client
      .rpc('sync_categorias_familia', { p_familia_id: familiaId });

    if (errorSync) {
      return {
        error:
          'La familia fue creada, pero falló la sincronización de categorías. ' +
          'Verifica que exista la función SQL sync_categorias_familia.'
      };
    }

    return { error: null };
  }

  /** Une a un usuario a una familia existente mediante el código de invitación */
  async unirseAFamilia(codigo: string, userId: string): Promise<{ error: string | null }> {
    const client = this.supabaseService.getClient();

    // Se usa una función RPC con SECURITY DEFINER para eludir la policy de SELECT
    // en 'familias', que bloquearía la búsqueda porque el usuario aún no es miembro.
    const { data: familiaId, error: errorBusqueda } = await client
      .rpc('buscar_familia_por_codigo', { p_codigo: codigo.trim().toUpperCase() });

    if (errorBusqueda) return { error: errorBusqueda.message };
    if (!familiaId) return { error: 'No se encontró ninguna familia con ese código.' };

    const { error: errorMiembro } = await client
      .from('miembros_familia')
      .insert({ familia_id: familiaId, user_id: userId, rol: 'hijo' });

    if (errorMiembro) {
      return { error: errorMiembro.message };
    }

    // Sincroniza categorías entre todos los miembros de la familia.
    // Requiere función SQL SECURITY DEFINER: public.sync_categorias_familia(uuid)
    const { error: errorSync } = await client
      .rpc('sync_categorias_familia', { p_familia_id: familiaId });

    if (errorSync) {
      return {
        error:
          'Te uniste a la familia, pero falló la sincronización de categorías. ' +
          'Verifica que exista la función SQL sync_categorias_familia.'
      };
    }

    return { error: null };
  }

  /** Obtiene todos los integrantes de una familia con su perfil (usa RPC SECURITY DEFINER) */
  async getMiembrosDeFamilia(familiaId: string): Promise<{ data: Integrante[]; error: string | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('get_miembros_familia', { p_familia_id: familiaId });

    if (error) return { data: [], error: error.message };

    const integrantes: Integrante[] = ((data as any[]) ?? []).map(m => ({
      miembro_id: m.miembro_id,
      user_id:    m.user_id,
      rol:        m.rol as 'padre' | 'hijo',
      nombre:     m.nombre ?? 'Usuario',
      avatar_url: m.avatar_url ?? null,
      iniciales:  this.generarIniciales(m.nombre ?? 'Usuario'),
    }));

    return { data: integrantes, error: null };
  }

  /** Fuerza sincronización de categorías entre miembros de la familia */
  async syncCategoriasFamilia(familiaId: string): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService
      .getClient()
      .rpc('sync_categorias_familia', { p_familia_id: familiaId });

    return { error: error?.message ?? null };
  }

  private generarIniciales(nombre: string): string {
    const parts = nombre.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nombre.substring(0, 2).toUpperCase();
  }
}

