/**
 * NotificationSocket - Centralized socket event handler for notifications
 * 
 * Handles:
 * - Socket.IO server events in multiple formats
 * - Socket.IO events and window events support
 * - Fallback for when Socket.IO is not working
 */

import { io, Socket } from 'socket.io-client';

type EventCallback = (data?: unknown) => void;

class NotificationSocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Connect to Socket.IO server directly
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://pet-sitter-socket-server-production.up.railway.app';
    
    try {
      this.socket = io(socketServerUrl, {
        transports: ['websocket', 'polling'],
        reconnectionDelay: 1000,
        reconnection: true,
        reconnectionAttempts: 5
      });

      // Listen to Socket.IO events
      this.socket.on('notification_refresh', (data: unknown) => {
        this.emit('socket:notification_refresh', data);
        this.emit('update:notification_count', data);
      });

      this.socket.on('notification_count_update', (data: unknown) => {
        this.emit('socket:notification_count_update', data);
        this.emit('update:notification_count', data);
      });

      // Connection status handlers
      this.socket.on('connect', () => {
        // Connected
      });

      this.socket.on('disconnect', () => {
        // Disconnected
      });

    } catch (error) {
      console.error('Failed to initialize NotificationSocket:', error);
    }

    // Listen to Window events as fallback
    this.setupWindowEventListeners();
  }

  private setupWindowEventListeners() {
    // Capture events from window as fallback
    const events = [
      'socket:notification_refresh',
      'update:notification_count',
      'notification_created',
      'socket:notification_count_update'
    ];

    events.forEach(eventName => {
      window.addEventListener(eventName, (event: Event) => {
        // Forward event to listeners
        this.emit(eventName, (event as CustomEvent).detail);
      });
    });
  }

  // Subscribe to events
  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // Unsubscribe from events
  off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  // Emit events to all listeners
  private emit(event: string, data?: unknown) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Force refresh notifications
  triggerRefresh(userId?: number) {
    this.emit('socket:notification_refresh', { userId });
    this.emit('update:notification_count', { userId });
  }

  // Public method to emit events
  publicEmit(event: string, data?: unknown) {
    this.emit(event, data);
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const notificationSocket = new NotificationSocketManager();

// Export hook for React components
export function useNotificationSocket() {
  return notificationSocket;
}
