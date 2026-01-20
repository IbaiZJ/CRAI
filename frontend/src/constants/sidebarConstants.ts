import {
  User,
  UserStar,
  CircleGauge,
  Siren,
  ChartBar,
  Cctv,
  Car,
  Scan
} from "lucide-react"

export const sidebarConfig = {
  teams: [
    {
      name: "CRAI Admin",
      logo: "https://media.canva.com/v2/image-resize/format:PNG/height:695/quality:100/uri:ifs%3A%2F%2FM%2F66f53d45-acf6-4172-9275-9172e3d1ccf5/watermark:F/width:769?csig=AAAAAAAAAAAAAAAAAAAAAC176ApFXTY5fojiRowO6aMOh_y539CTOtjLbNRMSH9u&exp=1768914278&osig=AAAAAAAAAAAAAAAAAAAAAHk2SjQysTn48Sdc9a6qk6pKbELgcP62t4bsgZhJYWbQ&signer=media-rpc&x-canva-quality=screen",
      plan: "Administrator",
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
      title: "Detecciones",
      url: "/detections",
      icon: Scan,
      navType: "button",
    },
  ],
}