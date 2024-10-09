import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { env } from 'envs/env';
import { map, Observable, ReplaySubject, switchMap, take } from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
    private _notifications: ReplaySubject<Notification[]> = new ReplaySubject<Notification[]>(1);
    private _socket: any;
    private _user: User;
    private _notificationsCache: Notification[] = []; // Local cache of notifications

    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {
        // Subscribe to user changes
        this._userService.user$.subscribe((user: User) => {
            this._user = user;
        });
    }

    // Observable for notifications
    get notifications$(): Observable<Notification[]> {
        return this._notifications.asObservable();
    }

    // Set notifications (updates both cache and ReplaySubject)
    set notifications(value: Notification[]) {
        this._notificationsCache = value;
        this._notifications.next(value);
    }

    // Connect to the WebSocket server
    connect(): void {
        this._socket = io.connect(env.SOCKET_URL + '/notifications-getway', {
            transports: ['websocket']
        });

        // On successful connection, register the user
        this._socket.on('connect', () => {
            this.register();
        });

        // Listen for new order notifications via WebSocket
        this._socket.on('new-order-notification', (data: { data: Notification[] }) => {
            const newNotifications = data.data;
            // Append new notifications to the existing cache and update the subject
            this._notificationsCache = [...newNotifications];
            this._notifications.next(this._notificationsCache);
        });

        // Listen for individual notification updates
        this._socket.on('notification-update', (data: { data: Notification[] }) => {
            const updatedNotifications = data.data;
            this._notificationsCache = [...updatedNotifications];
            this._notifications.next(this._notificationsCache);
        });

        // Handle disconnection
        this._socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        // Handle connection errors
        this._socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }

    // Register the user with the WebSocket server
    register(): void {
        if (this._user && this._user.id) {
            this._socket?.emit('register', this._user.id);
        } else {
            console.error('User ID not found for registration');
        }
    }

    // Disconnect the WebSocket
    disconnect(): void {
        if (this._socket) {
            this._socket.disconnect();
        }
    }

    // Fetch all notifications from API
    getAll(): Observable<Notification[]> {
        const apiUrl = `${env.API_BASE_URL}/share/notifications`;

        return this._httpClient.get<{ data: Notification[] }>(apiUrl).pipe(
            map(response => {
                const notifications = response.data;
                this.notifications = notifications; // Update local cache and subject
                return notifications;
            })
        );
    }

    // Mark all notifications as read
    markAllAsRead(): Observable<boolean> {
        return this.notifications$.pipe(
            take(1),
            switchMap((notifications) =>
                this._httpClient.get<boolean>('api/common/notifications/mark-all-as-read').pipe(
                    map((isUpdated: boolean) => {
                        if (isUpdated) {
                            const updatedNotifications = notifications.map(notification => ({
                                ...notification,
                                read: true,
                            }));
                            this._notificationsCache = updatedNotifications;
                            this._notifications.next(updatedNotifications);
                        }
                        return isUpdated;
                    })
                )
            )
        );
    }

    /**
     * Update a notification
     *
     * @param id
     * @param notification
     */
    update(id: number, notification: Notification): Observable<Notification> {
        return this._httpClient.patch<Notification>(`${env.API_BASE_URL}/share/notifications/${id}/read`, { read: notification.read });
    }

    /**
     * Delete a notification
     *
     * @param id
     */
    delete(id: number): Observable<boolean> {
        return this.notifications$.pipe(
            take(1),
            switchMap((notifications) =>
                this._httpClient
                    .delete<boolean>(`${env.API_BASE_URL}/share/notifications/${id}`, {
                        params: { id: id.toString() },
                    })
                    .pipe(
                        map((isDeleted: boolean) => {
                            if (isDeleted) {
                                // Remove the deleted notification from the cache
                                const updatedNotifications = notifications.filter(item => item.id !== id);
                                this._notifications.next(updatedNotifications);
                            }
                            return isDeleted;
                        })
                    )
            )
        );
    }
}
