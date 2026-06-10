import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { categoria, gastos } from '../models/gasto.model';

type GastoRow = {
  id: number;
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
    const from = Math.max(0, offset);
    const to = Math.max(from, from + Math.max(1, limit) - 1);

    let query = this.supabaseService
      .getClient()
      .from('gastos')
      .select('id, created_at, Concepto, Monto, Fecha_gasto, categoria_id, Metodo_pago, Notas, categorias(id, nombre, color, icono)')
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
      query = query.gte('Fecha_gasto', fechaInicio);
    }

    if (fechaFin) {
      query = query.lte('Fecha_gasto', fechaFin);
    }

    const { data, error } = await query;

    const rows = (data ?? []) as unknown as GastoRow[];
    const normalized: gastos[] = rows.map((row) => {
      const categoriaRelacion = Array.isArray(row.categorias)
        ? (row.categorias[0] ?? null)
        : (row.categorias ?? null);

      return {
      id: row.id,
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
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categorias')
      .select('id, nombre, color, icono')
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
}
