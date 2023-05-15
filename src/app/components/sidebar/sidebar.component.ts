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
    path: "", title: "Men", icon: "", class: "",
    children: [
      { path: "/men-topwear",title: "Men-Topwear", icon: "store", class: "", children: [] },
      { path: "/men-bottomwear", title: "Men-Bottomwear", icon: "shopping_bag", class: "", children: [] },
      { path: "/men-indianwear", title: "Men-Indianwear", icon: "credit_card", class:"", children: [] },
      { path: "/men-footwear", title: "Men-Footwear", icon: "local_mall", class:"", children: [] },
      { path: "/men-accessorize", title: "Men-Accessorize", icon: "store", class:"", children: [] }

    ],
  },
  { 
    path: "", title: "Women", icon: "", class: "",
    children: [
      { path: "/women-westernwear", title: "Women-Westernwear", icon: "credit_card", class: "", children: [] },
      { path: "/women-indianwear", title: "Women-Indianwear", icon: "store", class: "", children: [] },
      { path: "/women-footwear", title: "Women-Footwear", icon: "local_mall", class: "", children: [] },
      { path: "/women-accessorize", title: "Women-Accessorize", icon: "shopping_bag", class: "", children: [] }


    ],
  },
  { 
    path: "", title: "Home & Living", icon: "", class: "",
    children: [
      // { path: "/visa", title: "Visas", icon: "book_online", class: "", children: [] },
      { path: "/homedecor", title: "Homedecor", icon: "other_houses", class: "", children: [] },
      
    ],
  },
  {
    path: "", title: "About", icon: "", class: "", 
    children: [
      { path: "/category", title: "Category List", icon: "category", class: "", children: [] },
      { path: "/queries", title: "Queries", icon: "description", class: "", children: [] },
      // { path: "/reviews", title: "Reviews", icon: "group", class: "", children: [] },
      { path: "/social-media", title: "Social Media Links", icon: "connect_without_contact", class: "", children: [] },
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
