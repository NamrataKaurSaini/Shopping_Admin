export class Review {
    reviewId: string;
    title: string;
    description: string;
    imageUrl: string;
    addedOn: firebase.default.firestore.Timestamp;
    reviewStatus: boolean;
}
