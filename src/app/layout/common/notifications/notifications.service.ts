import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { env } from 'envs/env';
import { map, Observable, ReplaySubject, switchMap, take } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class NotificationsService {
    private _notifications: ReplaySubject<Notification[]> = new ReplaySubject<Notification[]>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    set notifications(value: Notification[]) {
        this._notifications.next(value);
    }

    /**
     * Getter for notifications
     */
    get notifications$(): Observable<Notification[]> {
        return this._notifications.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all notifications
     */
    getAll(): Observable<Notification[]> {
        const apiUrl = `${env.API_BASE_URL}/share/notifications`;

        return this._httpClient.get<{ data: Notification[] }>(apiUrl).pipe(
            map(response => {
                // Assuming the API response has a "data" field containing the notifications array
                const notifications = response.data;

                // Update the local notifications state
                this.notifications = notifications;

                // Return the notifications array
                return notifications;
            })
        );
    }


    /**
     * Update the notification
     *
     * @param id
     * @param notification
     */
    update(id: number, notification: Notification): Observable<Notification> {
        // Send the updated notification to the server without any additional processing
        return this._httpClient.patch<Notification>(`${env.API_BASE_URL}/share/notifications/${id}/read`, { read: notification.read });
    }

    /**
     * Delete the notification
     *
     * @param id
     */
    delete(id: number): Observable<boolean> {
        return this.notifications$.pipe(
            take(1),
            switchMap((notifications) =>
                this._httpClient
                    .delete<boolean>(`${env.API_BASE_URL}/share/notifications/${id}`, {
                        params: { id: id.toString() }, // Convert id to string for the request
                    })
                    .pipe(
                        map((isDeleted: boolean) => {
                            if (isDeleted) {
                                // Create a new array without the deleted notification
                                const updatedNotifications = notifications.filter(item => item.id !== id);

                                // Update the notifications observable
                                this._notifications.next(updatedNotifications);
                            }

                            return isDeleted;
                        })
                    )
            )
        );
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): Observable<boolean> {
        return this.notifications$.pipe(
            take(1),
            switchMap((notifications) =>
                this._httpClient
                    .get<boolean>('api/common/notifications/mark-all-as-read')
                    .pipe(
                        map((isUpdated: boolean) => {
                            if (isUpdated) {
                                // Create a new array with all notifications marked as read
                                const updatedNotifications = notifications.map(notification => ({
                                    ...notification,
                                    read: true,
                                }));

                                // Update the notifications observable
                                this._notifications.next(updatedNotifications);
                            }

                            return isUpdated;
                        })
                    )
            )
        );
    }
}
