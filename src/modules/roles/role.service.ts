import { RoleRepository } from './role.repository';
import { User } from '../users/user.model';
import { NotFoundException, ConflictException, BadRequestException } from '../../shared/errors';
import { CreateRoleDTO, UpdateRoleDTO } from './dtos/role.dto';

export class RoleService {
  private roleRepository = new RoleRepository();

  async findAll(queryParams: Record<string, string | undefined>) {
    return this.roleRepository.findAll(queryParams);
  }

  async findById(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: CreateRoleDTO) {
    const existing = await this.roleRepository.findByName(data.nameEn);
    if (existing) throw new ConflictException('A role with this English name already exists');
    return this.roleRepository.create(data);
  }

  async update(id: string, data: UpdateRoleDTO) {
    const role = await this.findById(id);
    if (role.isSystem) throw new BadRequestException('Cannot modify system roles');

    if (data.nameEn) {
      const existing = await this.roleRepository.findByName(data.nameEn);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictException('A role with this English name already exists');
      }
    }

    const updated = await this.roleRepository.update(id, data as Record<string, unknown>);
    if (!updated) throw new NotFoundException('Role not found');
    return updated;
  }

  async delete(id: string) {
    const role = await this.findById(id);
    if (role.isSystem) throw new BadRequestException('Cannot delete system roles');

    const usersWithRole = await User.countDocuments({ role: id });
    if (usersWithRole > 0) {
      throw new BadRequestException(`Cannot delete role: ${usersWithRole} user(s) are assigned to this role`);
    }

    const deleted = await this.roleRepository.delete(id);
    if (!deleted) throw new NotFoundException('Role not found');
    return deleted;
  }
}
