import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserFollowersModel } from './entities/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  private getUsersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository;
  }

  private getUserFollowRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel)
      : this.userFollowersRepository;
  }

  async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
    const nicknameExists = await this.usersRepository.existsBy({
      nickname: user.nickname,
    });

    if (nicknameExists) {
      throw new BadRequestException('이미 존재하는 nickname입니다.');
    }

    const emailExists = await this.usersRepository.existsBy({
      email: user.email,
    });

    if (emailExists) {
      throw new BadRequestException('이미 존재하는 email입니다.');
    }

    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.usersRepository.save(userObject);

    return newUser;
  }

  async getAllUsers() {
    return this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async followUser(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowRepository(qr);

    await userFollowersRepository.save({
      follower: { id: followerId },
      followee: { id: followeeId },
    });

    return true;
  }

  async getFollowers(userId: number, includeNotConfirmed: boolean) {
    const where = { followee: { id: userId } };

    if (!includeNotConfirmed) {
      where['isConfirmed'] = true;
    }
    const result = await this.userFollowersRepository.find({
      where,
      relations: { follower: true, followee: true },
    });

    return result.map((x) => ({
      id: x.follower.id,
      nickname: x.follower.nickname,
      email: x.follower.email,
      isConfirmed: x.isConfirmed,
    }));
  }

  async confirmFollow(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ) {
    const userFollowersRepository = this.getUserFollowRepository(qr);

    const existing = await userFollowersRepository.findOne({
      where: {
        follower: { id: followerId },
        followee: { id: followeeId },
      },
      relations: { follower: true, followee: true },
    });

    if (!existing) {
      throw new BadRequestException('존재하지 않는 팔로우 요청입니다.');
    }

    await userFollowersRepository.save({ ...existing, isConfirmed: true });

    return true;
  }

  async deleteFollow(followerId: number, followee: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowRepository(qr);

    await userFollowersRepository.delete({
      follower: { id: followerId },
      followee: { id: followee },
    });

    return true;
  }

  async incrementFollowerCount(userId: number, qr?: QueryRunner) {
    const usersRepository = this.getUsersRepository(qr);

    await usersRepository.increment({ id: userId }, 'followerCount', 1);

    return true;
  }

  async decrementFollowerCount(userId: number, qr?: QueryRunner) {
    const usersRepository = this.getUsersRepository(qr);

    await usersRepository.decrement({ id: userId }, 'followerCount', 1);

    return true;
  }
}
