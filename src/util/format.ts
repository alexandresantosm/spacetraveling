import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date: number): string {
  return format(new Date(date), 'dd MMM yyyy', {
    locale: ptBR,
  });
}

export function formatEditedPostDate(date: number): string {
  return format(new Date(date), "'* editado em' dd MMM yyyy', às' H':'m", {
    locale: ptBR,
  });
}
