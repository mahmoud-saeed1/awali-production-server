import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { User, IUser } from '../users/user.model';
import { Role } from '../roles/role.model';
import {
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '../../shared/errors';
import { RegisterDTO, LoginDTO, ChangePasswordDTO } from './dtos/auth.dto';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: { en: string; ar: string };
    phone?: string;
    role: {
      id: string;
      nameEn: string;
      nameAr: string;
      permissions: Record<string, unknown>;
      isSystem: boolean;
    };
    isActive: boolean;
    createdAt: Date;
  };
  tokens: TokenPair;
}

export class AuthService {
  // ─── Register ─────────────────────────────────────────
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // Get default role or specified role
    let roleId = data.role;
    if (!roleId) {
      const viewerRole = await Role.findOne({ nameEn: 'Viewer', isActive: true });
      if (!viewerRole) throw new NotFoundException('Default role not found. Please seed database first.');
      roleId = viewerRole._id.toString();
    }

    const roleDoc = await Role.findById(roleId);
    if (!roleDoc || !roleDoc.isActive) {
      throw new NotFoundException('Specified role not found or inactive');
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    const user = await User.create({
      email: data.email,
      password: passwordHash,
      name: data.name,
      phone: data.phone,
      role: roleId,
      isActive: true,
    });

    const tokens = this.generateTokens(user);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return this.buildAuthResponse(user, roleDoc, tokens);
  }

  // ─── Login ────────────────────────────────────────────
  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await User.findOne({ email: data.email }).select('+password').populate('role');
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked. Please try again later.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: Record<string, unknown> = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }

      await User.findByIdAndUpdate(user._id, updateData);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset failed attempts on successful login
    await User.findByIdAndUpdate(user._id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    });

    const tokens = this.generateTokens(user);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    const role = user.role as unknown as InstanceType<typeof Role>;
    return this.buildAuthResponse(user, role, tokens);
  }

  // ─── Refresh Token ────────────────────────────────────
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };

      const user = await User.findById(decoded.userId).select('+refreshToken');
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      const tokens = this.generateTokens(user);
      await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ─── Logout ───────────────────────────────────────────
  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  // ─── Change Password ─────────────────────────────────
  async changePassword(userId: string, data: ChangePasswordDTO): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundException('User not found');

    const isCurrentValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(data.newPassword, env.BCRYPT_ROUNDS);
    await User.findByIdAndUpdate(userId, { password: newHash, refreshToken: null });
  }

  // ─── Get Profile ──────────────────────────────────────
  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await User.findById(userId).populate('role');
    if (!user) throw new NotFoundException('User not found');

    const role = user.role as unknown as InstanceType<typeof Role>;
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: role
        ? {
            id: role._id.toString(),
            nameEn: role.nameEn,
            nameAr: role.nameAr,
            permissions: role.permissions,
            isSystem: role.isSystem,
          }
        : null,
      isActive: user.isActive,
      lastLogin: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // ─── Helpers ──────────────────────────────────────────
  private generateTokens(user: IUser): TokenPair {
    const payload = { userId: user._id.toString(), email: user.email };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  private buildAuthResponse(
    user: IUser,
    role: InstanceType<typeof Role>,
    tokens: TokenPair
  ): AuthResponse {
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: {
          id: role._id.toString(),
          nameEn: role.nameEn,
          nameAr: role.nameAr,
          permissions: role.permissions,
          isSystem: role.isSystem,
        },
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }
}
