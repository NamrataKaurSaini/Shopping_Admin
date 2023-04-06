export class ImagesModel {
    imageId: string;
    title: string;
    description: string;
    imageUrl: string;
    addedOn: firebase.default.firestore.Timestamp;
    galleryStatus: boolean;
}
