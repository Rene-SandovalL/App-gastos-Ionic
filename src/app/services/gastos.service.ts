import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { categoria, gastos } from '../models/gasto.model';

type GastoRow = {
  id: number;
  user_id: string;
  created_at: string;
  Concepto: string;
  Monto: number;
  Fecha_gasto: string;
  categoria_id: number | null;
  Metodo_pago: string | null;
  Notas: string | null;
  categorias?: {
    id: number | string;
    nombre: string;
    color: string;
    icono: string;
  } | Array<{
    id: number | string;
    nombre: string;
    color: string;
    icono: string;
  }> | null;
};

type CategoriaRow = {
  id: number;
  nombre: string;
  color: string;
  icono: string;
};

type GastoRpcRow = {
  id: number;
  user_id: string;
  created_at: string;
  concepto: string;
  monto: number;
  fecha_gasto: string;
  categoria_id: number | null;
  metodo_pago: string | null;
  notas: string | null;
  categoria_nombre: string | null;
  categoria_color: string | null;
  categoria_icono: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class GastosService {
  constructor(private supabaseService: SupabaseService) {}

  async getGastos(params: {
    limit: number;
    offset: number;
    categoriaId?: number | null;
    categoria?: string | null;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    searchTerm?: string | null;
  }): Promise<{ data: gastos[]; error: string | null }> {
    const { limit, offset, categoriaId, categoria, fechaInicio, fechaFin, searchTerm } = params;
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth
      .getUser();

    if (authError || !authData.user) {
      return { data: [], error: authError?.message ?? 'No hay sesión activa.' };
    }

    const from = Math.max(0, offset);
    const to = Math.max(from, from + Math.max(1, limit) - 1);

    let query = this.supabaseService
      .getClient()
      .from('gastos')
      .select('id, user_id, created_at, Concepto, Monto, Fecha_gasto, categoria_id, Metodo_pago, Notas, categorias(id, nombre, color, icono)')
      .eq('user_id', authData.user.id)
      .order('Fecha_gasto', { ascending: false })
      .range(from, to);

    if (categoriaId && categoriaId > 0) {
      query = query.eq('categoria_id', categoriaId);
    }

    if (categoria && categoria !== 'Todos') {
      query = query.eq('categorias.nombre', categoria);
    }

    if (searchTerm) {
      query = query.ilike('Concepto', `%${searchTerm}%`);
    }

    if (fechaInicio) {
      query = query.gte('Fecha_gasto', `${fechaInicio}T00:00:00`);
    }

    if (fechaFin) {
      // Incluye todo el día final para evitar perder registros con hora
      query = query.lte('Fecha_gasto', `${fechaFin}T23:59:59.999`);
    }

    const { data, error } = await query;

    const rows = (data ?? []) as unknown as GastoRow[];
    const normalized: gastos[] = rows.map((row) => {
      const categoriaRelacion = Array.isArray(row.categorias)
        ? (row.categorias[0] ?? null)
        : (row.categorias ?? null);

      return {
      id: row.id,
      user_id: row.user_id,
      created_at: row.created_at,
      concepto: row.Concepto,
      monto: row.Monto,
      fecha_gasto: row.Fecha_gasto,
      categoria_id: row.categoria_id ? Number(row.categoria_id) : null,
      categoria: null,
      metodo_pago: row.Metodo_pago,
      notas: row.Notas,
      categorias: categoriaRelacion
        ? {
            id: Number(categoriaRelacion.id),
            nombre: categoriaRelacion.nombre,
            color: categoriaRelacion.color,
            icono: categoriaRelacion.icono,
          }
        : null,
      };
    });

    return {
      data: normalized,
      error: error ? error.message : null,
    };
  }

  async addGasto(payload: {
    concepto: string;
    monto: number;
    fecha_gasto: string;
    categoria_id: number;
    metodo_pago: string;
    notas: string;
  }): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService.getClient().from('gastos').insert({
      Concepto: payload.concepto,
      Monto: payload.monto,
      Fecha_gasto: payload.fecha_gasto,
      categoria_id: payload.categoria_id,
      Metodo_pago: payload.metodo_pago,
      Notas: payload.notas,
    });

    return { error: error ? error.message : null };
  }

  async updateGasto(id: number, payload: {
    concepto: string;
    monto: number;
    fecha_gasto: string;
    categoria_id: number;
    metodo_pago: string;
    notas: string;
  }): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService.getClient().from('gastos').update({
      Concepto: payload.concepto,
      Monto: payload.monto,
      Fecha_gasto: payload.fecha_gasto,
      categoria_id: payload.categoria_id,
      Metodo_pago: payload.metodo_pago,
      Notas: payload.notas,
    }).eq('id', id);

    return { error: error ? error.message : null };
  }

  async deleteGasto(id: number): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService.getClient().from('gastos').delete().eq('id', id);
    return { error: error ? error.message : null };
  }

  async getCategorias(): Promise<{ data: categoria[]; error: string | null }> {
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth
      .getUser();

    if (authError || !authData.user) {
      return { data: [], error: authError?.message ?? 'No hay sesión activa.' };
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('categorias')
      .select('id, nombre, color, icono')
      .or(`user_id.is.null,user_id.eq.${authData.user.id}`)
      .order('id', { ascending: true });

    const rows = (data ?? []) as CategoriaRow[];
    const normalized: categoria[] = rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      color: row.color,
      icono: row.icono,
    }));

    return {
      data: normalized,
      error: error ? error.message : null,
    };
  }

  /** Obtiene gastos de un usuario específico en un rango de fechas (para Plan Familiar) */
  async getGastosPorMiembro(params: {
    userId: string;
    fechaInicio: string;
    fechaFin: string;
    categoriaId?: number | null;
  }): Promise<{ data: gastos[]; error: string | null }> {
    let query = this.supabaseService
      .getClient()
      .from('gastos')
      .select('id, user_id, created_at, Concepto, Monto, Fecha_gasto, categoria_id, Metodo_pago, Notas, categorias(id, nombre, color, icono)')
      .eq('user_id', params.userId)
      .gte('Fecha_gasto', `${params.fechaInicio}T00:00:00`)
      .lte('Fecha_gasto', `${params.fechaFin}T23:59:59.999`)
      .order('Fecha_gasto', { ascending: false });

    if (params.categoriaId && params.categoriaId > 0) {
      query = query.eq('categoria_id', params.categoriaId);
    }

    const { data, error } = await query;

    const rows = (data ?? []) as unknown as GastoRow[];
    const normalized: gastos[] = rows.map((row) => {
      const cat = Array.isArray(row.categorias)
        ? (row.categorias[0] ?? null)
        : (row.categorias ?? null);
      return {
        id: row.id,
        user_id: row.user_id,
        created_at: row.created_at,
        concepto: row.Concepto,
        monto: row.Monto,
        fecha_gasto: row.Fecha_gasto,
        categoria_id: row.categoria_id ? Number(row.categoria_id) : null,
        categoria: null,
        metodo_pago: row.Metodo_pago,
        notas: row.Notas,
        categorias: cat ? { id: Number(cat.id), nombre: cat.nombre, color: cat.color, icono: cat.icono } : null,
      };
    });

    return { data: normalized, error: error?.message ?? null };
  }

  /** Obtiene gastos de varios miembros en una sola consulta (mejor rendimiento para resumen familiar) */
  async getGastosPorMiembros(params: {
    userIds: string[];
    fechaInicio: string;
    fechaFin: string;
  }): Promise<{ data: gastos[]; error: string | null }> {
    if (!params.userIds.length) {
      return { data: [], error: null };
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('gastos')
      .select('id, user_id, created_at, Concepto, Monto, Fecha_gasto, categoria_id, Metodo_pago, Notas, categorias(id, nombre, color, icono)')
      .in('user_id', params.userIds)
      .gte('Fecha_gasto', `${params.fechaInicio}T00:00:00`)
      .lte('Fecha_gasto', `${params.fechaFin}T23:59:59.999`)
      .order('Fecha_gasto', { ascending: false });

    const rows = (data ?? []) as unknown as GastoRow[];
    const normalized: gastos[] = rows.map((row) => {
      const cat = Array.isArray(row.categorias)
        ? (row.categorias[0] ?? null)
        : (row.categorias ?? null);
      return {
        id: row.id,
        user_id: row.user_id,
        created_at: row.created_at,
        concepto: row.Concepto,
        monto: row.Monto,
        fecha_gasto: row.Fecha_gasto,
        categoria_id: row.categoria_id ? Number(row.categoria_id) : null,
        categoria: null,
        metodo_pago: row.Metodo_pago,
        notas: row.Notas,
        categorias: cat ? { id: Number(cat.id), nombre: cat.nombre, color: cat.color, icono: cat.icono } : null,
      };
    });

    return { data: normalized, error: error?.message ?? null };
  }

  /** Versión familiar basada en RPC para respetar/evitar limitaciones de RLS entre miembros */
  async getGastosFamilia(params: {
    familiaId: string;
    fechaInicio: string;
    fechaFin: string;
  }): Promise<{ data: gastos[]; error: string | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('get_gastos_familia', {
        p_familia_id: params.familiaId,
        p_fecha_inicio: params.fechaInicio,
        p_fecha_fin: params.fechaFin,
      });

    if (error) {
      return { data: [], error: error.message };
    }

    const rows = (data ?? []) as GastoRpcRow[];
    return { data: this.mapRpcRows(rows), error: null };
  }

  /** Gastos de un integrante en contexto familiar (RPC) */
  async getGastosIntegranteFamilia(params: {
    familiaId: string;
    integranteUserId: string;
    fechaInicio: string;
    fechaFin: string;
    categoriaId?: number | null;
  }): Promise<{ data: gastos[]; error: string | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('get_gastos_integrante_familia', {
        p_familia_id: params.familiaId,
        p_integrante_user_id: params.integranteUserId,
        p_fecha_inicio: params.fechaInicio,
        p_fecha_fin: params.fechaFin,
        p_categoria_id: params.categoriaId ?? null,
      });

    if (error) {
      return { data: [], error: error.message };
    }

    const rows = (data ?? []) as GastoRpcRow[];
    return { data: this.mapRpcRows(rows), error: null };
  }

  private mapRpcRows(rows: GastoRpcRow[]): gastos[] {
    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      created_at: row.created_at,
      concepto: row.concepto,
      monto: row.monto,
      fecha_gasto: row.fecha_gasto,
      categoria_id: row.categoria_id,
      categoria: null,
      metodo_pago: row.metodo_pago,
      notas: row.notas,
      categorias: row.categoria_id
        ? {
            id: row.categoria_id,
            nombre: row.categoria_nombre ?? 'Sin categoría',
            color: row.categoria_color ?? '#9ca3af',
            icono: row.categoria_icono ?? 'cart-outline',
          }
        : null,
    }));
  }
}

