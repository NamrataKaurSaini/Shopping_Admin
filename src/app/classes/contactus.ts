export class Contactus {
    contactId: string;
    title: string
    phone: string;
    address: string;
    city:string;
    email:string;
    imageUrl: string;
    addedOn: firebase.default.firestore.Timestamp;
    contactStatus: boolean;
    mapLink: string;
}
