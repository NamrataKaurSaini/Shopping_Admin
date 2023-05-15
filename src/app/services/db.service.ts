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
import { menbottomwear } from "../classes/menbottomwear";
import { mentopwear } from "../classes/mentopwear";
import { menindianwear } from "../classes/menindianwear";
import { menfootwear } from "../classes/menfootwear";
import { menaccessorize } from "../classes/menaccessorize";
import { womenwesternwear } from "../classes/womenwesternwear";
import { womenaccessorize } from "../classes/womenaccessorize";
import { womenfootwear } from "../classes/womenfootwear";
import { womenindianwear } from "../classes/womenindianwear";
import { homedecor } from "../classes/homedecor";
import { category } from "../classes/category";

@Injectable({
  providedIn: "root",
})
export class DbService {
  sliderSubject = new BehaviorSubject<Slider[]>(null);
  sliderRetrieved: boolean = false;

  categorySubject = new BehaviorSubject<category[]>(null);
  categoryRetrieved: boolean = false;

  menbottomwearSubject = new BehaviorSubject<menbottomwear[]>(null);
  menbottomwearRetrieved: boolean = false;

  mentopwearSubject = new BehaviorSubject<mentopwear[]>(null);
  mentopwearRetrieved: boolean = false;

  menindianwearSubject = new BehaviorSubject<menindianwear[]>(null);
  menindianwearRetrieved: boolean = false;
  
  menfootwearSubject = new BehaviorSubject<menfootwear[]>(null);
  menfootwearRetrieved: boolean = false;

  menaccessorizeSubject = new BehaviorSubject<menaccessorize[]>(null);
  menaccessorizeRetrieved: boolean = false;
  
  womenwesternwearSubject = new BehaviorSubject<womenwesternwear[]>(null);
  womenwesternwearRetrieved: boolean = false;

  womenindianwearSubject = new BehaviorSubject<womenindianwear[]>(null);
  womenindianwearRetrieved: boolean = false;
  
  womenfootwearSubject = new BehaviorSubject<womenfootwear[]>(null);
  womenfootwearRetrieved: boolean = false;

  womenaccessorizeSubject = new BehaviorSubject<womenaccessorize[]>(null);
  womenaccessorizeRetrieved: boolean = false;

  homedecorSubject = new BehaviorSubject<homedecor[]>(null);
  homedecorRetrieved: boolean = false;

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
  getCategory() {
    if (!this.categoryRetrieved) {
      this.dbRef
        .collection(util.CATEGORY_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: category[]) => {
          if (images != null) {
            this.categoryRetrieved = true;
            this.categorySubject.next(images);
          }
        });
    }
  }

  getMenbottomwear() {
    if (!this.menbottomwearRetrieved) {
      this.dbRef
        .collection(util.MENBOTTOMWEAR_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: menbottomwear[]) => {
          if (images != null) {
            this.menbottomwearRetrieved = true;
            this.menbottomwearSubject.next(images);
          }
        });
    }
  }
  getMentopwear() {
    if (!this.mentopwearRetrieved) {
      this.dbRef
        .collection(util.MENTOPWEAR_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: mentopwear[]) => {
          if (images != null) {
            this.mentopwearRetrieved = true;
            this.mentopwearSubject.next(images);
          }
        });
    }
  }
  getMenindianwear() {
    if (!this.menindianwearRetrieved) {
      this.dbRef
        .collection(util.MENINDIANWEAR_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: menindianwear[]) => {
          if (images != null) {
            this.menindianwearRetrieved = true;
            this.menindianwearSubject.next(images);
          }
        });
    }
  }
  getMenfootwear() {
    if (!this.menfootwearRetrieved) {
      this.dbRef
        .collection(util.MENFOOTWEAR_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: menfootwear[]) => {
          if (images != null) {
            this.menfootwearRetrieved = true;
            this.menfootwearSubject.next(images);
          }
        });
    }
  }
  getMenaccessorize() {
    if (!this.menaccessorizeRetrieved) {
      this.dbRef
        .collection(util.MENACCESSORIZE_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: menaccessorize[]) => {
          if (images != null) {
            this.menaccessorizeRetrieved = true;
            this.menaccessorizeSubject.next(images);
          }
        });
    }
  }

  getWomenwesternwear() {
    if (!this.menbottomwearRetrieved) {
      this.dbRef
        .collection(util.WOMENWESTERNWEAR_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: womenwesternwear[]) => {
          if (images != null) {
            this.womenwesternwearRetrieved = true;
            this.womenwesternwearSubject.next(images);
          }
        });
    }
  }
  getWomenindianwear() {
    if (!this.womenindianwearRetrieved) {
      this.dbRef
        .collection(util.WOMENINDIANWEAR_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: womenindianwear[]) => {
          if (images != null) {
            this.womenindianwearRetrieved = true;
            this.womenindianwearSubject.next(images);
          }
        });
    }
  }
  getWomenfootwear() {
    if (!this.womenfootwearRetrieved) {
      this.dbRef
        .collection(util.WOMENFOOTWEAR_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: womenfootwear[]) => {
          if (images != null) {
            this.womenfootwearRetrieved = true;
            this.womenfootwearSubject.next(images);
          }
        });
    }
  }
  getWomenaccessorize() {
    if (!this.womenaccessorizeRetrieved) {
      this.dbRef
        .collection(util.WOMENACCESSORIZE_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: womenaccessorize[]) => {
          if (images != null) {
            this.womenaccessorizeRetrieved = true;
            this.womenaccessorizeSubject.next(images);
          }
        });
    }
  }
  getHomedecor() {
    if (!this.homedecorRetrieved) {
      this.dbRef
        .collection(util.HOMEDECOR_COLLECTION, (ref) =>
          ref.orderBy("addedOn", "desc")
        )
        .valueChanges()
        .subscribe((images: homedecor[]) => {
          if (images != null) {
            this.homedecorRetrieved = true;
            this.homedecorSubject.next(images);
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
