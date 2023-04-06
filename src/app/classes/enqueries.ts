import firebase from 'firebase/app';

export class Enqueries {
    name: string;
    phone: string;
    email: string;
    // enquery: string;
    enqueryId: string;
    date: firebase.firestore.Timestamp;
}
