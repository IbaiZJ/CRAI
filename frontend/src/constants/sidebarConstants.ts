import {
  User,
  UserStar,
  CircleGauge,
  Siren,
  ChartBar,
  Cctv,
  Sparkles,
  Car
} from "lucide-react"

export const sidebarConfig = {
  teams: [
    {
      name: "CRAI Admin",
      logo: UserStar,
      plan: "Administrator",
    },
    {
      name: "CRAI Police",
      logo: Siren,
      plan: "Police",
    },
    {
      name: "CRAI Inc",
      logo: User,
      plan: "Enterprise",
    },
  ],
  nav: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: CircleGauge,
      isActive: true,
      navType: "button",
    },
    {
      title: "Statistics",
      url: "#",
      icon: ChartBar,
      navType: "collapsible",
      items: [
        { title: "General", url: "/statistics" },
        { title: "Cars", url: "/statistics/cars" },
        { title: "Users", url: "/statistics/users" },
        { title: "Cameras", url: "/statistics/cameras" },
        { title: "Simulations", url: "/statistics/simulations" },
      ],
    },
    {
      title: "Cars",
      url: "/cars",
      icon: Car,
      navType: "button",
    },
    {
      title: "Users",
      url: "/users",
      icon: User,
      navType: "button",
    },
    {
      title: "Cameras",
      url: "/cameras",
      icon: Cctv,
      navType: "button",
    },
    {
      title: "Simulations",
      url: "/simulations",
      icon: Sparkles,
      navType: "button",
    },
  ],
}