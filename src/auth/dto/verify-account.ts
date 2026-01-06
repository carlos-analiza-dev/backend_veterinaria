import { Matches } from 'class-validator';

export class VerifiedAccountDto {
  @Matches(
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    { message: 'El correo electronico no tiene formato adecuado' },
  )
  email: string;
}
