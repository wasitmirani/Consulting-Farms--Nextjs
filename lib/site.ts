/**
 * Single source of truth for business facts.
 *
 * Sources: public Instagram (@consulting_farms786), YouTube (@consultingfarms)
 * and contact details supplied by the business. Empty strings hide related UI.
 */
type Address = {
  office: string;
  area: string;
  city: string;
  country: string;
  countryCode: string;
  full: string;
};

type SiteConfig = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: Address;
  serviceArea: string;
  hours: string;
  social: { instagram: string; youtube: string };
};

const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+971554200786";

export const site: SiteConfig = {
  name: "Consulting Farms",
  legalName: "Consulting Farms FZ-LLC",
  tagline: "Mushroom farming & greenhouse consulting",
  description:
    "Consulting Farms grows fresh mushrooms and provides practical consulting in agriculture and greenhouse management — from grow-room setup to harvest, supply and training.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  // --- Contact channels ----------------------------------------------------
  phone,
  whatsapp: "971554200786", // digits only, international format (wa.me)
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "consultingfarms@gmail.com",
  address: {
    office: "Office 1205, Al Manara Tower",
    area: "Business Bay",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    full: "Consulting Farms FZ-LLC, Office 1205, Al Manara Tower, Business Bay, Dubai, UAE",
  },
  serviceArea: "",
  hours: "Monday – Friday, 9:00 AM – 5:00 PM",

  social: {
    instagram: "https://www.instagram.com/consulting_farms786/",
    youtube: "https://www.youtube.com/@consultingfarms",
  },
};

/** "+971554200786" → "+971 55 420 0786" for display. */
export const formatPhone = (p: string) =>
  p.replace(/^\+971(\d{2})(\d{3})(\d{4})$/, "+971 $1 $2 $3");

export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export const mapsLink = (a: Address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.office}, ${a.area}, ${a.city}`)}`;

export const whatsappLink = (message: string) =>
  site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
    : "";

export type Product = {
  slug: string;
  name: string;
  form: string;
  summary: string;
  audiences: string[];
  image: string;
  imageAlt: string;
};

/** Product range — CONFIRM with the business before launch. Photos are the farm's own. */
export const products: Product[] = [
  {
    slug: "button-mushrooms",
    name: "Button Mushrooms",
    form: "Fresh · White & brown",
    summary:
      "The everyday kitchen staple — firm white and brown caps, graded and packed in crates for retail and food service.",
    audiences: ["Retail", "Hotels", "Catering"],
    image: "/images/farm/mushroom-crates.jpg",
    imageAlt: "Crates of fresh white and brown button mushrooms",
  },
  {
    slug: "oyster-mushrooms",
    name: "Oyster Mushrooms",
    form: "Fresh",
    summary:
      "Delicate, fan-shaped clusters harvested straight from the grow bag for a tender bite and clean flavour.",
    audiences: ["Households", "Restaurants", "Retail"],
    image: "/images/farm/oyster-bags.jpg",
    imageAlt: "Grey oyster mushroom clusters growing from grow bags",
  },
  {
    slug: "specialty-mushrooms",
    name: "Specialty Mushrooms",
    form: "Fresh · Seasonal",
    summary:
      "Colourful and specialty varieties for chefs and curious cooks — availability changes with the season.",
    audiences: ["Restaurants", "Chefs", "Retail"],
    image: "/images/farm/specialty-oyster.jpg",
    imageAlt: "Golden, pink and grey specialty oyster mushrooms on grow bags",
  },
  {
    slug: "greenhouse-produce",
    name: "Greenhouse Greens",
    form: "Hydroponic & greenhouse",
    summary:
      "Fresh leafy greens grown on vertical hydroponic racks and in greenhouses — clean, crisp and consistent.",
    audiences: ["Retail", "Restaurants", "Households"],
    image: "/images/farm/vertical-lettuce.jpg",
    imageAlt: "Lettuce growing on vertical hydroponic racks",
  },
];

export type FacilityZone = {
  id: string;
  name: string;
  short: string;
  lead: string;
  happens: string[];
  manage: string[];
  color: string;
  image: string;
  imageAlt: string;
};

