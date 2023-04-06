export class Service {
    serviceId: string;
    title: string;
    description: string;
    imageUrl: string;
    addedOn: firebase.default.firestore.Timestamp;
    serviceStatus: boolean;
}
