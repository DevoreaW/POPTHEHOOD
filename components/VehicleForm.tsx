import React, { useState, useRef, useEffect } from 'react';
import { VehicleInfo, DiagnosticInput, DiagnosticReport, TireAnalysisReport } from '../types';
import CameraCapture from './CameraCapture';

interface VehicleFormProps {
  onDiagnose: (vehicle: VehicleInfo, input: DiagnosticInput) => void;
  onTireScan: (imageData: string, mimeType: string) => void;
  onFindServices: (type: 'mechanic' | 'towing') => void;
  isLoading: boolean;
  history: (DiagnosticReport | TireAnalysisReport)[];
  onHistorySelect: (item: DiagnosticReport | TireAnalysisReport) => void;
  onHistoryClear: () => void;
  prefill?: { description: string; vehicle: VehicleInfo } | null;
  onPrefillUsed?: () => void;
}

const POPULAR_MAKES = ["BMW", "Chevrolet", "Ford", "Honda", "Hyundai", "Jeep", "Nissan", "Ram", "Toyota", "Volkswagen"];

const ALL_MAKES = [
  "Acura", "AM General", "American LaFrance", "Aston Martin", "Audi", "Autocar LLC", "Bentley",
  "Blue Bird", "BMW", "Bugatti", "Buick", "Cadillac", "Capacity Of Texas", "Caterpillar",
  "Chevrolet", "Chrysler", "Crane Carrier", "Dodge", "El Dorado", "Emergency One", "Evobus",
  "Ferrara", "Ferrari", "Ford", "Freightliner", "Gillig", "GMC", "Hendrickson", "Hino",
  "Honda", "Hyundai", "IC Corporation", "INFINITI", "International", "Isuzu", "Jaguar",
  "Jeep", "Kalmar", "Kenworth", "Kia", "Kovatch", "Lamborghini", "Land Rover", "Lexus",
  "Lincoln", "Lotus", "Mack", "Maserati", "Maybach", "Mazda", "Mercedes-Benz", "Mercury",
  "Mini", "Mitsubishi", "Mitsubishi Fuso", "Motor Coach Industries", "Nissan", "Nova Bus Corporation",
  "Orion Bus", "Oshkosh Motor Truck Co.", "Peterbilt", "Pierce Mfg. Inc.", "Porsche", "Prevost",
  "Ram", "Roadmaster Rail", "Rolls-Royce", "Saab", "Scion", "Smart", "Spartan Motors",
  "Spyker", "Subaru", "Suzuki", "Temsa Bus", "Terex", "Tesla", "Think", "Thomas",
  "Toyota", "UD", "Van Hool", "Volkswagen", "Volvo"
];

