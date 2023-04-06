import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Queries } from "src/app/classes/queries";
import { Slider } from "src/app/classes/slider";
import { Videos } from "src/app/classes/videos";
import * as util from "src/app/utils";
import { BehaviorSubject, Subscription } from "rxjs";
import { Service } from "../classes/service";
import { ImagesModel } from "../classes/images";
import { DomSanitizer } from "@angular/platform-browser";
import { Review } from "../classes/review";
import { Visa } from "../classes/visa";
import { Enqueries } from "../classes/enqueries";
import { Contactus } from "../classes/contactus";

@Injectable({
  providedIn: "root",
})
export class DbService {
  sliderSubject = new BehaviorSubject<Slider[]>(null);
  sliderRetrieved: boolean = false;

  contactSubject = new BehaviorSubject<Contactus[]>(null);
  contactRetrieved: boolean = false;

  gallerySubject = new BehaviorSubject<ImagesModel[]>(null);
  galleryRetrieved: boolean = false;

  videoSubject = new BehaviorSubject<Videos[]>(null);
  videoRetrieved: boolean = false;

  socialMediaLinkSubject = new BehaviorSubject<any>(null);
  socialMediaLinkRetrieved: boolean = false;

  addressSubject = new BehaviorSubject<any>(null);
  addressRetrieved: boolean = false;

  queriesSubject = new BehaviorSubject<Queries[]>(null);
  queriesRetrieved: boolean = false;

  enqueriesSubject = new BehaviorSubject<Enqueries[]>(null);
  enqueriesRetrieved: boolean = false;

  visaSubject = new BehaviorSubject<any[]>(null);
  visaRetrieved: boolean = false;

  reviewSubject = new BehaviorSubject<Review[]>(null);
  reviewRetrieved: boolean = false;

  servicesSubject = new BehaviorSubject<any[]>(null);
  servicesRetrieved: boolean = false;

  constructor(private dbRef: AngularFirestore, private sanitizer: DomSanitizer) {
    this.getContactDetails();
  }

  

  getServices() {
    if (!this.servicesRetrieved) {
      this.dbRef.collection(util.SERVICE_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: any[]) => {
          this.servicesRetrieved = true;
          this.servicesSubject.next(images);
        });
    }
  }

  getSliderImages() {
    if (!this.sliderRetrieved) {
      this.dbRef
        .collection(util.SLIDER_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: Slider[]) => {
          if (images != null) {
            this.sliderRetrieved = true;
            this.sliderSubject.next(images);
          }
        });
    }
  }

  getVisa() {
    if (!this.visaRetrieved) {
      this.dbRef
        .collection(util.VISA_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: Visa[]) => {
          if (images != null) {
            this.visaRetrieved = true;
            this.visaSubject.next(images);
          }
        });
    }
  }

  getGalleryImages() {
    if (!this.galleryRetrieved) {
      this.dbRef
        .collection(util.GALLERY_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: ImagesModel[]) => {
          if (images != null) {
            this.galleryRetrieved = true;
            this.gallerySubject.next(images);
          }
        });
    }
  }




  getContactDetails() {
    if (!this.contactRetrieved) {
      this.dbRef
        .collection(util.CONTACT_COLLECTION)
        .valueChanges()
        .subscribe((images: Contactus[]) => {
          this.contactRetrieved = true;
          this.contactSubject.next(images.map(e => ({
            ...e as Contactus,
            urlSafe: this.sanitizer.bypassSecurityTrustResourceUrl(e.mapLink)
          })));
        });
    }
  }

  getVideos() {
    if (!this.videoRetrieved) {
      this.dbRef
        .collection(util.VIDEO_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((videos: Videos[]) => {
          if (videos != null) {
            this.videoRetrieved = true;
            this.videoSubject.next(videos);
          }
        });
    }
  }

  getSocialMediaLinks() {
    if (!this.socialMediaLinkRetrieved) {
      this.dbRef
        .collection(util.SOCIALLINKS_COLLECTION)
        .doc(util.SOCIALLINKS_COLLECTION)
        .valueChanges()
        .subscribe((quote: any) => {
          // console.log(">>> quote", quote);

          if (quote != null) {
            this.socialMediaLinkRetrieved = true;
            this.socialMediaLinkSubject.next(quote);
          }
        });
    }
  }

  getAddress() {
    if (!this.addressRetrieved) {
      this.dbRef
        .collection(util.ADDRESS_COLLECTION)
        .doc(util.ADDRESS_COLLECTION)
        .valueChanges()
        .subscribe((quote: any) => {
          // console.log(">>> quote", quote);

          if (quote != null) {
            this.addressRetrieved = true;
            this.addressSubject.next(quote);
          }
        });
    }
  }

  getQueries() {
    if (!this.queriesRetrieved) {
      this.dbRef
        .collection(util.QUERIES_COLLECTION, (ref) =>
          ref.orderBy("date", "desc")
        )
        .valueChanges()
        .subscribe((queries: Queries[]) => {
          if (queries != null) {
            this.queriesRetrieved = true;
            this.queriesSubject.next(queries);
            console.log(queries)
          }
        });
    }
  }

  getEnqueries() {
    if (!this.enqueriesRetrieved) {
      this.dbRef
        .collection(util.ENQUERIES_COLLECTION, (ref) =>
          ref.orderBy("date","desc")
        )
        .valueChanges()
        .subscribe((enqueries: any) => {
          if (enqueries != null) {
            this.enqueriesRetrieved = true;
            this.enqueriesSubject.next(enqueries);
            console.log(enqueries)
          }
        });
    }
  }

  getReviews() {
    if (!this.reviewRetrieved) {
      this.dbRef
        .collection(util.REVIEW_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((list: Review[]) => {
          if (list != null) {
            this.reviewRetrieved = true;
            this.reviewSubject.next(list);
          }
        });
    }
  }



}
