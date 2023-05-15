import firebase from 'firebase/app';

export class Queries {
    name: string;
    // phone: string;
    email: string;
    query: string;
    queryId: string;
    date: firebase.firestore.Timestamp;
}
