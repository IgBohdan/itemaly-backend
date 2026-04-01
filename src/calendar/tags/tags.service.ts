import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { CreateTagDto, UpdateTagDto } from '../dto/tag.dto';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    private usersService: UsersService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getUserById(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async create(createTagDto: CreateTagDto, user: User): Promise<Tag> {
    const tag = this.tagsRepository.create({ ...createTagDto, user });
    const newTag = await this.tagsRepository.save(tag);
    await this.cacheManager.del(`all_tags_user_${user.id}`); // Invalidate cache
    return newTag;
  }

  async findAll(userId: number): Promise<Tag[]> {
    const cacheKey = `all_tags_user_${userId}`;
    const cachedTags = await this.cacheManager.get<Tag[]>(cacheKey);
    if (cachedTags) {
      return cachedTags;
    }
    const tags = await this.tagsRepository.find({
      where: { user: { id: userId } },
    });
    await this.cacheManager.set(cacheKey, tags, 300);
    return tags;
  }

  async findOne(id: number, userId: number): Promise<Tag> {
    const cacheKey = `tag_${id}_user_${userId}`;
    const cachedTag = await this.cacheManager.get<Tag>(cacheKey);
    if (cachedTag) {
      return cachedTag;
    }
    const tag = await this.tagsRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    await this.cacheManager.set(cacheKey, tag, 300);
    return tag;
  }

  async update(
    id: number,
    updateTagDto: UpdateTagDto,
    userId: number,
  ): Promise<Tag> {
    const tag = await this.findOne(id, userId);

    // Filter out undefined values
    const updateData: Partial<Tag> = {};
    if (updateTagDto.name !== undefined) updateData.name = updateTagDto.name;
    if (updateTagDto.color !== undefined) updateData.color = updateTagDto.color;

    Object.assign(tag, updateData);
    const updatedTag = await this.tagsRepository.save(tag);
    await this.cacheManager.del(`all_tags_user_${userId}`); // Invalidate cache
    await this.cacheManager.del(`tag_${id}_user_${userId}`); // Invalidate specific tag cache
    return updatedTag;
  }

  async remove(id: number, userId: number): Promise<void> {
    const result = await this.tagsRepository.delete({
      id,
      user: { id: userId },
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    await this.cacheManager.del(`all_tags_user_${userId}`); // Invalidate cache
    await this.cacheManager.del(`tag_${id}_user_${userId}`); // Invalidate specific tag cache
  }
}
