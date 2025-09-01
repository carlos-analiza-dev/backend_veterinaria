import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/auth/entities/auth.entity';
import { Pai } from 'src/pais/entities/pai.entity';
import { DepartamentosPai } from 'src/departamentos_pais/entities/departamentos_pai.entity';
import { MunicipiosDepartamentosPai } from 'src/municipios_departamentos_pais/entities/municipios_departamentos_pai.entity';
import { EspecieAnimal } from 'src/especie_animal/entities/especie_animal.entity';
import { RazaAnimal } from 'src/raza_animal/entities/raza_animal.entity';
import {
  Sucursal,
  TipoSucursal,
} from 'src/sucursales/entities/sucursal.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pai)
    private readonly paiRepository: Repository<Pai>,
    @InjectRepository(DepartamentosPai)
    private readonly departamentoRepository: Repository<DepartamentosPai>,
    @InjectRepository(MunicipiosDepartamentosPai)
    private readonly municipioRepository: Repository<MunicipiosDepartamentosPai>,
    @InjectRepository(EspecieAnimal)
    private readonly especieRepository: Repository<EspecieAnimal>,
    @InjectRepository(RazaAnimal)
    private readonly razaRepository: Repository<RazaAnimal>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,

    private readonly configService: ConfigService,
  ) {}

  async executeSeed() {
    await this.createRoles();
    const honduras = await this.createHonduras();
    const franciscoMorazan = await this.createDepartamentoFranciscoMorazan(
      honduras,
    );
    const tegucigalpa = await this.createMunicipioTegucigalpa(franciscoMorazan);
    await this.createAdminUser(honduras, franciscoMorazan, tegucigalpa);
    const sucursal = await this.createSucursalPrincipal(
      honduras,
      franciscoMorazan,
      tegucigalpa,
    );
    await this.updateAdminUserWithSucursal(sucursal);
    await this.createEspeciesAndRazas();
    return { message: 'Semilla ejecutada correctamente' };
  }

  private async createRoles() {
    const rolesData = [
      { name: 'Administrador', description: 'Administrador del sistema' },
      { name: 'Ganadero', description: 'Usuario ganadero' },
      {
        name: 'Veterinario',
        description: 'Veterinario Laboratorios Centroamericanos',
      },
      { name: 'Secretario', description: 'Secretarios Veterinaria Analiza' },
    ];

    for (const roleData of rolesData) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        await this.roleRepository.save(this.roleRepository.create(roleData));
      }
    }
  }

  private async createHonduras(): Promise<Pai> {
    const existingPai = await this.paiRepository.findOne({
      where: { nombre: 'Honduras' },
    });

    if (!existingPai) {
      const newPai = this.paiRepository.create({
        nombre: 'Honduras',
        code: 'HN',
        code_phone: '+504',
        nombre_moneda: 'Lempira',
        simbolo_moneda: 'L',
        nombre_documento: 'DNI',
        isActive: true,
      });
      return await this.paiRepository.save(newPai);
    }
    return existingPai;
  }

  private async createDepartamentoFranciscoMorazan(
    pai: Pai,
  ): Promise<DepartamentosPai> {
    const existingDepartamento = await this.departamentoRepository.findOne({
      where: { nombre: 'Francisco Morazán', pais: { id: pai.id } },
      relations: ['pais'],
    });

    if (!existingDepartamento) {
      const newDepartamento = this.departamentoRepository.create({
        nombre: 'Francisco Morazán',
        pais: pai,
        isActive: true,
      });
      return await this.departamentoRepository.save(newDepartamento);
    }
    return existingDepartamento;
  }

  private async createMunicipioTegucigalpa(
    departamento: DepartamentosPai,
  ): Promise<MunicipiosDepartamentosPai> {
    const existingMunicipio = await this.municipioRepository.findOne({
      where: { nombre: 'Tegucigalpa', departamento: { id: departamento.id } },
      relations: ['departamento'],
    });

    if (!existingMunicipio) {
      const newMunicipio = this.municipioRepository.create({
        nombre: 'Tegucigalpa',
        departamento: departamento,
        isActive: true,
      });
      return await this.municipioRepository.save(newMunicipio);
    }
    return existingMunicipio;
  }

  private async createSucursalPrincipal(
    pai: Pai,
    departamento: DepartamentosPai,
    municipio: MunicipiosDepartamentosPai,
  ) {
    const adminUser = await this.userRepository.findOne({
      where: {
        email: this.configService.get('ADMIN_EMAIL') || 'admin@example.com',
      },
    });

    if (!adminUser) {
      throw new Error(
        'No se encontró el usuario administrador para asignar como gerente',
      );
    }

    const existingSucursal = await this.sucursalRepository.findOne({
      where: { nombre: 'Casa Matriz' },
    });

    if (!existingSucursal) {
      const newSucursal = this.sucursalRepository.create({
        nombre: 'Casa Matriz',
        tipo: TipoSucursal.CASA_MATRIZ,
        direccion_complemento: 'Centro de Tegucigalpa, Honduras',
        pais: pai,
        departamento: departamento,
        municipio: municipio,
        gerente: adminUser,
        isActive: true,
      });

      return await this.sucursalRepository.save(newSucursal);
    }

    return existingSucursal;
  }

  private async createAdminUser(
    pai: Pai,
    departamento: DepartamentosPai,
    municipio: MunicipiosDepartamentosPai,
  ) {
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'Administrador' },
    });

    if (!adminRole) {
      throw new Error('Rol Administrador no encontrado');
    }

    const adminEmail =
      this.configService.get('ADMIN_EMAIL') || 'admin@example.com';
    const adminPassword =
      this.configService.get('ADMIN_PASSWORD') || 'Admin123*';

    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const adminUser = this.userRepository.create({
        email: adminEmail,
        password: bcrypt.hashSync(adminPassword, 10),
        name: 'Carlos Eduardo Alcerro Lainez',
        direccion: 'Tegucigalpa, Honduras',
        telefono: '+504 8770-9116',
        identificacion: '1201-2000-00131',
        sexo: 'M',
        role: adminRole,
        isActive: true,
        isAuthorized: true,
        pais: pai,
        departamento: departamento,
        municipio: municipio,
      });

      await this.userRepository.save(adminUser);
    }
  }

  private async updateAdminUserWithSucursal(sucursal: Sucursal) {
    const adminEmail =
      this.configService.get('ADMIN_EMAIL') || 'admin@example.com';

    const adminUser = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (adminUser) {
      adminUser.sucursal = sucursal;
      await this.userRepository.save(adminUser);
    }
  }

  private async createEspeciesAndRazas() {
    const especiesData = [
      { nombre: 'Bovino' },
      { nombre: 'Equino' },
      { nombre: 'Porcino' },
      { nombre: 'Avícola' },
      { nombre: 'Caprino' },
    ];

    const razasPorEspecie = {
      Bovino: [
        { nombre: 'Holstein', abreviatura: 'HOL' },
        { nombre: 'Jersey', abreviatura: 'JER' },
        { nombre: 'Charolais', abreviatura: 'CHA' },
        { nombre: 'Brahman', abreviatura: 'BRH' },
        { nombre: 'Beef Master', abreviatura: 'BFM' },
        { nombre: 'Brangus', abreviatura: 'BRG' },
        { nombre: 'Pardo Suizo', abreviatura: 'PSZ' },
        { nombre: 'Gyr', abreviatura: 'GYR' },
        { nombre: 'Hereford', abreviatura: 'HER' },
        { nombre: 'Santa Gertrudis', abreviatura: 'SGT' },
        { nombre: 'Angus', abreviatura: 'ANG' },
        { nombre: 'Simmental', abreviatura: 'SIM' },
        { nombre: 'Senepol', abreviatura: 'SNP' },
        { nombre: 'Cruzamiento con Cebú', abreviatura: 'CCC' },
      ],
      Equino: [
        { nombre: 'Caballo Español', abreviatura: 'ESP' },
        { nombre: 'Caballo Peruano', abreviatura: 'PER' },
        { nombre: 'Ibero', abreviatura: 'IBO' },
        { nombre: 'Cuarto de Milla', abreviatura: 'CDM' },
        { nombre: 'Árabe', abreviatura: 'ARA' },
        { nombre: 'Barroco', abreviatura: 'BAR' },
        { nombre: 'Frisón', abreviatura: 'FRI' },
        { nombre: 'Gypsy Vanner', abreviatura: 'GYP' },
        { nombre: 'Pura Sangre Inglés', abreviatura: 'PSI' },
        { nombre: 'Pony de Shetland', abreviatura: 'PSH' },
      ],
      Porcino: [
        { nombre: 'Landrace', abreviatura: 'LAN' },
        { nombre: 'Duroc', abreviatura: 'DUR' },
        { nombre: 'Hampshire', abreviatura: 'HAM' },
        { nombre: 'Large White', abreviatura: 'LW' },
        { nombre: 'Pietrain', abreviatura: 'PIE' },
      ],
      Avícola: [
        { nombre: 'Postura', abreviatura: 'POS' },
        { nombre: 'Rhode Island Red', abreviatura: 'RIR' },
        { nombre: 'Highline Brown', abreviatura: 'HLB' },
        { nombre: 'Plymouth Rock', abreviatura: 'PRK' },
        { nombre: 'Orpington', abreviatura: 'ORP' },
        { nombre: 'Sussex', abreviatura: 'SUS' },
        { nombre: 'Leghorn', abreviatura: 'LGH' },
        { nombre: 'Cobb 500', abreviatura: 'C500' },
        { nombre: 'Ross 308', abreviatura: 'R308' },
      ],
      Caprino: [
        { nombre: 'Dorper', abreviatura: 'DOR' },
        { nombre: 'Boer', abreviatura: 'BOE' },
        { nombre: 'Española', abreviatura: 'ESP' },
        { nombre: 'Nubia', abreviatura: 'NUB' },
        { nombre: 'Saanen', abreviatura: 'SAA' },
      ],
    };

    for (const especieData of especiesData) {
      const existingEspecie = await this.especieRepository.findOne({
        where: { nombre: especieData.nombre },
      });

      if (!existingEspecie) {
        const newEspecie = this.especieRepository.create(especieData);
        await this.especieRepository.save(newEspecie);
      }
    }

    for (const [especieNombre, razas] of Object.entries(razasPorEspecie)) {
      const especie = await this.especieRepository.findOne({
        where: { nombre: especieNombre },
      });

      if (especie) {
        for (const razaData of razas) {
          const existingRaza = await this.razaRepository.findOne({
            where: {
              nombre: razaData.nombre,
              especie: { id: especie.id },
            },
            relations: ['especie'],
          });

          if (!existingRaza) {
            const newRaza = this.razaRepository.create({
              nombre: razaData.nombre,
              abreviatura: razaData.abreviatura,
              especie: especie,
              isActive: true,
            });
            await this.razaRepository.save(newRaza);
          } else if (!existingRaza.abreviatura) {
            existingRaza.abreviatura = razaData.abreviatura;
            await this.razaRepository.save(existingRaza);
          }
        }
      }
    }
  }
}
