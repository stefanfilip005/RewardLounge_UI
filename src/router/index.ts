import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  {
    path: "/employee",
    name: "employee",
    component: () => import("../views/Employee.vue")
  },
  {
    path: "/ranking",
    name: "ranking",
    component: () => import("../views/Ranking.vue")
  },
  {
    path: "/demandtype",
    name: "demandtype",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "../views/DemandType.vue")
  },
  {
    path: "/faq",
    name: "faq",
    component: () => import("../views/FAQ.vue")
  },
  {
    path: "/team",
    name: "team",
    component: () => import("../views/Team.vue")
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
