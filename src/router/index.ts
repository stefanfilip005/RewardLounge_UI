import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import DiensteView from "../views/DiensteView.vue";
import ProdukteView from "../views/ProdukteView.vue";
import StatistikView from "../views/StatistikView.vue";
import MitarbeiterView from "../views/MitarbeiterView.vue";
import CartView from "../views/CartView.vue";
import OrdersView from "../views/OrdersView.vue";
import TeamView from "../views/TeamView.vue";
import FAQView from "../views/FAQView.vue";
import DFView from "../views/DFView.vue";

import AdministrationView from "../views/AdministrationView.vue";

import LogoutView from "../views/LogoutView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  {
    path: "/dienste",
    name: "dienste",
    component: DiensteView
  },
  {
    path: "/produkte",
    name: "produkte",
    component: ProdukteView
  },
  {
    path: "/statistik",
    name: "statistik",
    component: StatistikView
  },
  {
    path: "/mitarbeiter",
    name: "mitarbeiter",
    component: MitarbeiterView
  },
  {
    path: "/administration",
    name: "administration",
    component: AdministrationView
  },
  {
    path: "/cart",
    name: "cart",
    component: CartView
  },
  {
    path: "/team",
    name: "team",
    component: TeamView
  },
  {
    path: "/faq",
    name: "faq",
    component: FAQView
  },
  {
    path: "/bestellungen",
    name: "bestellungen",
    component: OrdersView
  },
  {
    path: "/dienstfuehrer",
    name: "dienstfuehrer",
    component: DFView
  },
  {
    path: "/logout",
    name: "logout",
    component: LogoutView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
