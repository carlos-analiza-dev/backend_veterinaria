import { Cliente } from 'src/auth-clientes/entities/auth-cliente.entity';
import { TipoCliente } from 'src/interfaces/clientes.enums';

export const getPropietarioId = (cliente: Cliente): string => {
  if (cliente.rol === TipoCliente.TRABAJADOR) {
    if (!cliente.propietarioId) {
      throw new Error('El trabajador no tiene propietario asignado');
    }
    return cliente.propietarioId;
  }

  return cliente.id;
};
