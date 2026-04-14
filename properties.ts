import { Property } from './types';

export const PROPERTY_LISTINGS: Property[] = [
  {
    id: "prop001",
    title: "Greenview Residences",
    type: "2BHK Apartment",
    location: "Andheri West, Mumbai",
    price: "₹1.2 Crores",
    bedrooms: 2,
    bathrooms: 2,
    area: "1250 sq.ft",
    description: "Premium 2BHK apartment in the heart of Andheri West. Modern amenities with excellent connectivity to metro station and Western Express Highway.",
    amenities: ["Swimming Pool", "Gym", "Children's Play Area", "Clubhouse", "24/7 Security", "Power Backup", "Rainwater Harvesting", "Parking"],
    builder: "Prestige Group",
    possession: "Ready to Move"
  },
  {
    id: "prop002",
    title: "Sunrise Villas",
    type: "3BHK Villa",
    location: "Powai, Mumbai",
    price: "₹2.5 Crores",
    bedrooms: 3,
    bathrooms: 3,
    area: "2400 sq.ft",
    description: "Luxurious 3BHK villa with private garden. Gated community with premium amenities and excellent neighborhood near Hiranandani Gardens.",
    amenities: ["Private Garden", "Swimming Pool", "Gym", "Clubhouse", "24/7 Security", "Power Backup", "Jogging Track", "Parking", "Community Hall"],
    builder: "Brigade Group",
    possession: "6 Months"
  },
  {
    id: "prop003",
    title: "Skyline Heights",
    type: "1BHK Apartment",
    location: "Thane, Mumbai",
    price: "₹75 Lakhs",
    bedrooms: 1,
    bathrooms: 1,
    area: "650 sq.ft",
    description: "Compact 1BHK perfect for young professionals. Close to Thane railway station and Ghodbunder Road. Great investment option.",
    amenities: ["Gym", "Community Hall", "24/7 Security", "Power Backup", "Parking"],
    builder: "Sobha Limited",
    possession: "Ready to Move"
  },
  {
    id: "prop004",
    title: "Royal Garden Apartments",
    type: "3BHK Apartment",
    location: "Bandra West, Mumbai",
    price: "₹2.8 Crores",
    bedrooms: 3,
    bathrooms: 2,
    area: "1800 sq.ft",
    description: "Spacious 3BHK in prime Bandra West location. Premium finish with modern amenities. Excellent neighborhood with schools and hospitals nearby.",
    amenities: ["Swimming Pool", "Gym", "Children's Play Area", "Clubhouse", "24/7 Security", "Power Backup", "Rainwater Harvesting", "Parking", "Landscape Garden"],
    builder: "Godrej Properties",
    possession: "3 Months"
  },
  {
    id: "prop005",
    title: "Lakeside Meadows",
    type: "4BHK Villa",
    location: "Juhu, Mumbai",
    price: "₹5.5 Crores",
    bedrooms: 4,
    bathrooms: 4,
    area: "3500 sq.ft",
    description: "Luxurious 4BHK villa with sea view. Premium gated community with world-class amenities. Perfect for families looking for luxury living near the beach.",
    amenities: ["Private Garden", "Swimming Pool", "Gym", "Spa", "Clubhouse", "24/7 Security", "Power Backup", "Jogging Track", "Parking", "Community Hall", "Tennis Court", "Indoor Games"],
    builder: "Puravankara",
    possession: "1 Year"
  },
  {
    id: "prop006",
    title: "Urban Heights",
    type: "2BHK Apartment",
    location: "Lower Parel, Mumbai",
    price: "₹1.8 Crores",
    bedrooms: 2,
    bathrooms: 2,
    area: "1100 sq.ft",
    description: "Modern 2BHK in upscale Lower Parel. Walking distance to metro, restaurants, and shopping. Perfect for urban professionals.",
    amenities: ["Gym", "Community Hall", "24/7 Security", "Power Backup", "Parking", "Rooftop Garden"],
    builder: "Total Environment",
    possession: "Ready to Move"
  }
];

export function getPropertyById(id: string): Property | undefined {
  return PROPERTY_LISTINGS.find(prop => prop.id === id);
}

export function searchProperties(query: string): Property[] {
  const lowerQuery = query.toLowerCase();
  return PROPERTY_LISTINGS.filter(prop => 
    prop.title.toLowerCase().includes(lowerQuery) ||
    prop.location.toLowerCase().includes(lowerQuery) ||
    prop.type.toLowerCase().includes(lowerQuery) ||
    prop.description.toLowerCase().includes(lowerQuery)
  );
}
