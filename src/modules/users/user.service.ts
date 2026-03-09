import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { UserRepository } from './user.repository';
import { Role } from '../roles/role.model';
import { NotFoundException, ConflictException, BadRequestException } from '../../shared/errors';
import { CreateUserDTO, UpdateUserDTO } from './dtos/user.dto';

export class UserService {
  private userRepository = new UserRepository();

  async findAll(queryParams: Record<string, string | undefined>) {
    return this.userRepository.findAll(queryParams);
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: CreateUserDTO) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new ConflictException('Email is already registered');

    const role = await Role.findById(data.role);
    if (!role || !role.isActive) throw new NotFoundException('Specified role not found or inactive');

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    return this.userRepository.create({
      email: data.email,
      password: passwordHash,
      name: data.name,
      phone: data.phone,
      role: data.role as unknown as import('mongoose').Types.ObjectId,
      isActive: true,
    });
  }

  async update(id: string, data: UpdateUserDTO) {
    await this.findById(id); // Ensure exists

    if (data.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictException('Email is already in use');
      }
    }

    if (data.role) {
      const role = await Role.findById(data.role);
      if (!role || !role.isActive) throw new NotFoundException('Specified role not found or inactive');
    }

    const user = await this.userRepository.update(id, data as Record<string, unknown>);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async softDelete(id: string) {
    const user = await this.findById(id);
    // Prevent deleting super admin
    const role = user.role as unknown as { isSystem: boolean };
    if (role?.isSystem) {
      throw new BadRequestException('Cannot delete super admin user');
    }

    const deleted = await this.userRepository.softDelete(id);
    if (!deleted) throw new NotFoundException('User not found');
    return deleted;
  }

  async activate(id: string) {
    const user = await this.userRepository.update(id, {
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: undefined,
    } as Record<string, unknown>);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deactivate(id: string) {
    const user = await this.findById(id);
    const role = user.role as unknown as { isSystem: boolean };
    if (role?.isSystem) {
      throw new BadRequestException('Cannot deactivate super admin user');
    }

    const updated = await this.userRepository.update(id, { isActive: false } as Record<string, unknown>);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }
}