/** The farm's rooms, in the order a crop moves through them. */
export const facilityZones: FacilityZone[] = [
  {
    id: "planting",
    name: "Planting warehouse",
    short: "Substrate & spawning",
    lead: "Every crop starts here. The growing medium is mixed, moistened and filled into grow bags, then planted with mushroom spawn in a clean working area.",
    happens: [
      "Mixing and moistening the substrate",
      "Conditioning the substrate for a clean start",
      "Filling grow bags and blocks",
      "Spawning — planting mushroom spawn evenly through each bag",
    ],
    manage: ["Substrate moisture", "Clean / dirty area separation", "Equipment hygiene", "Batch labelling"],
    color: "#f0b65a",
    image: "/images/farm/substrate-straw.jpg",
    imageAlt: "Chopped straw substrate ready for mixing",
  },
  {
    id: "incubation",
    name: "Incubation room",
    short: "Colonisation",
    lead: "Spawned bags rest on racks in a dark, stable room while the mycelium grows through the substrate — you can watch the bags turn from brown to white.",
    happens: [
      "Bags stacked on multi-tier racks",
      "Mycelium colonises the substrate",
      "Regular checks for even growth",
      "Removing any contaminated bags early",
    ],
    manage: ["Stable temperature", "Darkness", "Gentle airflow", "Contamination checks"],
    color: "#b8e04a",
    image: "/images/farm/incubation-racks.jpg",
    imageAlt: "Spawned grow bags colonising on incubation racks",
  },
  {
    id: "grow",
    name: "Grow rooms",
    short: "Fruiting & harvest",
    lead: "Fully colonised bags move into the grow rooms. Humidity, fresh air and light signal the mushrooms to form — and they're harvested by hand at the right stage.",
    happens: [
      "Bags opened so mushrooms can form",
      "Misting to keep humidity up",
      "Hand-harvesting, often over several flushes",
      "Cleaning down rooms between crops",
    ],
    manage: ["Humidity", "Fresh-air exchange", "Light cycle", "Harvest timing"],
    color: "#4fbf7a",
    image: "/images/farm/grow-room-rack.jpg",
    imageAlt: "Button mushrooms fruiting on grow-room racks",
  },
  {
    id: "packing",
    name: "Packing & cold store",
    short: "Grading & dispatch",
    lead: "Harvested mushrooms are sorted, graded, weighed and packed, then held chilled until they leave the farm for customers.",
    happens: [
      "Sorting and grading by size and condition",
      "Weighing and packing to order",
      "Chilled storage before dispatch",
      "Loading for delivery or collection",
    ],
    manage: ["Gentle handling", "Grading standards", "Chilled holding", "Dispatch scheduling"],
    color: "#7cc4e8",
    image: "/images/farm/mushroom-crates.jpg",
    imageAlt: "Harvested mushrooms packed in crates",
  },
];

export const services = [
  {
    title: "Mushroom farm setup",
    body: "Site assessment, substrate planning and a realistic production schedule for new or expanding mushroom farms.",
    icon: "sprout",
    image: "/images/farm/grow-room-wide.jpg",
  },
  {
    title: "Grow-room design",
    body: "Room sizing, rack layout, misting, ventilation and lighting planned around the crop you want to grow.",
    icon: "rack",
    image: "/images/farm/grow-room-aisle.jpg",
  },
  {
    title: "Planting warehouse & substrate",
    body: "A clean workflow for mixing, bagging and spawning — with clean and dirty areas kept apart.",
    icon: "warehouse",
    image: "/images/farm/substrate-straw.jpg",
  },
  {
    title: "Greenhouse management",
    body: "Ventilation, shading, irrigation and hygiene routines that keep your greenhouse productive season after season.",
    icon: "greenhouse",
    image: "/images/farm/greenhouse-fans.jpg",
  },
  {
    title: "Hydroponic & vertical farming",
    body: "Vertical racks, LED lighting and nutrient systems for clean, high-density leafy greens indoors.",
    icon: "leaf",
    image: "/images/farm/vertical-farm.jpg",
  },
  {
    title: "Crop advisory & training",
    body: "On-farm visits and hands-on training to diagnose yield problems early and build your team's skills.",
    icon: "users",
    image: "/images/farm/inspection.jpg",
  },
] as const;

