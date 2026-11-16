/** Aviso del descanso en segundo plano — WEB: no aplica (sin notificaciones
 *  programadas en el navegador). Misma API que `restAlert.ts`. */
export async function scheduleRestAlert(_at: number, _title: string, _body?: string): Promise<void> {}
export async function cancelRestAlert(): Promise<void> {}
