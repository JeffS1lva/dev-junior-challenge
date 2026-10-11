/** Remove tudo que não for dígito. */
export function soDigitos(valor: string): string {
  return (valor || '').replace(/\D/g, '');
}

/** 12345678901 -> 123.456.789-01 (formata parcialmente enquanto digita). */
export function formatarCpf(valor: string): string {
  const d = soDigitos(valor).slice(0, 11);
  let s = d.slice(0, 3);
  if (d.length > 3) s += '.' + d.slice(3, 6);
  if (d.length > 6) s += '.' + d.slice(6, 9);
  if (d.length > 9) s += '-' + d.slice(9, 11);
  return s;
}

/**
 * 12345678901 -> ***.456.789-**
 * A recepção identifica o paciente pelo nome; o CPF completo não precisa
 * ficar exposto na tela.
 */
export function mascararCpf(valor: string): string {
  const d = soDigitos(valor);
  if (d.length !== 11) return '***.***.***-**';
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
}
