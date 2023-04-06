import firebase from 'firebase/app'

export class Videos {
    videoId: string;
    videoTitle: string;
    videoDescription: string;
    videoUrl: string;
    addedOn: firebase.firestore.Timestamp;
    active: boolean;
}
