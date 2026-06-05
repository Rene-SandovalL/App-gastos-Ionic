import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { gastos } from '../models/gasto.model';

type GastoRow = {
  id: number;
  created_at: string;
  Concepto: string;
  Monto: number;
  Fecha_gasto: string;
  Categoria: string | null;
  Metodo_pago: string | null;
  Notas: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class GastosService {
  constructor(private supabaseService: SupabaseService) {}

  async getGastos(params: {
    limit: number;
    offset: number;
    categoria?: string | null;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    searchTerm?: string | null;
  }): Promise<{ data: gastos[]; error: string | null }> {
    const { limit, offset, categoria, fechaInicio, fechaFin, searchTerm } = params;
    const from = Math.max(0, offset);
    const to = Math.max(from, from + Math.max(1, limit) - 1);

    let query = this.supabaseService
      .getClient()
      .from('gastos')
      .select('id, created_at, Concepto, Monto, Fecha_gasto, Categoria, Metodo_pago, Notas')
      .order('Fecha_gasto', { ascending: false })
      .range(from, to);

    if (categoria && categoria !== 'Todos') {
      query = query.eq('Categoria', categoria);
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
    const normalized: gastos[] = rows.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      concepto: row.Concepto,
      monto: row.Monto,
      fecha_gasto: row.Fecha_gasto,
      categoria: row.Categoria,
      metodo_pago: row.Metodo_pago,
      notas: row.Notas,
    }));

    return {
      data: normalized,
      error: error ? error.message : null,
    };
  }

  async addGasto(payload: {
    concepto: string;
    monto: number;
    fecha_gasto: string;
    categoria: string;
    metodo_pago: string;
    notas: string;
  }): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService.getClient().from('gastos').insert({
      Concepto: payload.concepto,
      Monto: payload.monto,
      Fecha_gasto: payload.fecha_gasto,
      Categoria: payload.categoria,
      Metodo_pago: payload.metodo_pago,
      Notas: payload.notas,
    });

    return { error: error ? error.message : null };
  }

  async updateGasto(id: number, payload: {
    concepto: string;
    monto: number;
    fecha_gasto: string;
    categoria: string;
    metodo_pago: string;
    notas: string;
  }): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService.getClient().from('gastos').update({
      Concepto: payload.concepto,
      Monto: payload.monto,
      Fecha_gasto: payload.fecha_gasto,
      Categoria: payload.categoria,
      Metodo_pago: payload.metodo_pago,
      Notas: payload.notas,
    }).eq('id', id);

    return { error: error ? error.message : null };
  }

  async deleteGasto(id: number): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService.getClient().from('gastos').delete().eq('id', id);
    return { error: error ? error.message : null };
  }
}
