export interface gastos {
	id: number;
	created_at: string;
	concepto: string;
	monto: number;
	fecha_gasto: string;
	categoria: string | null;
	metodo_pago: string | null;
	notas: string | null;
}
