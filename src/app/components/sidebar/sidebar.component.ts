import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  children: RouteInfo[];
}

export const ROUTES: RouteInfo[] = [
  { 
    path: "", title: "Multimedia", icon: "", class: "",
    children: [
      { path: "/sliders", title: "Slider", icon: "web_stories", class: "", children: [] },
      { path: "/images", title: "Images", icon: "photo_library", class: "", children: [] },
      { path: "/videos", title: "Videos", icon: "video_library", class:"", children: [] }
    ],
  },
  { 
    path: "", title: "Communication", icon: "", class: "",
    children: [
      { path: "/queries", title: "Queries", icon: "query_builder", class: "", children: [] },
      { path: "/enqueries", title: "Enqueries", icon: "book_online", class: "", children: [] }

    ],
  },
  { 
    path: "", title: "Courses", icon: "", class: "",
    children: [
      // { path: "/courses", title: "Courses", icon: "book_online", class: "", children: [] },
      { path: "/services", title: "Services", icon: "support", class: "", children: [] },
      { path: "/visa", title: "Visa", icon: "description", class: "", children: [] }
    ],
  },
  {
    path: "", title: "About", icon: "", class: "", 
    children: [
      { path: "/reviews", title: "Reviews", icon: "group", class: "", children: [] },
      { path: "/social-media", title: "Social Media Links", icon: "connect_without_contact", class: "", children: [] },
      { path: "/address", title: "Contact Us", icon: "contacts", class: "", children: [] }
    ],
  },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router, public authSerive: AuthService) {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
  }
}
