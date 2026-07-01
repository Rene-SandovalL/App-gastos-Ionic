export interface categoria {
	id: number;
	nombre: string;
	color: string;
	icono: string;
}

export interface gastos {
	id: number;
	user_id: string;
	created_at: string;
	concepto: string;
	monto: number;
	fecha_gasto: string;
	categoria_id: number | null;
	categoria: string | null;
	metodo_pago: string | null;
	notas: string | null;
	categorias?: categoria | null;
}
