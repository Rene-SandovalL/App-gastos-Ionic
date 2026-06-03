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
  private readonly selectColumns = [
    'id',
    'created_at',
    'Concepto',
    'Monto',
    'Fecha_gasto',
    'Categoria',
    'Metodo_pago',
    'Notas',
  ];
  private readonly fechaColumn = 'Fecha_gasto';
  private readonly categoriaColumn = 'Categoria';

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
      .select(this.selectColumns.join(', '))
      .order(this.fechaColumn, { ascending: false })
      .range(from, to);

    if (categoria && categoria !== 'Todos') {
      query = query.eq(this.categoriaColumn, categoria);
    }

    if (searchTerm) {
      query = query.ilike('Concepto', `%${searchTerm}%`);
    }

    if (fechaInicio) {
      query = query.gte(this.fechaColumn, fechaInicio);
    }

    if (fechaFin) {
      query = query.lte(this.fechaColumn, fechaFin);
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
}