const CAR_MODELS: Record<string, string[]> = {
  "Acura": ["ILX", "MDX", "RDX", "RLX", "TLX", "NSX", "ZDX"],
  "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "TT", "R8", "e-tron"],
  "BMW": ["2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "M3", "M4", "M5", "Z4", "i3", "i4", "iX"],
  "Bentley": ["Bentayga", "Continental GT", "Flying Spur", "Mulsanne"],
  "Buick": ["Enclave", "Encore", "Envision", "LaCrosse", "Regal", "Verano"],
  "Cadillac": ["CT4", "CT5", "Escalade", "XT4", "XT5", "XT6", "Lyriq"],
  "Chevrolet": ["Blazer", "Camaro", "Colorado", "Corvette", "Equinox", "Malibu", "Silverado 1500", "Silverado 2500", "Silverado 3500", "Suburban", "Tahoe", "Traverse", "Trax", "Bolt EV"],
  "Chrysler": ["300", "Pacifica", "Voyager"],
  "Dodge": ["Challenger", "Charger", "Durango", "Grand Caravan", "Journey", "Ram 1500"],
  "Ferrari": ["488", "812", "F8", "Roma", "SF90", "Portofino"],
  "Ford": ["Bronco", "Bronco Sport", "Edge", "Escape", "Expedition", "Explorer", "F-150", "F-250", "F-350", "Maverick", "Mustang", "Mustang Mach-E", "Ranger", "Transit"],
  "GMC": ["Acadia", "Canyon", "Envoy", "Sierra 1500", "Sierra 2500", "Sierra 3500", "Terrain", "Yukon", "Yukon XL"],
  "Honda": ["Accord", "Civic", "CR-V", "Fit", "HR-V", "Insight", "Odyssey", "Passport", "Pilot", "Ridgeline", "Prologue"],
  "Hyundai": ["Elantra", "Ioniq", "Ioniq 5", "Ioniq 6", "Kona", "Palisade", "Santa Cruz", "Santa Fe", "Sonata", "Tucson", "Veloster"],
  "INFINITI": ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"],
  "Isuzu": ["D-Max", "MU-X", "NPR", "NQR"],
  "Jaguar": ["E-Pace", "F-Pace", "F-Type", "I-Pace", "XE", "XF", "XJ"],
  "Jeep": ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Grand Wagoneer", "Renegade", "Wagoneer", "Wrangler"],
  "Kia": ["Carnival", "EV6", "Forte", "K5", "Niro", "Seltos", "Sorento", "Soul", "Sportage", "Stinger", "Telluride"],
  "Lamborghini": ["Aventador", "Huracan", "Urus"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
  "Lexus": ["ES", "GS", "GX", "IS", "LC", "LS", "LX", "NX", "RC", "RX", "UX"],
  "Lincoln": ["Aviator", "Corsair", "MKZ", "Nautilus", "Navigator"],
  "Maserati": ["Ghibli", "GranTurismo", "Grecale", "Levante", "Quattroporte"],
  "Mazda": ["CX-3", "CX-30", "CX-5", "CX-9", "CX-50", "Mazda3", "Mazda6", "MX-5 Miata", "MX-30"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "AMG GT", "EQS", "EQE"],
  "Mini": ["Clubman", "Convertible", "Countryman", "Hardtop", "Paceman"],
  "Mitsubishi": ["Eclipse Cross", "Galant", "Outlander", "Outlander Sport"],
  "Nissan": ["Altima", "Armada", "Frontier", "GT-R", "Kicks", "Leaf", "Maxima", "Murano", "Pathfinder", "Rogue", "Rogue Sport", "Sentra", "Titan", "Versa", "Z"],
  "Porsche": ["718", "911", "Cayenne", "Macan", "Panamera", "Taycan"],
  "Ram": ["1500", "2500", "3500", "ProMaster", "ProMaster City"],
  "Rolls-Royce": ["Cullinan", "Dawn", "Ghost", "Phantom", "Wraith"],
  "Saab": ["9-3", "9-5"],
  "Scion": ["FR-S", "iA", "iM", "tC", "xB", "xD"],
  "Subaru": ["Ascent", "BRZ", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "WRX", "Solterra"],
  "Suzuki": ["Equator", "Grand Vitara", "Kizashi", "SX4"],
  "Tesla": ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck"],
  "Toyota": ["4Runner", "Avalon", "Camry", "Corolla", "Crown", "GR86", "Highlander", "Land Cruiser", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra", "Venza", "bZ4X"],
  "Volkswagen": ["Arteon", "Atlas", "Atlas Cross Sport", "Golf", "ID.4", "Jetta", "Passat", "Taos", "Tiguan"],
  "Volvo": ["C40", "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
};

const CAR_TRIMS: Record<string, string[]> = {
  // Acura
  "Acura|ILX": ["Premium", "Technology", "A-Spec", "A-Spec Technology"],
  "Acura|MDX": ["Base", "Technology", "SH-AWD Technology", "Type S", "Type S Advance"],
  "Acura|RDX": ["Base", "Technology", "A-Spec", "Advance", "A-Spec Advance"],
  "Acura|RLX": ["Base", "Technology", "Sport Hybrid", "Sport Hybrid Advance"],
  "Acura|TLX": ["Base", "Technology", "A-Spec Technology", "Type S", "Type S PMC Edition"],
  "Acura|NSX": ["Base", "Type S"],
  "Acura|ZDX": ["A-Spec", "Type S"],
  // Audi
  "Audi|A3": ["Premium", "Premium Plus", "Prestige", "S3 Premium", "S3 Premium Plus"],
  "Audi|A4": ["Premium", "Premium Plus", "Prestige", "S4 Premium", "S4 Premium Plus", "S4 Prestige"],
  "Audi|A5": ["Premium", "Premium Plus", "Prestige", "S5 Premium", "S5 Premium Plus", "S5 Prestige"],
  "Audi|A6": ["Premium", "Premium Plus", "Prestige", "S6 Premium Plus", "S6 Prestige"],
  "Audi|A7": ["Premium", "Premium Plus", "Prestige", "S7 Premium Plus", "S7 Prestige"],
  "Audi|A8": ["Base", "L", "L 60 TFSI e", "S8"],
  "Audi|Q3": ["Premium", "Premium Plus", "Prestige", "S line Premium", "S line Premium Plus"],
  "Audi|Q5": ["Premium", "Premium Plus", "Prestige", "SQ5 Premium", "SQ5 Premium Plus", "SQ5 Prestige"],
  "Audi|Q7": ["Premium", "Premium Plus", "Prestige", "SQ7 Premium Plus", "SQ7 Prestige"],
  "Audi|Q8": ["Premium", "Premium Plus", "Prestige", "SQ8 Premium Plus", "SQ8 Prestige", "RS Q8 Premium Plus"],
  "Audi|TT": ["Coupe", "Roadster", "TTS Coupe", "TTS Roadster", "TT RS"],
  "Audi|R8": ["V10", "V10 Performance", "V10 Spyder", "V10 Performance Spyder"],
  "Audi|e-tron": ["Premium", "Premium Plus", "Prestige", "Sportback Premium", "Sportback Premium Plus", "Sportback Prestige"],
  // BMW
  "BMW|2 Series": ["228i xDrive Gran Coupe", "M235i xDrive Gran Coupe", "M2", "M2 Competition"],
  "BMW|3 Series": ["330i", "330i xDrive", "330e", "330e xDrive", "M340i", "M340i xDrive"],
  "BMW|4 Series": ["430i", "430i xDrive", "430i Gran Coupe", "M440i", "M440i xDrive", "M4", "M4 Competition", "M4 CS"],
  "BMW|5 Series": ["530i", "530i xDrive", "540i", "540i xDrive", "M550i xDrive", "M5", "M5 Competition", "M5 CS"],
  "BMW|7 Series": ["740i", "740i xDrive", "750i xDrive", "760i xDrive", "M760i xDrive"],
  "BMW|8 Series": ["840i", "840i xDrive", "M850i xDrive", "M8", "M8 Competition"],
  "BMW|X1": ["sDrive28i", "xDrive28i", "M35i xDrive"],
  "BMW|X2": ["sDrive28i", "xDrive28i", "M35i"],
  "BMW|X3": ["sDrive30i", "xDrive30i", "xDrive30e", "M40i", "M"],
  "BMW|X4": ["xDrive30i", "M40i", "M"],
  "BMW|X5": ["sDrive40i", "xDrive40i", "xDrive45e", "M50i", "M", "M Competition"],
  "BMW|X6": ["sDrive40i", "xDrive40i", "M50i", "M", "M Competition"],
  "BMW|X7": ["xDrive40i", "xDrive50i", "M60i", "Alpina XB7"],
  "BMW|M3": ["Base", "Competition", "Competition xDrive", "CS"],
  "BMW|M4": ["Base", "Competition", "Competition xDrive", "CSL"],
  "BMW|M5": ["Base", "Competition", "CS"],
  "BMW|Z4": ["sDrive30i", "M40i"],
  "BMW|i3": ["Base", "s"],
  "BMW|i4": ["eDrive35", "eDrive40", "M50", "xDrive40"],
  "BMW|iX": ["xDrive40", "xDrive50", "M60"],
  // Bentley
  "Bentley|Bentayga": ["Base", "V8", "V8 S", "Hybrid", "Speed", "EWB Mulliner"],
  "Bentley|Continental GT": ["V8", "V8 S", "W12", "Speed", "Mulliner"],
  "Bentley|Flying Spur": ["Base", "V8", "V8 S", "W12", "Speed", "Mulliner"],
  "Bentley|Mulsanne": ["Base", "Speed", "Extended Wheelbase"],
  // Buick
  "Buick|Enclave": ["Preferred", "Essence", "Premium", "Avenir"],
  "Buick|Encore": ["Preferred", "Essence", "Sport Touring", "Preferred II"],
  "Buick|Envision": ["Preferred", "Essence", "Premium", "Avenir"],
  "Buick|LaCrosse": ["Base", "Preferred", "Essence", "Premium", "Avenir"],
  "Buick|Regal": ["Preferred", "Preferred II", "Essence", "GS"],
  "Buick|Verano": ["Base", "Leather", "Convenience", "Premium"],
  // Cadillac
  "Cadillac|CT4": ["Luxury", "Premium Luxury", "Sport", "V-Series", "V-Series Blackwing"],
  "Cadillac|CT5": ["Luxury", "Premium Luxury", "Sport", "Platinum", "V-Series", "V-Series Blackwing"],
  "Cadillac|Escalade": ["Luxury", "Premium Luxury", "Sport", "Platinum", "ESV Luxury", "ESV Premium Luxury", "ESV Sport", "ESV Platinum"],
  "Cadillac|XT4": ["Luxury", "Premium Luxury", "Sport"],
  "Cadillac|XT5": ["Luxury", "Premium Luxury", "Sport", "Platinum"],
  "Cadillac|XT6": ["Luxury", "Premium Luxury", "Sport", "Platinum"],
  "Cadillac|Lyriq": ["Luxury", "Sport", "Tech"],
  // Chevrolet
  "Chevrolet|Blazer": ["L", "LT", "RS", "Premier", "SS"],
  "Chevrolet|Camaro": ["LS", "LT", "LT1", "SS", "SS 1LE", "ZL1", "ZL1 1LE"],
  "Chevrolet|Colorado": ["WT", "LT", "Z71", "Trail Boss", "ZR2", "Bison"],
  "Chevrolet|Corvette": ["Stingray 1LT", "Stingray 2LT", "Stingray 3LT", "Grand Sport", "Z06", "ZR1", "E-Ray"],
  "Chevrolet|Equinox": ["LS", "LT", "RS", "Premier"],
  "Chevrolet|Malibu": ["L", "LS", "RS", "LT", "Premier"],
  "Chevrolet|Silverado 1500": ["WT", "Custom", "Custom Trail Boss", "LT", "LT Trail Boss", "RST", "LTZ", "High Country", "ZR2"],
  "Chevrolet|Silverado 2500": ["WT", "Custom", "LT", "LTZ", "High Country"],
  "Chevrolet|Silverado 3500": ["WT", "Custom", "LT", "LTZ", "High Country"],
  "Chevrolet|Suburban": ["LS", "LT", "RST", "Premier", "High Country", "Z71"],
  "Chevrolet|Tahoe": ["LS", "LT", "RST", "Premier", "High Country", "Z71"],
  "Chevrolet|Traverse": ["LS", "LT", "RS", "Premier", "High Country"],
  "Chevrolet|Trax": ["LS", "LT", "ACTIV", "RS", "Premier"],
  "Chevrolet|Bolt EV": ["LT", "Premier"],
  // Chrysler
  "Chrysler|300": ["Touring", "Touring L", "300S", "300C", "300C Platinum"],
  "Chrysler|Pacifica": ["Touring", "Touring L", "Touring L Plus", "Limited", "Pinnacle", "Hybrid Touring", "Hybrid Touring L", "Hybrid Limited", "Hybrid Pinnacle"],
  "Chrysler|Voyager": ["LX", "LXi"],
  // Dodge
  "Dodge|Challenger": ["SXT", "GT", "R/T", "R/T Scat Pack", "R/T Scat Pack Widebody", "SRT 392", "SRT Hellcat", "SRT Hellcat Widebody", "SRT Hellcat Redeye", "SRT Super Stock", "SRT Demon"],
  "Dodge|Charger": ["SXT", "GT", "R/T", "R/T Scat Pack", "Scat Pack Widebody", "SRT 392", "SRT Hellcat", "SRT Hellcat Widebody", "SRT Hellcat Redeye", "Daytona R/T", "Daytona Scat Pack"],
  "Dodge|Durango": ["SXT", "GT", "R/T", "Citadel", "SRT 392", "SRT Hellcat"],
  "Dodge|Grand Caravan": ["GT", "SXT", "SE"],
  "Dodge|Journey": ["SE", "SXT", "Crossroad", "GT"],
  "Dodge|Ram 1500": ["Tradesman", "Big Horn", "Lone Star", "Laramie", "Rebel", "Limited", "TRX"],
  // Ferrari
  "Ferrari|488": ["GTB", "Spider", "Pista", "Pista Spider"],
  "Ferrari|812": ["Superfast", "GTS", "Competizione", "Competizione A"],
  "Ferrari|F8": ["Tributo", "Spider"],
  "Ferrari|Roma": ["Base", "Spider"],
  "Ferrari|SF90": ["Stradale", "Spider", "XX", "XX Spider"],
  "Ferrari|Portofino": ["Base", "M"],
  // Ford
  "Ford|Bronco": ["Base", "Big Bend", "Black Diamond", "Outer Banks", "Badlands", "Wildtrak", "Everglades", "Raptor", "Heritage Edition", "First Edition"],
  "Ford|Bronco Sport": ["Base", "Big Bend", "Outer Banks", "Badlands", "Heritage Edition", "First Edition"],
  "Ford|Edge": ["SE", "SEL", "ST", "ST-Line", "Titanium"],
  "Ford|Escape": ["S", "SE", "SE Sport", "SEL", "Titanium", "Plug-In Hybrid SE", "Plug-In Hybrid SEL", "Plug-In Hybrid Titanium"],
  "Ford|Expedition": ["XL", "XLT", "Limited", "Timberline", "Platinum", "King Ranch", "MAX XL", "MAX XLT", "MAX Limited", "MAX Platinum", "MAX King Ranch"],
  "Ford|Explorer": ["Base", "XLT", "ST", "Timberline", "Limited", "Platinum", "King Ranch", "ST-Line"],
  "Ford|F-150": ["Regular Cab XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited", "Raptor", "Tremor", "Lightning Standard Range", "Lightning Extended Range", "Lightning Platinum"],
  "Ford|F-250": ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited", "Tremor"],
  "Ford|F-350": ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited", "Tremor"],
  "Ford|Maverick": ["XL", "XLT", "Lariat", "Tremor"],
  "Ford|Mustang": ["EcoBoost", "EcoBoost Premium", "GT", "GT Premium", "Mach 1", "Mach 1 Premium", "Shelby GT350", "Shelby GT350R", "Shelby GT500", "Dark Horse"],
  "Ford|Mustang Mach-E": ["Select", "Premium", "California Route 1", "GT", "GT Performance Edition"],
  "Ford|Ranger": ["XL", "XLT", "Lariat", "Tremor", "Raptor"],
  "Ford|Transit": ["XL Cargo", "XL Passenger", "XLT Passenger", "Limited Passenger"],
  // GMC
  "GMC|Acadia": ["SL", "SLE", "SLT", "AT4", "Denali"],
  "GMC|Canyon": ["Elevation", "AT4", "Denali", "AT4X", "AT4X AEV Edition"],
  "GMC|Envoy": ["SL", "SLE", "SLT", "Denali"],
  "GMC|Sierra 1500": ["Regular Cab Pro", "SLE", "SLT", "AT4", "Denali", "AT4X", "Denali Ultimate"],
  "GMC|Sierra 2500": ["Regular Cab Pro", "SLE", "SLT", "AT4", "Denali"],
  "GMC|Sierra 3500": ["Regular Cab Pro", "SLE", "SLT", "AT4", "Denali"],
  "GMC|Terrain": ["SL", "SLE", "SLT", "AT4", "Denali"],
  "GMC|Yukon": ["SLE", "SLT", "AT4", "Denali", "Denali Ultimate"],
  "GMC|Yukon XL": ["SLE", "SLT", "AT4", "Denali", "Denali Ultimate"],
  // Honda
  "Honda|Accord": ["LX", "Sport", "EX", "EX-L", "Sport-L", "Touring", "Hybrid Sport", "Hybrid EX-L", "Hybrid Sport-L", "Hybrid Touring"],
  "Honda|Civic": ["LX", "Sport", "EX", "EX-L", "Touring", "Si", "Type R"],
  "Honda|CR-V": ["LX", "EX", "EX-L", "Touring", "Sport", "Sport Touring", "Hybrid Sport", "Hybrid EX-L", "Hybrid Sport-L", "Hybrid Touring"],
  "Honda|Fit": ["LX", "Sport", "EX", "EX-L"],
  "Honda|HR-V": ["LX", "Sport", "EX", "EX-L"],
  "Honda|Insight": ["LX", "EX", "Touring"],
  "Honda|Odyssey": ["LX", "EX", "EX-L", "Touring", "Elite"],
  "Honda|Passport": ["Sport", "EX-L", "TrailSport", "Elite"],
  "Honda|Pilot": ["Sport", "EX-L", "TrailSport", "Elite", "Black Edition", "Touring"],
  "Honda|Ridgeline": ["Sport", "RTL", "RTL-E", "TrailSport", "Black Edition"],
  "Honda|Prologue": ["EX-L", "Touring", "Elite"],
  // Hyundai
  "Hyundai|Elantra": ["SE", "SEL", "N Line", "Limited", "N"],
  "Hyundai|Ioniq": ["Blue", "SEL", "Limited"],
  "Hyundai|Ioniq 5": ["SE Standard Range", "SE", "SEL", "Limited", "N Line", "XRT"],
  "Hyundai|Ioniq 6": ["SE Standard Range", "SE", "SEL", "Limited"],
  "Hyundai|Kona": ["SE", "SEL", "N Line", "Limited", "Electric SE", "Electric SEL", "Electric Limited"],
  "Hyundai|Palisade": ["SE", "SEL", "Limited", "Calligraphy"],
  "Hyundai|Santa Cruz": ["SE", "SEL", "SEL Premium", "Limited"],
  "Hyundai|Santa Fe": ["SE", "SEL", "XRT", "Limited", "Calligraphy", "Hybrid SEL", "Hybrid SEL Premium", "Hybrid Limited", "Hybrid Calligraphy", "PHEV SEL Premium", "PHEV Limited"],
  "Hyundai|Sonata": ["SE", "SEL", "SEL Plus", "N Line", "Limited"],
  "Hyundai|Tucson": ["SE", "SEL", "N Line", "XRT", "Limited", "Hybrid Blue", "Hybrid SEL", "Hybrid N Line", "Hybrid XRT", "Hybrid Limited", "PHEV SE", "PHEV SEL", "PHEV N Line", "PHEV Limited"],
  "Hyundai|Veloster": ["Base", "Premium", "Turbo", "Turbo Premium", "Turbo Ultimate", "N"],
  // INFINITI
  "INFINITI|Q50": ["Pure", "Luxe", "Sensory", "Red Sport 400", "Black S"],
  "INFINITI|Q60": ["Pure", "Luxe", "Sensory", "Red Sport 400"],
  "INFINITI|QX50": ["Pure", "Luxe", "Sensory", "Autograph"],
  "INFINITI|QX55": ["Pure", "Luxe", "Sensory", "Autograph"],
  "INFINITI|QX60": ["Pure", "Luxe", "Sensory", "Autograph"],
  "INFINITI|QX80": ["Base", "Luxe", "Sensory", "Premium Select", "Autograph"],
  // Isuzu
  "Isuzu|D-Max": ["S", "L", "V-Cross"],
  "Isuzu|MU-X": ["LS-A", "LS-T", "LS-U"],
  "Isuzu|NPR": ["Gas", "Diesel", "HD Gas", "HD Diesel"],
  "Isuzu|NQR": ["Base"],
  // Jaguar
  "Jaguar|E-Pace": ["S", "SE", "R-Dynamic S", "R-Dynamic SE", "R-Dynamic HSE", "HSE"],
  "Jaguar|F-Pace": ["S", "SE", "R-Dynamic S", "R-Dynamic SE", "R-Dynamic HSE", "HSE", "SVR", "P400e SE", "P400e HSE"],
  "Jaguar|F-Type": ["Base", "R-Dynamic", "R", "R75", "SVR"],
  "Jaguar|I-Pace": ["S", "SE", "HSE", "First Edition"],
  "Jaguar|XE": ["S", "SE", "R-Dynamic SE", "R-Dynamic HSE", "HSE"],
  "Jaguar|XF": ["S", "SE", "R-Dynamic SE", "R-Dynamic HSE", "HSE"],
  "Jaguar|XJ": ["Base", "Premium", "Portfolio", "Supersport"],
  // Jeep
  "Jeep|Cherokee": ["Sport", "Latitude", "Latitude Lux", "Altitude", "Limited", "Trailhawk", "Overland"],
  "Jeep|Compass": ["Sport", "Latitude", "Latitude Lux", "Altitude", "Limited", "Trailhawk"],
  "Jeep|Gladiator": ["Sport", "Sport S", "Willys Sport", "Willys", "Texas Trail", "Altitude", "Mojave", "High Altitude", "Overland", "Rubicon", "Farout"],
  "Jeep|Grand Cherokee": ["Laredo", "Altitude", "Limited", "Limited X", "Trailhawk", "Overland", "Summit", "Summit Reserve", "SRT", "Trackhawk", "4xe", "L Laredo", "L Limited", "L Overland", "L Summit", "L Summit Reserve"],
  "Jeep|Grand Wagoneer": ["Series I", "Series II", "Series III", "Obsidian"],
  "Jeep|Renegade": ["Sport", "Latitude", "Altitude", "Limited", "Trailhawk"],
  "Jeep|Wagoneer": ["Series I", "Series II", "Series III"],
  "Jeep|Wrangler": ["Sport", "Sport S", "Islander", "Willys Sport", "Willys", "Altitude", "Freedom", "Sahara", "Sahara Altitude", "Rubicon", "Rubicon 392", "4xe Sport", "4xe Sahara", "4xe Rubicon"],
  // Kia
  "Kia|Carnival": ["LX", "LX+", "EX", "SX", "SX Prestige"],
  "Kia|EV6": ["Light RWD", "Wind RWD", "Wind AWD", "GT-Line RWD", "GT-Line AWD", "GT AWD"],
  "Kia|Forte": ["FE", "LXS", "GT-Line", "GT", "GT Manual"],
  "Kia|K5": ["LXS", "EX", "GT-Line", "GT"],
  "Kia|Niro": ["LX", "EX", "SX", "SX Touring", "EV Wind", "EV Wave", "EV EX", "EV SX Prestige", "Plug-In EX", "Plug-In SX Touring"],
  "Kia|Seltos": ["LX", "S", "EX", "SX", "SX Turbo", "X-Line"],
  "Kia|Sorento": ["LX", "S", "EX", "SX", "SX Prestige", "X-Line", "X-Pro", "Plug-In Hybrid SX", "Plug-In Hybrid SX Prestige", "Hybrid LX", "Hybrid EX", "Hybrid SX", "Hybrid SX Prestige"],
  "Kia|Soul": ["LX", "S", "GT-Line", "EX", "Turbo"],
  "Kia|Sportage": ["LX", "EX", "SX Turbo", "X-Line", "X-Pro", "Plug-In Hybrid EX", "Plug-In Hybrid SX", "Hybrid LX", "Hybrid EX", "Hybrid SX"],
  "Kia|Stinger": ["GT-Line", "GT1", "GT2", "GT Elite"],
  "Kia|Telluride": ["LX", "S", "EX", "SX", "X-Line", "X-Pro", "SX Prestige", "X-Pro Prestige"],
  // Lamborghini
  "Lamborghini|Aventador": ["S", "S Roadster", "SVJ", "SVJ Roadster", "LP 780-4 Ultimae"],
  "Lamborghini|Huracan": ["EVO", "EVO Spyder", "EVO RWD", "EVO RWD Spyder", "STO", "Sterrato", "Tecnica"],
  "Lamborghini|Urus": ["Base", "Pearl Capsule", "S", "Performante"],
  // Land Rover
  "Land Rover|Defender": ["90 S", "90 SE", "90 X", "90 V8", "110 S", "110 SE", "110 X", "110 V8", "130 SE", "130 X", "130 Outbound"],
  "Land Rover|Discovery": ["S", "SE", "HSE", "HSE Luxury", "First Edition"],
  "Land Rover|Discovery Sport": ["S", "SE", "HSE", "R-Dynamic S", "R-Dynamic SE", "R-Dynamic HSE"],
  "Land Rover|Range Rover": ["SE", "HSE", "Autobiography", "SV", "First Edition", "Long Wheelbase SE", "Long Wheelbase Autobiography"],
  "Land Rover|Range Rover Evoque": ["S", "SE", "R-Dynamic SE", "R-Dynamic HSE", "HSE", "Autobiography"],
  "Land Rover|Range Rover Sport": ["S", "SE", "Dynamic SE", "HSE", "HSE Dynamic", "Autobiography", "SVR"],
  "Land Rover|Range Rover Velar": ["S", "SE", "R-Dynamic SE", "R-Dynamic HSE", "HSE"],
  // Lexus
  "Lexus|ES": ["ES 250", "ES 300h", "ES 350", "ES 350 F Sport", "ES 300h F Sport"],
  "Lexus|GS": ["GS 200t", "GS 300", "GS 350", "GS 350 AWD", "GS 450h", "GS F"],
  "Lexus|GX": ["GX 460", "GX 460 Premium", "GX 460 Luxury", "GX 460 Black Line"],
  "Lexus|IS": ["IS 300", "IS 300 AWD", "IS 350", "IS 350 AWD", "IS 500 F Sport Performance"],
  "Lexus|LC": ["LC 500", "LC 500h", "LC 500 Convertible"],
  "Lexus|LS": ["LS 500", "LS 500 AWD", "LS 500h", "LS 500h AWD", "LS 500 F Sport"],
  "Lexus|LX": ["LX 600", "LX 600 Premium", "LX 600 Luxury", "LX 600 F Sport", "LX 600 Ultra Luxury"],
  "Lexus|NX": ["NX 250", "NX 350", "NX 350h", "NX 450h+", "NX 350 F Sport", "NX 350h F Sport", "NX 350 Overtrail"],
  "Lexus|RC": ["RC 300", "RC 300 AWD", "RC 350", "RC 350 AWD", "RC F", "RC F Track Edition"],
  "Lexus|RX": ["RX 350", "RX 350 AWD", "RX 350h", "RX 450h", "RX 450h+", "RX 500h F Sport", "RX 350 Premium", "RX 350 Luxury"],
  "Lexus|UX": ["UX 200", "UX 250h", "UX 200 F Sport", "UX 250h F Sport"],
  // Lincoln
  "Lincoln|Aviator": ["Standard", "Reserve", "Black Label", "Grand Touring", "Grand Touring Reserve", "Grand Touring Black Label"],
  "Lincoln|Corsair": ["Standard", "Reserve", "Grand Touring", "Black Label"],
  "Lincoln|MKZ": ["Premiere", "Select", "Reserve", "Black Label"],
  "Lincoln|Nautilus": ["Standard", "Reserve", "Black Label"],
  "Lincoln|Navigator": ["Standard", "Reserve", "Black Label", "L Standard", "L Reserve", "L Black Label"],
  // Maserati
  "Maserati|Ghibli": ["S Q4", "S", "GT", "Trofeo", "Hybrid GT", "Hybrid Modena"],
  "Maserati|GranTurismo": ["Modena", "Trofeo", "Folgore"],
  "Maserati|Grecale": ["GT", "Modena", "Trofeo", "Folgore"],
  "Maserati|Levante": ["S", "GTS", "GT", "Modena", "Trofeo"],
  "Maserati|Quattroporte": ["S", "GTS", "GT", "Trofeo", "Royale"],
  // Mazda
  "Mazda|CX-3": ["Sport", "Touring", "Grand Touring"],
  "Mazda|CX-30": ["S", "Select", "Preferred", "Premium", "Turbo", "Turbo Premium Plus"],
  "Mazda|CX-5": ["Sport", "Touring", "Grand Touring", "Grand Touring Reserve", "Signature", "Carbon Edition"],
  "Mazda|CX-9": ["Sport", "Touring", "Grand Touring", "Grand Touring Reserve", "Signature", "Carbon Edition"],
  "Mazda|CX-50": ["Select", "Select Plus", "Preferred", "Preferred Plus", "Premium", "Premium Plus", "Meridian Edition"],
  "Mazda|Mazda3": ["Select", "Preferred", "Premium", "Premium Plus", "2.5 Turbo", "2.5 Turbo Premium", "2.5 Turbo Premium Plus"],
  "Mazda|Mazda6": ["Sport", "Touring", "Grand Touring", "Grand Touring Reserve", "Signature"],
  "Mazda|MX-5 Miata": ["Sport", "Club", "Grand Touring", "RF Club", "RF Grand Touring"],
  "Mazda|MX-30": ["Select", "Premium Plus"],
  // Mercedes-Benz
  "Mercedes-Benz|A-Class": ["A 220", "A 220 4MATIC", "AMG A 35"],
  "Mercedes-Benz|C-Class": ["C 300", "C 300 4MATIC", "AMG C 43", "AMG C 43 4MATIC", "AMG C 63", "AMG C 63 S E Performance"],
  "Mercedes-Benz|E-Class": ["E 350", "E 350 4MATIC", "E 450", "E 450 4MATIC", "AMG E 53", "AMG E 63 S"],
  "Mercedes-Benz|S-Class": ["S 500", "S 580", "S 580 4MATIC", "AMG S 63", "Maybach S 580", "Maybach S 680"],
  "Mercedes-Benz|G-Class": ["G 550", "AMG G 63"],
  "Mercedes-Benz|GLA": ["GLA 250", "GLA 250 4MATIC", "AMG GLA 35", "AMG GLA 45 S"],
  "Mercedes-Benz|GLB": ["GLB 250", "GLB 250 4MATIC", "AMG GLB 35"],
  "Mercedes-Benz|GLC": ["GLC 300", "GLC 300 4MATIC", "AMG GLC 43", "AMG GLC 63 S E Performance"],
  "Mercedes-Benz|GLE": ["GLE 350", "GLE 350 4MATIC", "GLE 450", "GLE 450 4MATIC", "GLE 580 4MATIC", "AMG GLE 53", "AMG GLE 63 S"],
  "Mercedes-Benz|GLS": ["GLS 450", "GLS 580", "AMG GLS 63", "Maybach GLS 600"],
  "Mercedes-Benz|AMG GT": ["AMG GT", "AMG GT S", "AMG GT R", "AMG GT R Pro", "AMG GT Black Series", "AMG GT 43", "AMG GT 53", "AMG GT 63", "AMG GT 63 S"],
  "Mercedes-Benz|EQS": ["EQS 450+", "EQS 450 4MATIC", "EQS 580 4MATIC", "AMG EQS 53"],
  "Mercedes-Benz|EQE": ["EQE 350+", "EQE 350 4MATIC", "EQE 500 4MATIC", "AMG EQE 43", "AMG EQE 53"],
  // Mini
  "Mini|Clubman": ["Cooper", "Cooper S", "John Cooper Works", "Cooper SE ALL4"],
  "Mini|Convertible": ["Cooper", "Cooper S", "John Cooper Works"],
  "Mini|Countryman": ["Cooper", "Cooper S", "Cooper SE ALL4", "John Cooper Works ALL4"],
  "Mini|Hardtop": ["Cooper", "Cooper S", "John Cooper Works", "Cooper S 4-door", "John Cooper Works 4-door"],
  "Mini|Paceman": ["Cooper", "Cooper S", "Cooper S ALL4", "John Cooper Works", "John Cooper Works ALL4"],
  // Mitsubishi
  "Mitsubishi|Eclipse Cross": ["ES", "LE", "SE", "SEL", "SEL Premium"],
  "Mitsubishi|Galant": ["ES", "SE", "Ralliart", "GTS"],
  "Mitsubishi|Outlander": ["ES", "SE", "SEL", "SEL S-AWC", "GT", "PHEV SE", "PHEV SEL", "PHEV GT"],
  "Mitsubishi|Outlander Sport": ["ES", "LE", "SE", "GT"],
  // Nissan
  "Nissan|Altima": ["S", "SR", "SV", "SL", "Platinum", "SR AWD"],
  "Nissan|Armada": ["S", "SV", "SL", "Platinum"],
  "Nissan|Frontier": ["S", "SV", "Pro-4X", "SL", "PRO-X"],
  "Nissan|GT-R": ["Premium", "Track Edition", "NISMO"],
  "Nissan|Kicks": ["S", "SV", "SR", "SR Premium"],
  "Nissan|Leaf": ["S", "SV", "SV Plus", "SL Plus"],
  "Nissan|Maxima": ["S", "SV", "SR", "SL", "Platinum", "40th Anniversary"],
  "Nissan|Murano": ["S", "SV", "SL", "Platinum"],
  "Nissan|Pathfinder": ["S", "SV", "SL", "Rock Creek", "Platinum"],
  "Nissan|Rogue": ["S", "SV", "SL", "Platinum", "Rock Creek"],
  "Nissan|Rogue Sport": ["S", "SV", "SL", "Platinum"],
  "Nissan|Sentra": ["S", "SR", "SV", "SL"],
  "Nissan|Titan": ["S", "SV", "Pro-4X", "SL", "Platinum Reserve"],
  "Nissan|Versa": ["S", "SR", "SV"],
  "Nissan|Z": ["Sport", "Performance", "NISMO", "Proto Spec"],
  // Porsche
  "Porsche|718": ["Boxster", "Boxster S", "Boxster GTS 4.0", "Cayman", "Cayman S", "Cayman GTS 4.0", "Cayman GT4", "Cayman GT4 RS", "Spyder", "Spyder RS"],
  "Porsche|911": ["Carrera", "Carrera 4", "Carrera S", "Carrera 4S", "Carrera GTS", "Carrera 4 GTS", "Targa 4", "Targa 4S", "Turbo", "Turbo S", "GT3", "GT3 RS", "GT2 RS", "Sport Classic", "Dakar"],
  "Porsche|Cayenne": ["Base", "E-Hybrid", "S", "GTS", "Turbo", "Turbo S E-Hybrid", "Cayenne E", "Coupe", "Coupe GTS", "Coupe Turbo GT"],
  "Porsche|Macan": ["Base", "S", "GTS", "Turbo", "Electric Macan 4", "Electric Macan Turbo"],
  "Porsche|Panamera": ["Base", "4", "GTS", "4S", "4 E-Hybrid", "4S E-Hybrid", "Turbo", "Turbo S E-Hybrid", "Sport Turismo 4", "Sport Turismo 4S", "Sport Turismo Turbo"],
  "Porsche|Taycan": ["RWD", "4S", "GTS", "Turbo", "Turbo S", "Cross Turismo 4", "Cross Turismo 4S", "Cross Turismo GTS", "Cross Turismo Turbo", "Sport Turismo"],
  // Ram
  "Ram|1500": ["Tradesman", "HFE", "Classic", "Big Horn", "Lone Star", "Laramie", "Rebel", "Limited", "TRX", "Warlock"],
  "Ram|2500": ["Tradesman", "Big Horn", "Lone Star", "Laramie", "Power Wagon", "Limited", "Limited Longhorn"],
  "Ram|3500": ["Tradesman", "Big Horn", "Lone Star", "Laramie", "Limited", "Limited Longhorn"],
  "Ram|ProMaster": ["Cargo Low Roof", "Cargo High Roof", "Window Van", "Cutaway", "Chassis Cab"],
  "Ram|ProMaster City": ["Tradesman", "Tradesman SLT", "Cargo Van", "Wagon"],
  // Rolls-Royce
  "Rolls-Royce|Cullinan": ["Standard", "Black Badge", "Series II"],
  "Rolls-Royce|Dawn": ["Standard", "Black Badge"],
  "Rolls-Royce|Ghost": ["Standard", "Extended", "Black Badge", "Extended Black Badge"],
  "Rolls-Royce|Phantom": ["Standard", "Extended", "Black Badge"],
  "Rolls-Royce|Wraith": ["Standard", "Black Badge"],
  // Saab
  "Saab|9-3": ["Linear", "Arc", "Aero", "Turbo X", "Convertible Arc", "Convertible Aero", "SportCombi Arc", "SportCombi Aero"],
  "Saab|9-5": ["Linear", "Arc", "Aero", "SportCombi Arc", "SportCombi Aero"],
  // Scion
  "Scion|FR-S": ["Base", "Release Series 1.0", "Release Series 2.0"],
  "Scion|iA": ["Base"],
  "Scion|iM": ["Base"],
  "Scion|tC": ["Base", "Release Series"],
  "Scion|xB": ["Base", "Release Series"],
  "Scion|xD": ["Base"],
  // Subaru
  "Subaru|Ascent": ["Base", "Premium", "Limited", "Touring", "Onyx Edition"],
  "Subaru|BRZ": ["Premium", "Limited", "tS", "Series.Yellow"],
  "Subaru|Crosstrek": ["Base", "Premium", "Sport", "Limited", "Wilderness", "Hybrid"],
  "Subaru|Forester": ["Base", "Premium", "Sport", "Limited", "Touring", "Wilderness"],
  "Subaru|Impreza": ["Base", "Premium", "Sport", "Limited", "RS"],
  "Subaru|Legacy": ["Base", "Premium", "Sport", "Limited", "Touring XT", "Touring XT Premium"],
  "Subaru|Outback": ["Base", "Premium", "Onyx Edition", "Onyx Edition XT", "Limited", "Limited XT", "Touring", "Touring XT", "Wilderness"],
  "Subaru|WRX": ["Base", "Premium", "Limited", "GT", "TR", "STI", "STI Limited", "STI Sport"],
  "Subaru|Solterra": ["Premium", "Limited", "Touring"],
  // Suzuki
  "Suzuki|Equator": ["Base", "Premium"],
  "Suzuki|Grand Vitara": ["JX", "JLX", "JLX+", "Limited", "XSport"],
  "Suzuki|Kizashi": ["S", "SE", "SLS", "Sport"],
  "Suzuki|SX4": ["Base", "JX", "JLX", "Sport Sedan", "Sport Hatchback"],
  // Tesla
  "Tesla|Model 3": ["Standard Range RWD", "Long Range AWD", "Performance AWD"],
  "Tesla|Model S": ["Long Range", "Plaid"],
  "Tesla|Model X": ["Long Range", "Plaid"],
  "Tesla|Model Y": ["Standard Range", "Long Range AWD", "Performance AWD", "Long Range RWD"],
  "Tesla|Cybertruck": ["AWD", "Cyberbeast", "Foundation Series"],
  // Toyota
  "Toyota|4Runner": ["SR5", "SR5 Premium", "TRD Off-Road", "TRD Off-Road Premium", "Limited", "Venture", "TRD Pro", "Nightshade", "40th Anniversary"],
  "Toyota|Avalon": ["XLE", "XSE", "XSE Nightshade", "Limited", "TRD", "Touring"],
  "Toyota|Camry": ["LE", "SE", "SE Nightshade", "TRD", "XLE", "XSE", "XSE Nightshade", "Hybrid LE", "Hybrid SE", "Hybrid XLE", "Hybrid XSE"],
  "Toyota|Corolla": ["L", "LE", "SE", "XLE", "XSE", "Hatchback S", "Hatchback SE", "Hatchback XSE", "Cross L", "Cross LE", "Cross SE", "Cross XSE", "Hybrid LE", "GR Corolla Core", "GR Corolla Circuit", "GR Corolla Morizo"],
  "Toyota|Crown": ["XLE", "Limited", "Platinum", "Hybrid Max XLE", "Hybrid Max Limited", "Hybrid Max Platinum"],
  "Toyota|GR86": ["Base", "Premium"],
  "Toyota|Highlander": ["L", "LE", "XLE", "XSE", "Limited", "Platinum", "Bronze Edition", "Hybrid LE", "Hybrid XLE", "Hybrid Limited", "Hybrid Platinum"],
  "Toyota|Land Cruiser": ["Base", "First Edition"],
  "Toyota|Prius": ["LE", "XLE", "Limited", "Prime SE", "Prime XSE", "Prime XSE Premium"],
  "Toyota|RAV4": ["LE", "XLE", "XLE Premium", "TRD Off-Road", "Adventure", "Limited", "Prime SE", "Prime XSE", "Prime XSE Premium", "Hybrid LE", "Hybrid XLE", "Hybrid XLE Premium", "Hybrid XSE", "Hybrid Limited", "Woodland Edition"],
  "Toyota|Sequoia": ["SR5", "Limited", "Platinum", "TRD Pro", "Capstone"],
  "Toyota|Sienna": ["LE", "XLE", "XSE", "Limited", "Platinum", "Woodland Edition"],
  "Toyota|Tacoma": ["SR", "SR5", "Trail", "TRD Sport", "TRD Off-Road", "Limited", "TRD Pro", "Trailhunter"],
  "Toyota|Tundra": ["SR", "SR5", "Limited", "Platinum", "1794 Edition", "TRD Pro", "Capstone", "Hybrid SR5", "Hybrid Limited", "Hybrid Platinum", "Hybrid 1794", "Hybrid TRD Pro"],
  "Toyota|Venza": ["LE", "XLE", "Limited"],
  "Toyota|bZ4X": ["XLE", "XLE AWD", "Limited", "Limited AWD"],
  // Volkswagen
  "Volkswagen|Arteon": ["SE", "SEL", "SEL Premium", "SEL R-Line"],
  "Volkswagen|Atlas": ["S", "SE", "SE Technology", "SEL", "SEL R-Line", "SEL Premium"],
  "Volkswagen|Atlas Cross Sport": ["S", "SE", "SE Technology", "SEL", "SEL R-Line", "SEL Premium"],
  "Volkswagen|Golf": ["S", "SE", "GTI S", "GTI SE", "GTI Autobahn", "GTI 380", "R"],
  "Volkswagen|ID.4": ["Standard", "Pro", "Pro S", "Pro S Plus", "AWD Pro", "AWD Pro S", "AWD Pro S Plus"],
  "Volkswagen|Jetta": ["S", "Sport", "SE", "SEL", "GLI S", "GLI Autobahn", "GLI 35th Anniversary"],
  "Volkswagen|Passat": ["S", "R-Line", "SE", "SEL Premium"],
  "Volkswagen|Taos": ["S", "SE", "SEL"],
  "Volkswagen|Tiguan": ["S", "SE", "SE R-Line", "SEL", "SEL R-Line", "SEL Premium"],
  // Volvo
  "Volvo|C40": ["Base", "Recharge Pure Electric Ultimate"],
  "Volvo|S60": ["B5 Momentum", "B5 R-Design", "B6 R-Design", "T8 Recharge R-Design", "T8 Recharge Polestar", "Recharge T8 Ultimate"],
  "Volvo|S90": ["B6 Momentum Plus", "B6 R-Design", "T8 Recharge Inscription", "Recharge T8 Ultimate"],
  "Volvo|V60": ["B5 Momentum", "B5 R-Design", "B6 R-Design", "Cross Country T5", "Cross Country T6", "Recharge T8 R-Design"],
  "Volvo|V90": ["B6 Plus", "Cross Country B6", "Cross Country Ultimate"],
  "Volvo|XC40": ["B4 Core", "B5 Momentum", "B5 R-Design", "Recharge Pure Electric Plus", "Recharge Pure Electric Ultimate", "Recharge Twin Pro"],
  "Volvo|XC60": ["B5 Momentum", "B5 R-Design", "B6 Momentum", "B6 R-Design", "Recharge T8 Momentum", "Recharge T8 R-Design", "Recharge T8 Ultimate", "Ultimate Dark", "Ultimate Bright"],
  "Volvo|XC90": ["B5 Momentum", "B6 Momentum", "B6 R-Design", "Recharge T8 Momentum", "Recharge T8 R-Design", "Recharge T8 Ultimate"],
};

const YEARS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => (2026 - i).toString());

/* ─── Typography ──────────────────────────────────────────────────────────── */
const body: React.CSSProperties = { fontFamily: "'Open Sans', sans-serif" };

/* ─── Shared style constants ──────────────────────────────────────────────── */
const S = {
  card:        'bg-[#e2e2e5] rounded-2xl p-5 sm:p-8 border border-[#cdcdd2]/60',
  secIcon:     'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
  fieldLabel:  'text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1',
  selectBase:  'w-full h-12 pl-5 pr-10 bg-black/[0.06] border border-[#cdcdd2] rounded-xl text-[#111113] font-medium text-sm cursor-pointer appearance-none outline-none transition-colors focus:border-orange-500/50',
  inputBase:   'w-full h-12 px-5 bg-black/[0.06] border border-[#cdcdd2] rounded-xl text-[#111113] font-medium text-sm outline-none transition-colors focus:border-orange-500/50 placeholder:text-slate-400',
  toolBtn:     'flex items-center gap-4 px-5 py-4 bg-black/[0.06] border border-[#cdcdd2] rounded-xl transition-all hover:bg-[#cdcdd2]/60 hover:border-orange-500/30 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#f4f4f6] w-full text-left',
  historyItem: 'flex items-center gap-4 p-4 bg-black/[0.06] border border-[#cdcdd2] rounded-xl hover:bg-[#ebebed] hover:border-orange-500/25 transition-all text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#f4f4f6] w-full',
};

/* ─── Section header ──────────────────────────────────────────────────────── */
const SectionHead: React.FC<{
  icon: React.ReactNode;
  title: string;
  iconColor?: string;
  right?: React.ReactNode;
}> = ({ icon, title, iconColor = 'text-orange-500', right }) => (
  <div className="flex items-center gap-3 mb-6 overflow-hidden">
    <div className={`${S.secIcon} bg-orange-500/10 border border-orange-500/20 ${iconColor} flex-shrink-0`}>
      {icon}
    </div>
    {/* Regular Barlow bold — no italic, no condensed — much easier to read */}
    <span
      className="font-bold text-[#111113] flex-shrink-0 tracking-wide"
      style={{ ...body, fontSize: 'clamp(14px, 3.5vw, 16px)', textTransform: 'uppercase' }}
    >
      {title}
    </span>
    <div className="flex-1 h-px bg-[#cdcdd2] min-w-0" />
    {right && <div className="flex-shrink-0 ml-1">{right}</div>}
  </div>
);

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const ToolboxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="10" width="20" height="12" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <line x1="12" y1="14" x2="12" y2="18" />
    <line x1="10" y1="16" x2="14" y2="16" />
  </svg>
);

const CarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDown = () => (
  <svg className="w-4 h-4 text-slate-500 pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

/* ─── Component ───────────────────────────────────────────────────────────── */
const VehicleForm: React.FC<VehicleFormProps> = ({
  onDiagnose,
  onTireScan,
  onFindServices,
  isLoading,
  history,
  onHistorySelect,
  onHistoryClear,
  prefill,
  onPrefillUsed,
}) => {
  const [vehicle, setVehicle]             = useState<VehicleInfo>({ make: '', model: '', year: '', mileage: '', engine: '', trim: '', recentRepairs: '' });
  const [description, setDescription]     = useState('');
  const [interimText, setInterimText]     = useState('');
  const [obdCodes, setObdCodes]           = useState('');
  const [files, setFiles]                 = useState<DiagnosticInput['files']>([]);
  const [isRecording, setIsRecording]     = useState(false);
  const [isConnecting, setIsConnecting]   = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCamera, setShowCamera]         = useState(false);
  const [showTireTips, setShowTireTips]     = useState(false);
  const [manualEntry, setManualEntry]       = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ── Car Query API state ────────────────────────────────────────────────────
  const [apiModels, setApiModels]         = useState<string[]>([]);
  const [apiTrims, setApiTrims]           = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingTrims, setLoadingTrims]   = useState(false);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const textAreaRef    = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef       = useRef<number | null>(null);

  useEffect(() => {
    if (textAreaRef.current) textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
  }, [description, interimText]);

  useEffect(() => {
    if (prefill) {
      setVehicle(prefill.vehicle);
      setDescription(prefill.description);
      onPrefillUsed?.();
      setTimeout(() => textAreaRef.current?.focus(), 100);
    }
  }, [prefill]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordingTime(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // ── Fetch models when make changes ────────────────────────────────────────
  useEffect(() => {
    if (!vehicle.make) { setApiModels([]); setApiTrims([]); return; }
    const cacheKey = `pth_models_${vehicle.make}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setApiModels(JSON.parse(cached)); return; }

    const controller = new AbortController();
    setLoadingModels(true);
    setApiModels([]);
    setApiTrims([]);

    fetch(`/api/vehicles?type=models&make=${encodeURIComponent(vehicle.make)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        const names: string[] = data.models?.length ? data.models : (CAR_MODELS[vehicle.make] || []);
        sessionStorage.setItem(cacheKey, JSON.stringify(names));
        setApiModels(names);
      })
      .catch(err => { if (err.name !== 'AbortError') setApiModels(CAR_MODELS[vehicle.make] || []); })
      .finally(() => setLoadingModels(false));
    return () => controller.abort();
  }, [vehicle.make]);

  // ── Fetch trims when make + model changes ─────────────────────────────────
  useEffect(() => {
    if (!vehicle.make || !vehicle.model) { setApiTrims([]); return; }
    const cacheKey = `pth_trims_${vehicle.make}_${vehicle.model}${vehicle.year ? `_${vehicle.year}` : ''}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setApiTrims(JSON.parse(cached)); return; }

    const controller = new AbortController();
    setLoadingTrims(true);
    setApiTrims([]);

    const yearParam = vehicle.year ? `&year=${encodeURIComponent(vehicle.year)}` : '';
    fetch(`/api/vehicles?type=trims&make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}${yearParam}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        const names: string[] = data.trims?.length ? data.trims : (CAR_TRIMS[`${vehicle.make}|${vehicle.model}`] || []);
        sessionStorage.setItem(cacheKey, JSON.stringify(names));
        setApiTrims(names);
      })
      .catch(err => { if (err.name !== 'AbortError') setApiTrims(CAR_TRIMS[`${vehicle.make}|${vehicle.model}`] || []); })
      .finally(() => setLoadingTrims(false));
    return () => controller.abort();
  }, [vehicle.make, vehicle.model, vehicle.year]);

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Voice input is not supported in this browser. Please use Chrome or Safari.'); return; }
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart  = () => { setIsRecording(true); setIsConnecting(false); setInterimText(''); };
      recognition.onresult = (event: any) => {
        let interim = ''; let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += t; else interim += t;
        }
        if (final) {
          setDescription(prev => { const sep = prev && !prev.endsWith(' ') ? ' ' : ''; return prev + sep + final.trim(); });
          setInterimText('');
        } else setInterimText(interim);
      };
      recognition.onerror = (event: any) => {
        setIsConnecting(false); setIsRecording(false);
        if (event.error === 'not-allowed') alert('Microphone access blocked.');
        else if (event.error === 'network') alert('Network error. Voice transcription requires an internet connection.');
      };
      recognition.onend = () => { setIsRecording(false); setIsConnecting(false); setInterimText(''); };
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsConnecting(false); setIsRecording(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') alert('Microphone permission denied.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} recognitionRef.current = null; }
    setIsRecording(false); setIsConnecting(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'make')  setVehicle(p => ({ ...p, make: value, model: '', trim: '' }));
    else if (name === 'model') setVehicle(p => ({ ...p, model: value, trim: '' }));
    else setVehicle(p => ({ ...p, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'description') setDescription(value);
    else if (name === 'obdCodes') setObdCodes(value);
    else if (name === 'mileage') {
      const digits = value.replace(/\D/g, '');
      const formatted = digits ? Number(digits).toLocaleString() : '';
      setVehicle(p => ({ ...p, mileage: formatted }));
    }
    else if (name === 'make' || name === 'model' || name === 'year' || name === 'recentRepairs') setVehicle(p => ({ ...p, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 3 * 1024 * 1024;  // 3MB — keep under Vercel's 4.5MB body limit
    const MAX_FILE_COUNT = 5;
    const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    const VALID_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg', 'video/3gpp'];

    const incoming = Array.from(e.target.files);
    const remaining = MAX_FILE_COUNT - files.length;

    const valid = incoming.slice(0, remaining).filter(file => {
      if (VALID_VIDEO_TYPES.includes(file.type)) {
        if (file.size > MAX_VIDEO_SIZE) {
          alert(`"${file.name}" is too large. Videos must be under 3MB (keep clips under ~10 seconds).`);
          return false;
        }
        return true;
      }
      if (!VALID_IMAGE_TYPES.includes(file.type)) return false;
      if (file.size > MAX_IMAGE_SIZE) return false;
      return true;
    });

    if (valid.length === 0) return;

    const processed: DiagnosticInput['files'] = await Promise.all(
      valid.map(file => new Promise<DiagnosticInput['files'][0]>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => {
          let type: 'image' | 'audio' | 'video' = 'image';
          if (file.type.startsWith('audio')) type = 'audio';
          else if (file.type.startsWith('video')) type = 'video';
          resolve({ data: reader.result as string, mimeType: file.type, name: file.name, type });
        };
        reader.readAsDataURL(file);
      }))
    );
    setFiles(p => [...p, ...processed]);
  };

  const removeFile = (idx: number) => setFiles(p => p.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vehicle.make || !vehicle.model) {
      setValidationError('Please select your vehicle make and model before running a diagnosis.');
      return;
    }
    if (!description && !interimText) {
      setValidationError('Please describe your symptoms before running a diagnosis.');
      return;
    }
    setValidationError(null);
    onDiagnose(vehicle, { description: (description + ' ' + interimText).trim(), obdCodes, files });
  };

  const handleToggleManual = () => {
    setManualEntry(p => !p);
    setVehicle({ make: '', model: '', year: '', mileage: vehicle.mileage, engine: '', trim: '', recentRepairs: vehicle.recentRepairs });
  };

  const isTireReport = (item: any): item is TireAnalysisReport => 'healthScore' in item;
  const models     = apiModels.length ? apiModels : (CAR_MODELS[vehicle.make] || []);
  const trims      = apiTrims.length ? apiTrims : ((vehicle.make && vehicle.model) ? (CAR_TRIMS[`${vehicle.make}|${vehicle.model}`] || []) : []);
  const otherMakes = ALL_MAKES.filter(m => !POPULAR_MAKES.includes(m));
  const charCount  = (description + interimText).length;

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto px-3 sm:px-4 pb-20 space-y-4 sm:space-y-5">

      {showCamera && (
        <CameraCapture
          onCapture={(data, mime) => { onTireScan(data, mime); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* ── Tire photo tips modal ─────────────────────────────────────────── */}
      {showTireTips && (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#e2e2e5] border border-[#cdcdd2] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-[#111113] font-bold text-lg mb-1" style={body}>Tips for a good scan</h3>
            <p className="text-slate-500 text-xs mb-5" style={body}>Better photos = more accurate results.</p>
            <ul className="space-y-3 mb-6">
              {[
                ['Good lighting', 'Natural daylight or bright indoor light — avoid shadows across the tread.'],
                ['Close up', 'Fill the frame with the tire tread, 6–12 inches away.'],
                ['Show the tread', 'Aim at the grooves directly, not the sidewall.'],
                ['Keep it still', 'Hold steady or rest your phone against something.'],
              ].map(([title, tip]) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span className="text-sm text-slate-500" style={body}><span className="font-semibold text-[#111113]">{title}:</span> {tip}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowTireTips(false)}
                className="flex-1 px-4 py-3 bg-black/[0.04] border border-[#cdcdd2] text-slate-500 rounded-xl text-sm font-semibold"
                style={body}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowTireTips(false); setShowCamera(true); }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-[#111113] rounded-xl text-sm font-bold"
                style={body}
              >
                Got it — scan now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Tools ───────────────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead icon={<ToolboxIcon />} title="Quick Tools" />
        <div className="flex flex-col gap-2">
          <button type="button" aria-label="Scan tire tread" onClick={() => setShowTireTips(true)} className={S.toolBtn}>
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/15 flex items-center justify-center text-orange-500 flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#111113]" style={body}>Tire Tread Scan</div>
              <div className="text-xs text-slate-500 mt-0.5" style={body}>Upload or photograph your tire for a wear analysis</div>
            </div>
            <ChevronRight />
          </button>

          <button type="button" aria-label="Find local mechanic" onClick={() => onFindServices('mechanic')} className={S.toolBtn}>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#111113]" style={body}>Find a Mechanic</div>
              <div className="text-xs text-slate-500 mt-0.5" style={body}>Nearby rated shops based on your location</div>
            </div>
            <ChevronRight />
          </button>

          <button type="button" aria-label="Request towing service" onClick={() => onFindServices('towing')} className={S.toolBtn}>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/15 flex items-center justify-center text-rose-400 flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="9" width="12" height="7" rx="1.5" /><path d="M14 12.5h5l2 3.5H14" />
                <circle cx="7" cy="18" r="1.8" /><circle cx="18" cy="18" r="1.8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#111113]" style={body}>Request Towing</div>
              <div className="text-xs text-slate-500 mt-0.5" style={body}>Find tow services dispatched to your location</div>
            </div>
            <ChevronRight />
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

        {/* ── Vehicle Details ──────────────────────────────────────────────── */}
        <section className={S.card}>
          <SectionHead
            icon={<CarIcon />}
            title="Vehicle Details"
            right={
              <button
                type="button"
                onClick={handleToggleManual}
                className="text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{
                  ...body,
                  color: manualEntry ? '#f97316' : '#64748b',
                  borderColor: manualEntry ? 'rgba(249,115,22,0.3)' : 'rgba(100,116,139,0.25)',
                  background: manualEntry ? 'rgba(249,115,22,0.08)' : 'transparent',
                }}
              >
                {manualEntry ? '← Use list' : 'Type manually'}
              </button>
            }
          />

          {manualEntry ? (
            <div className="space-y-3">
              <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl px-4 py-3">
                <p className="text-sm text-orange-400/70 leading-relaxed" style={body}>
                  Can't find your vehicle? Enter the details below and we'll still run a full diagnosis.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Make</label>
                  <input name="make" value={vehicle.make} onChange={handleInputChange} placeholder="e.g. Honda" className={S.inputBase} style={body} />
                </div>
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Model</label>
                  <input name="model" value={vehicle.model} onChange={handleInputChange} placeholder="e.g. Civic" className={S.inputBase} style={body} />
                </div>
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Year</label>
                  <input name="year" value={vehicle.year} onChange={handleInputChange} placeholder="e.g. 2019" className={S.inputBase} style={body} maxLength={4} />
                </div>
              </div>
              <div className="space-y-2">
                <label className={S.fieldLabel} style={body}>Mileage</label>
                <input name="mileage" inputMode="numeric" value={vehicle.mileage} onChange={handleInputChange} placeholder="e.g. 45,000" className={S.inputBase} style={body} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Trim <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                  <div className="relative">
                    <select
                      name="trim"
                      value={vehicle.trim || ''}
                      onChange={handleSelectChange}
                      disabled={trims.length === 0 || loadingTrims}
                      className={`${S.selectBase} ${(trims.length === 0 || loadingTrims) ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={body}
                    >
                      <option value="">{loadingTrims ? 'Loading…' : trims.length === 0 ? 'Select make & model first' : 'Select trim'}</option>
                      {trims.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Recent repairs or maintenance <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                  <input
                    name="recentRepairs"
                    value={vehicle.recentRepairs || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. oil change 2k miles ago, new battery"
                    className={S.inputBase}
                    style={body}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Make</label>
                  <div className="relative">
                    <select name="make" value={vehicle.make} onChange={handleSelectChange} className={S.selectBase} style={body}>
                      <option value="" disabled>Select make</option>
                      <optgroup label="── Popular ──">
                        {POPULAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                      </optgroup>
                      <optgroup label="── All Makes ──">
                        {otherMakes.map(m => <option key={m} value={m}>{m}</option>)}
                      </optgroup>
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Model</label>
                  <div className="relative">
                    <select
                      name="model"
                      value={vehicle.model}
                      onChange={handleSelectChange}
                      disabled={!vehicle.make || loadingModels}
                      className={`${S.selectBase} ${(!vehicle.make || loadingModels) ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={body}
                    >
                      <option value="" disabled>
                        {loadingModels ? 'Loading…' : vehicle.make ? 'Select model' : 'Pick a make first'}
                      </option>
                      {models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Year</label>
                  <div className="relative">
                    <select name="year" value={vehicle.year} onChange={handleSelectChange} className={S.selectBase} style={body}>
                      <option value="" disabled>Select year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={S.fieldLabel} style={body}>Mileage</label>
                <input name="mileage" inputMode="numeric" value={vehicle.mileage} onChange={handleInputChange} placeholder="e.g. 45,000" className={S.inputBase} style={body} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Trim <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                  <div className="relative">
                    <select
                      name="trim"
                      value={vehicle.trim || ''}
                      onChange={handleSelectChange}
                      disabled={trims.length === 0 || loadingTrims}
                      className={`${S.selectBase} ${(trims.length === 0 || loadingTrims) ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={body}
                    >
                      <option value="">{loadingTrims ? 'Loading…' : trims.length === 0 ? 'Select make & model first' : 'Select trim'}</option>
                      {trims.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Recent repairs or maintenance <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                  <input
                    name="recentRepairs"
                    value={vehicle.recentRepairs || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. oil change 2k miles ago, new battery"
                    className={S.inputBase}
                    style={body}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 pl-1" style={body}>
                Vehicle not listed?{' '}
                <button type="button" onClick={handleToggleManual} className="text-orange-500/60 hover:text-orange-400 transition-colors underline underline-offset-2 focus:outline-none">
                  Enter it manually
                </button>
              </p>
            </div>
          )}
        </section>

        {/* ── Diagnostic Information ───────────────────────────────────────── */}
        <section className={S.card}>
          <SectionHead
            icon={<WarningIcon />}
            title="Diagnostic Info"
            right={
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-xl ring-2 ring-orange-500 animate-ping opacity-20" />
                )}
                <button
                  type="button"
                  aria-label="Toggle voice input"
                  disabled={isConnecting}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border-b-2 font-semibold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#f4f4f6] whitespace-nowrap
                    ${isRecording
                      ? 'bg-orange-600 border-orange-800 text-[#111113]'
                      : isConnecting
                      ? 'bg-[#cdcdd2] border-[#f4f4f6] text-slate-500'
                      : 'bg-black/[0.06] border-[#cdcdd2] text-slate-500 hover:border-orange-500/40 hover:text-[#111113]'
                    }`}
                  style={body}
                >
                  {isRecording ? (
                    <div className="flex items-end gap-0.5 h-3.5 flex-shrink-0">
                      <div className="w-0.5 bg-white rounded-full animate-[bounce_0.8s_infinite] h-2" />
                      <div className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite] h-3.5" />
                      <div className="w-0.5 bg-white rounded-full animate-[bounce_0.6s_infinite] h-2.5" />
                      <div className="w-0.5 bg-white rounded-full animate-[bounce_0.9s_infinite] h-3.5" />
                    </div>
                  ) : isConnecting ? (
                    <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">
                    {isRecording ? `Listening… ${formatTime(recordingTime)}` : isConnecting ? 'Connecting…' : 'Tap to speak'}
                  </span>
                  <span className="sm:hidden">
                    {isRecording ? formatTime(recordingTime) : isConnecting ? '…' : 'Speak'}
                  </span>
                </button>
              </div>
            }
          />

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <label className={S.fieldLabel} style={body}>What's happening? — symptoms, noises, leaks</label>
              <div className="relative">
                <textarea
                  ref={textAreaRef}
                  name="description"
                  value={description + (interimText ? (description ? ' ' : '') + interimText : '')}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="e.g. Loud knocking from the engine at idle, gets worse when accelerating. Started 3 days ago, only happens when the engine is warm. No warning lights."
                  className={`w-full min-h-[120px] px-5 py-4 bg-black/[0.06] border rounded-2xl outline-none resize-none text-[#111113] text-sm leading-relaxed transition-colors font-medium
                    ${isRecording ? 'border-orange-500/40 bg-orange-900/5' : 'border-[#cdcdd2] focus:border-orange-500/50'}`}
                  style={{ ...body, color: '#f1f5f9', caretColor: "#f97316" }}
                />
                {isRecording && (
                  <div className="absolute top-3 right-4 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                    </span>
                    <span className="text-[10px] font-semibold text-orange-500" style={body}>Live</span>
                  </div>
                )}
                <div className="absolute bottom-3 right-4 text-[10px] text-slate-500" style={body}>
                  {charCount} chars
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { label: 'When?',     hint: 'Cold start, hot engine, always', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { label: 'Sound?',    hint: 'Knock, squeal, grind, hiss',     icon: 'M15.536 8.464a5 5 0 010 7.072M12 18.364a9 9 0 000-12.728M8.464 8.464a5 5 0 000 7.072' },
                  { label: 'Where?',   hint: 'Engine, brakes, steering',        icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                  { label: 'How long?', hint: 'Days, weeks, getting worse',     icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                ].map(({ label, hint, icon }) => (
                  <div key={label} className="flex items-start gap-2 bg-black/[0.04] border border-[#cdcdd2]/60 rounded-xl px-3 py-2.5 min-h-[52px]">
                    <svg className="w-3.5 h-3.5 text-orange-500/60 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                    </svg>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-0.5" style={body}>{label}</p>
                      <p className="text-[10px] text-slate-500 leading-snug" style={body}>{hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className={S.fieldLabel} style={body}>OBD-II Codes <span className="text-slate-400 normal-case font-normal">(optional — but highly recommended)</span></label>
                <input
                  name="obdCodes"
                  value={obdCodes}
                  onChange={handleInputChange}
                  placeholder="P0300, P0420…"
                  className={`${S.inputBase} font-mono`}
                />
                <p className="text-[10px] text-slate-500 pl-1 leading-relaxed" style={body}>
                  Narrows results from dozens of causes to 2–3. Biggest accuracy boost.
                </p>
              </div>
              <div className="space-y-2">
                <label className={S.fieldLabel} style={body}>Photos or videos</label>
                <button
                  type="button"
                  aria-label="Attach photos or videos"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-12 flex items-center justify-center gap-2 px-5 bg-black/[0.06] border-2 border-dashed border-[#cdcdd2] rounded-xl text-slate-500 hover:border-orange-500/30 hover:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#f4f4f6] text-sm font-medium"
                  style={body}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Attach media
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*,video/*" className="hidden" />
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-5 pt-5 border-t border-[#cdcdd2]/60">
              <p className="text-xs font-semibold text-slate-500 mb-3" style={body}>
                Attachments ({files.length})
              </p>
              <div className="flex flex-wrap gap-3">
                {files.map((file, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-[#cdcdd2] bg-[#ebebed] flex items-center justify-center">
                    {file.type === 'image' ? (
                      <img src={file.data} className="w-full h-full object-cover" alt={file.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#cdcdd2]">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <button
                      type="button"
                      aria-label="Remove attachment"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-[#111113] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Validation error ─────────────────────────────────────────── */}
        {validationError && (
          <div role="alert" className="flex items-center gap-3 px-5 py-3 bg-rose-500/10 border border-rose-500/25 rounded-xl">
            <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm text-rose-300" style={body}>{validationError}</span>
          </div>
        )}

        {/* ── Submit — orange CTA button ────────────────────────────────── */}
        <button
          type="submit"
          disabled={isLoading}
          className={`not-italic w-full py-3 rounded-xl flex items-center justify-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#f4f4f6]
            ${isLoading
              ? 'bg-[#cdcdd2] text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-[#111113] shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:scale-[0.99]'
            }`}
          style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 900, fontSize: 'clamp(16px, 4vw, 22px)', letterSpacing: '0.04em', fontStyle: 'normal' }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Running diagnosis…
            </>
          ) : (
            <>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Find My Problem
            </>
          )}
        </button>
      </form>

      {/* ── History ───────────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <section className={S.card}>
          <SectionHead
            icon={<ClockIcon />}
            title="Recent History"
            iconColor="text-slate-500"
            right={
              <button
                type="button"
                onClick={onHistoryClear}
                className="text-xs font-medium text-slate-500 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1"
                style={body}
              >
                Clear all
              </button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {history.map(item => (
              <button
                key={item.id}
                type="button"
                aria-label={`View report for ${isTireReport(item) ? 'Tire Scan' : (item as DiagnosticReport).vehicle.make}`}
                onClick={() => onHistorySelect(item)}
                className={S.historyItem}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${isTireReport(item) ? 'bg-blue-500/10 border-blue-500/15 text-blue-500' : 'bg-orange-500/10 border-orange-500/15 text-orange-500'}`}>
                  {isTireReport(item) ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {/* History title: regular bold, not condensed italic */}
                  <div className="font-semibold text-[#111113] text-sm truncate" style={body}>
                    {isTireReport(item) ? 'Tire Scan Report' : `${(item as DiagnosticReport).vehicle.year} ${(item as DiagnosticReport).vehicle.make} ${(item as DiagnosticReport).vehicle.model}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5" style={body}>
                    {new Date(item.timestamp).toLocaleDateString()} · {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <ChevronRight />
              </button>
            ))}
          </div>
        </section>
      )}


    </div>
  );
};

export default VehicleForm;