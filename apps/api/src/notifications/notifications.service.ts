import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { Device, DeviceDocument } from './schemas/device.schema';
import {
  CreateNotificationDto,
  ListNotificationsQueryDto,
  RegisterDeviceDto,
} from './dto/notification.dto';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly notifModel: Model<NotificationDocument>,
    @InjectModel(Device.name) private readonly deviceModel: Model<DeviceDocument>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationDocument> {
    // Phase 5.x will dispatch this to FCM via BullMQ; for now just persist.
    return this.notifModel.create({ ...dto, status: 'sent', deliveredAt: new Date() });
  }

  async listForUser(userId: string, query: ListNotificationsQueryDto) {
    const filter: FilterQuery<NotificationDocument> = { userId };
    if (query.status) filter.status = query.status;
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);

    const [data, total, unread] = await Promise.all([
      this.notifModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec() as unknown as Promise<NotificationDocument[]>,
      this.notifModel.countDocuments(filter).exec(),
      this.notifModel
        .countDocuments({ userId, status: { $in: ['queued', 'sent', 'delivered'] } })
        .exec(),
    ]);
    return {
      data,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      unread,
    };
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.notifModel
      .updateOne(
        { _id: id, userId },
        { $set: { status: 'read', readAt: new Date() } },
      )
      .exec();
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const res = await this.notifModel
      .updateMany(
        { userId, status: { $in: ['queued', 'sent', 'delivered'] } },
        { $set: { status: 'read', readAt: new Date() } },
      )
      .exec();
    return { updated: res.modifiedCount };
  }

  async registerDevice(userId: string, dto: RegisterDeviceDto): Promise<DeviceDocument> {
    return this.deviceModel
      .findOneAndUpdate(
        { expoPushToken: dto.expoPushToken },
        {
          $set: {
            userId,
            platform: dto.platform,
            appVersion: dto.appVersion,
            osVersion: dto.osVersion,
            lastSeenAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec() as unknown as DeviceDocument;
  }

  async unregisterDevice(userId: string, tokenHash: string): Promise<{ ok: true }> {
    await this.deviceModel
      .deleteOne({ userId, expoPushToken: tokenHash })
      .exec();
    return { ok: true };
  }
}
