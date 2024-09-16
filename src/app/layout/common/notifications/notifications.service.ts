import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { DateTime } from 'luxon';
import { map, Observable, of, ReplaySubject, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationsService {

    private _notifications: ReplaySubject<Notification[]> = new ReplaySubject<Notification[]>(1);

    /* Get the current instant */
    now = DateTime.now();

    notificationsData = [
        {
            id: '493190c9-5b61-4912-afe5-78c21f1044d7',
            icon: 'heroicons_mini:star',
            title: 'Daily challenges',
            description: 'Your submission has been accepted',
            time: this.now.minus({ minute: 25 }).toISO(), // 25 minutes ago
            read: false,
        },
        {
            id: '6e3e97e5-effc-4fb7-b730-52a151f0b641',
            image: 'images/avatars/male-04.jpg',
            description:
                '<strong>Leo Gill</strong> added you to <em>Top Secret Project</em> group and assigned you as a <em>Project Manager</em>',
            time: this.now.minus({ minute: 50 }).toISO(), // 50 minutes ago
            read: true,
            link: '/dashboards/project',
            useRouter: true,
        },
        {
            id: 'b91ccb58-b06c-413b-b389-87010e03a120',
            icon: 'heroicons_mini:envelope',
            title: 'Mailbox',
            description: 'You have 15 unread mails across 3 mailboxes',
            time: this.now.minus({ hour: 3 }).toISO(), // 3 hours ago
            read: false,
            link: '/dashboards/project',
            useRouter: true,
        },
        {
            id: '541416c9-84a7-408a-8d74-27a43c38d797',
            icon: 'heroicons_mini:arrow-path',
            title: 'Cron jobs',
            description: 'Your <em>Docker container</em> is ready to publish',
            time: this.now.minus({ hour: 5 }).toISO(), // 5 hours ago
            read: false,
            link: '/dashboards/project',
            useRouter: true,
        },
        {
            id: 'ef7b95a7-8e8b-4616-9619-130d9533add9',
            image: 'images/avatars/male-06.jpg',
            description:
                '<strong>Roger Murray</strong> accepted your friend request',
            time: this.now.minus({ hour: 7 }).toISO(), // 7 hours ago
            read: true,
            link: '/dashboards/project',
            useRouter: true,
        },
        {
            id: 'eb8aa470-635e-461d-88e1-23d9ea2a5665',
            image: 'images/avatars/female-04.jpg',
            description: '<strong>Sophie Stone</strong> sent you a direct message',
            time: this.now.minus({ hour: 9 }).toISO(), // 9 hours ago
            read: true,
            link: '/dashboards/project',
            useRouter: true,
        },
        {
            id: 'b85c2338-cc98-4140-bbf8-c226ce4e395e',
            icon: 'heroicons_mini:envelope',
            title: 'Mailbox',
            description: 'You have 3 new mails',
            time: this.now.minus({ day: 1 }).toISO(), // 1 day ago
            read: true,
            link: '/dashboards/project',
            useRouter: true,
        },
        {
            id: '8f8e1bf9-4661-4939-9e43-390957b60f42',
            icon: 'heroicons_mini:star',
            title: 'Daily challenges',
            description:
                'Your submission has been accepted and you are ready to sign-up for the final assigment which will be ready in 2 days',
            time: this.now.minus({ day: 3 }).toISO(), // 3 days ago
            read: true,
            link: '/dashboards/project',
            useRouter: true,
        },
        {
            id: '30af917b-7a6a-45d1-822f-9e7ad7f8bf69',
            icon: 'heroicons_mini:arrow-path',
            title: 'Cron jobs',
            description: 'Your Vagrant container is ready to download',
            time: this.now.minus({ day: 4 }).toISO(), // 4 days ago
            read: true,
            link: '/dashboards/project',
            useRouter: true,
        },
    ];

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
        this.notifications = this.notificationsData;
        return of(this.notificationsData);
    }

    /**
     * Update the notification
     *
     * @param id
     * @param notification
     */
    update(id: string, notification: Notification): Observable<Notification> {
        return this.notifications$.pipe(
            take(1),
            switchMap((notifications) =>
                this._httpClient
                    .patch<Notification>('api/common/notifications', {
                        id,
                        notification,
                    })
                    .pipe(
                        map((updatedNotification: Notification) => {
                            // Find the index of the updated notification
                            const index = notifications.findIndex(
                                (item) => item.id === id
                            );

                            // Update the notification
                            notifications[index] = updatedNotification;

                            // Update the notifications
                            this._notifications.next(notifications);

                            // Return the updated notification
                            return updatedNotification;
                        })
                    )
            )
        );
    }

    /**
     * Delete the notification
     *
     * @param id
     */
    delete(id: string): Observable<boolean> {
        return this.notifications$.pipe(
            take(1),
            switchMap((notifications) =>
                this._httpClient
                    .delete<boolean>('api/common/notifications', {
                        params: { id },
                    })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted notification
                            const index = notifications.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the notification
                            notifications.splice(index, 1);

                            // Update the notifications
                            this._notifications.next(notifications);

                            // Return the deleted status
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
                            // Go through all notifications and set them as read
                            notifications.forEach((notification, index) => {
                                notifications[index].read = true;
                            });

                            // Update the notifications
                            this._notifications.next(notifications);

                            // Return the updated status
                            return isUpdated;
                        })
                    )
            )
        );
    }
}
