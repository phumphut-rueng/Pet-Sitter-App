/**
 * Notification Socket Integration
 * 
 * จัดการ real-time notification updates ผ่าน Socket.IO
 */

import { Socket } from 'socket.io-client';

export interface NotificationSocketEvent {
  type: 'new_notification' | 'notification_update' | 'notification_delete';
  data: unknown;
}

type EventCallback = (data: unknown) => void;

export class NotificationSocketManager {
  private static instance: NotificationSocketManager;
  private socket: Socket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();

  private constructor() {}

  public static getInstance(): NotificationSocketManager {
    if (!NotificationSocketManager.instance) {
      NotificationSocketManager.instance = new NotificationSocketManager();
    }
    return NotificationSocketManager.instance;
  }

  public setSocket(socket: Socket) {
    this.socket = socket;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Listen for new notifications
    this.socket.on('new_notification', (data: unknown) => {
      this.emit('socket:new_notification', data);
    });

    // Listen for notification updates
    this.socket.on('notification_update', (data: unknown) => {
      this.emit('socket:notification_update', data);
    });

    // Listen for notification deletions
    this.socket.on('notification_delete', (data: unknown) => {
      this.emit('socket:notification_delete', data);
    });

    // Listen for notification count updates
    this.socket.on('notification_count_update', (data: unknown) => {
      this.emit('socket:notification_count_update', data);
    });

    // Listen for real-time notification refresh
    this.socket.on('notification_refresh', (data: unknown) => {
      this.emit('socket:notification_refresh', data);
    });
  }

  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: EventCallback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification event listener:', error);
        }
      });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

export const notificationSocket = NotificationSocketManager.getInstance();