export const processSteps = [
  { title: "Substrate preparation", body: "Selecting and preparing the growing medium the crop will feed on.", zone: 0 },
  { title: "Hygiene controls", body: "Cleaning and conditioning to give the crop a clean start.", zone: 0 },
  { title: "Spawning", body: "Introducing mushroom spawn evenly through the substrate.", zone: 0 },
  { title: "Incubation", body: "Letting the mycelium colonise the substrate in stable conditions.", zone: 1 },
  { title: "Fruiting", body: "Adjusting humidity, air and light so mushrooms begin to form.", zone: 2 },
  { title: "Harvesting", body: "Picking by hand at the right stage of maturity.", zone: 2 },
  { title: "Sorting & quality checks", body: "Grading by size and condition; removing anything below standard.", zone: 3 },
  { title: "Packing & dispatch", body: "Packing for freshness and sending out to customers.", zone: 3 },
] as const;

export const faqs = [
  {
    q: "What does Consulting Farms do?",
    a: "We provide consulting services in agriculture and greenhouse management, with a focus on mushroom farming — helping growers set up, run and improve their farms — alongside supplying mushroom products.",
  },
  {
    q: "Do you accept wholesale orders?",
    a: "Yes, we welcome enquiries from restaurants, hotels, retailers and distributors. Send an enquiry with the product, approximate quantity and delivery area, and we will reply with current availability.",
  },
  {
    q: "How can I request current prices?",
    a: "Prices depend on variety, quantity and season, so we quote on request. Use the enquiry form and we will get back to you with an up-to-date quotation.",
  },
  {
    q: "Can you help me start my own mushroom farm?",
    a: "Yes. Our consulting covers site assessment, grow-room and greenhouse setup, substrate and spawn planning, and training for you and your staff.",
  },
  {
    q: "What is the difference between a grow room and a planting warehouse?",
    a: "The planting warehouse is where substrate is prepared, filled into grow bags and spawned. The bags then move to an incubation room to colonise, and finally into grow rooms, where humidity, fresh air and light trigger the mushrooms to form for harvest.",
  },
  {
    q: "Can you help design or manage a greenhouse?",
    a: "Yes. Greenhouse management is a core part of our consulting — including ventilation and shading, irrigation layout, air circulation, crop hygiene and day-to-day routines for your team.",
  },
  {
    q: "Can restaurants or retailers set up regular supply?",
    a: "We are happy to discuss recurring orders. Tell us your weekly or monthly requirement in the enquiry form so we can plan supply with you.",
  },
  {
    q: "How should fresh mushrooms be stored?",
    a: "Keep fresh mushrooms refrigerated in a breathable container such as a paper bag, avoid sealing them in plastic, and wash them just before cooking rather than before storing.",
  },
] as const;

export const enquiryTypes = [
  "Product enquiry",
  "Wholesale supply",
  "Restaurant / hotel supply",
  "Farm setup & consulting",
  "Greenhouse management",
  "Training",
  "Cost estimate (calculator)",
  "Other",
] as const;

/** Cost questions people search for — answered on /calculator (and summarised on home). */
export const costFaqs = [
  {
    q: "How much does it cost to set up a mushroom farm in the UAE?",
    a: "It depends mainly on grow-room floor area, the number of rack tiers, the level of climate control and the mushroom type. A small converted room with manual misting costs far less than an insulated, fully climate-controlled facility with its own planting warehouse and cold store. Use our cost calculator for an indicative range, then ask us for a quotation based on your site.",
  },
  {
    q: "How much does a greenhouse cost per square metre in the UAE?",
    a: "The three biggest drivers are the structure (poly tunnel, multi-span or glass), the cooling system and the growing system. Simple poly tunnels with natural ventilation are the most affordable; glass greenhouses with full climate control and hydroponics are the most expensive. The calculator shows how each choice changes the total for your area.",
  },
  {
    q: "Why is cooling so important for greenhouses in the UAE?",
    a: "Summer temperatures in the UAE are far above what most crops tolerate, so greenhouses usually need active cooling to keep producing through the hot months. Fan-and-pad evaporative cooling is the most common approach; full climate control adds more precise temperature, humidity and CO₂ management.",
  },
  {
    q: "Is the calculator result a quotation?",
    a: "No. The calculator gives an indicative planning range based on typical UAE setups. A real quotation depends on a site survey, your exact specification, power and water availability, and current supplier pricing — send us your estimate and we'll prepare one.",
  },
  {
    q: "What happens after I send my estimate?",
    a: "You'll receive a copy of your estimate by email, and our team will review it and contact you — usually within one working day — to discuss your plans, answer questions and arrange a consultation or site visit if needed.",
  },
] as const;
