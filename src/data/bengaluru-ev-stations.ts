/**
 * Real BESCOM EV Charging Station Data - Bengaluru
 * Source: BESCOM Locationwise Chargers Installed
 * 199 charger units consolidated into unique locations
 * Charger models: GB/T IEC AC Combo, CCS CHAdeMO Combo, IEC AC 10kW, EVRE-WX-3.3kW, PENTA IEC 3.3kW
 */

export interface BESCOMStation {
  id: string;
  name: string;
  location: string;
  coords: [number, number];
  chargers: { code: string; model: string }[];
  totalChargers: number;
  types: string[]; // unique charger types at this location
  area: string;
}

// Consolidated by unique location with real GPS coordinates
export const BESCOM_EV_STATIONS: BESCOMStation[] = [
  {
    id: 'bescom-corporate', name: 'BESCOM Corporate Office', location: 'KR Circle, Bengaluru',
    coords: [12.9747, 77.5847], area: 'Central',
    chargers: [
      { code: 'BESCOR01', model: 'GB/T IEC AC Combo' },
      { code: 'BESKABLRAC00041', model: 'IEC AC 10kW' },
      { code: 'BESCOR03', model: 'CCS CHAdeMO Combo' },
      { code: 'BESCOR04', model: 'GB/T IEC AC Combo' },
      { code: 'BESCOR02', model: 'GB/T IEC AC Combo' },
      { code: 'BESCOR05', model: 'EVRE-WX-3.3kW' },
      { code: 'BESCOR06', model: 'PENTA IEC 3.3kW' },
      { code: 'BESAC052200078', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 8,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW', 'EVRE-WX-3.3kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-banaswadi', name: 'BESCOM Banaswadi', location: 'Banaswadi, Bengaluru',
    coords: [13.0120, 77.6360], area: 'East',
    chargers: [
      { code: 'BESBAN001', model: 'GB/T IEC AC Combo' },
      { code: 'BESBAN002', model: 'CCS CHAdeMO Combo' },
      { code: 'BESKABLRAC00013', model: 'IEC AC 10kW' },
      { code: 'BESAC052200039', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 4, area: 'East',
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-indiranagar', name: 'BESCOM Indiranagar', location: 'Indiranagar, Bengaluru',
    coords: [12.9784, 77.6408], area: 'East',
    chargers: [
      { code: 'BESIND02', model: 'CCS CHAdeMO Combo' },
      { code: 'BESIND01', model: 'GB/T IEC AC Combo' },
      { code: 'BESKABLRAC00002', model: 'IEC AC 10kW' },
      { code: 'BESAC052200034', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 4,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-hsr', name: 'BESCOM HSR Layout', location: 'HSR Layout, Bengaluru',
    coords: [12.9150, 77.6400], area: 'South-East',
    chargers: [
      { code: 'BESHSR001', model: 'GB/T IEC AC Combo' },
      { code: 'BESHSR002', model: 'CCS CHAdeMO Combo' },
      { code: 'BESKABLRAC00021', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00022', model: 'IEC AC 10kW' },
      { code: 'BESAC0522117', model: 'EVRE-WX-3.3kW' },
      { code: 'BESAC0522118', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 6,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW', 'EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-byatarayanapura', name: 'BESCOM Byatarayanapura', location: 'Byatarayanapura, Bengaluru',
    coords: [13.0640, 77.5950], area: 'North',
    chargers: [
      { code: 'BESBYA001', model: 'GB/T IEC AC Combo' },
      { code: 'BESBYA002', model: 'CCS CHAdeMO Combo' },
      { code: 'BESKABLRAC00006', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00005', model: 'IEC AC 10kW' },
    ],
    totalChargers: 4,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW'],
  },
  {
    id: 'bescom-btm', name: 'BESCOM BTM Layout', location: 'BTM Layout, Bengaluru',
    coords: [12.9166, 77.6101], area: 'South',
    chargers: [
      { code: 'BESBTM001', model: 'GB/T IEC AC Combo' },
      { code: 'BESBTM002', model: 'CCS CHAdeMO Combo' },
      { code: 'BESKABLRAC00009', model: 'IEC AC 10kW' },
    ],
    totalChargers: 3,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW'],
  },
  {
    id: 'bescom-yelahanka', name: 'BESCOM Yelahanka', location: 'Yelahanka, Bengaluru',
    coords: [13.1007, 77.5963], area: 'North',
    chargers: [
      { code: 'BESYAL001', model: 'GB/T IEC AC Combo' },
      { code: 'BESYAL002', model: 'CCS CHAdeMO Combo' },
      { code: 'BESKABLRAC00012', model: 'IEC AC 10kW' },
      { code: 'BESAC052200061', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 4,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-peenya', name: 'BESCOM Peenya', location: 'Peenya Industrial Area, Bengaluru',
    coords: [13.0300, 77.5200], area: 'North-West',
    chargers: [
      { code: 'BESPEE001', model: 'GB/T IEC AC Combo' },
      { code: 'BESPEE002', model: 'CCS CHAdeMO Combo' },
      { code: 'BESKABLRAC00010', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00060', model: 'IEC AC 10kW' },
      { code: 'BESAC052200073', model: 'PENTA IEC 3.3kW' },
      { code: 'BESAC052200089', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 6,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-murugeshpalya', name: 'BESCOM Murugeshpalya', location: 'Murugeshpalya, Bengaluru',
    coords: [12.9643, 77.6500], area: 'East',
    chargers: [
      { code: 'BESMUR001', model: 'GB/T IEC AC Combo' },
      { code: 'BESMUR002', model: 'CCS CHAdeMO Combo' },
      { code: 'BESKABLRAC00003', model: 'IEC AC 10kW' },
    ],
    totalChargers: 3,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW'],
  },
  {
    id: 'bescom-mathikere', name: 'BESCOM Mathikere', location: 'Mathikere, Bengaluru',
    coords: [13.0200, 77.5700], area: 'North',
    chargers: [
      { code: 'BESMAT001', model: 'GB/T IEC AC Combo' },
      { code: 'BESMAT002', model: 'CCS CHAdeMO Combo' },
      { code: 'BESKABLRAC00011', model: 'IEC AC 10kW' },
      { code: 'BESAC052200070', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 4,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-mahadevpura', name: 'BESCOM Mahadevpura', location: 'Mahadevpura, Bengaluru',
    coords: [12.9920, 77.6830], area: 'East',
    chargers: [
      { code: 'BESMAH001', model: 'GB/T IEC AC Combo' },
      { code: 'BESMAH002', model: 'CCS CHAdeMO Combo' },
      { code: 'BESKABLRAC00008', model: 'IEC AC 10kW' },
      { code: 'BESAC052200081', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 4,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-katriguppe', name: 'BESCOM Katriguppe', location: 'Katriguppe, Bengaluru',
    coords: [12.9370, 77.5600], area: 'South-West',
    chargers: [
      { code: 'BESKAT001', model: 'GB/T IEC AC Combo' },
      { code: 'BESKAT002', model: 'CCS CHAdeMO Combo' },
      { code: 'BESAC0522114', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 3,
    types: ['GB/T IEC AC Combo', 'CCS CHAdeMO Combo', 'EVRE-WX-3.3kW'],
  },
  {
    id: 'bbmp-horamavu', name: 'BBMP Horamavu Office', location: 'Horamavu, Bengaluru',
    coords: [13.0280, 77.6440], area: 'North-East',
    chargers: [
      { code: 'BESKABLRAC00030', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00039', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'ttmc-yeshwanthpur', name: 'TTMC Yeshwanthpura', location: 'Yeshwanthpura, Bengaluru',
    coords: [13.0230, 77.5440], area: 'North-West',
    chargers: [
      { code: 'BESKABLRAC00056', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00054', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00055', model: 'IEC AC 10kW' },
    ],
    totalChargers: 3,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-soladevanahalli', name: 'Soladevanahalli Bagalagunte O&M', location: 'Soladevanahalli, Bengaluru',
    coords: [13.0600, 77.5100], area: 'North-West',
    chargers: [
      { code: 'BESKABLRAC00053', model: 'IEC AC 10kW' },
      { code: 'BESAC052200087', model: 'PENTA IEC 3.3kW' },
      { code: 'BESAC052200084', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 3,
    types: ['IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bbmp-gottigere', name: 'BBMP Gottigere Ward Office', location: 'Gottigere, Bengaluru',
    coords: [12.8760, 77.5900], area: 'South',
    chargers: [
      { code: 'BESKABLRAC00035', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00064', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00036', model: 'IEC AC 10kW' },
    ],
    totalChargers: 3,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'rto-kasthuri-nagar', name: 'RTO Kasthuri Nagar', location: 'Kasthuri Nagar, Bengaluru',
    coords: [13.0040, 77.6590], area: 'East',
    chargers: [
      { code: 'BESKABLRAC00030', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00031', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'rto-kr-puram', name: 'RTO KR Puram', location: 'KR Puram, Bengaluru',
    coords: [12.9882, 77.6750], area: 'East',
    chargers: [
      { code: 'BESKABLRAC00097', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00098', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'rto-electronic-city', name: 'RTO Electronic City', location: 'Electronic City, Bengaluru',
    coords: [12.8450, 77.6620], area: 'South-East',
    chargers: [
      { code: 'BESKABLRAC00066', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00065', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-kaggalipura', name: 'BESCOM Kaggalipura SDO', location: 'Kaggalipura, Bengaluru',
    coords: [12.8100, 77.5300], area: 'South-West',
    chargers: [
      { code: 'BESKABLRAC00083', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00082', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'ttmc-vijayanagar', name: 'TTMC Vijayanagar', location: 'Vijayanagar, Bengaluru',
    coords: [12.9649, 77.5358], area: 'West',
    chargers: [
      { code: 'BESKABLRAC00089', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00088', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00087', model: 'IEC AC 10kW' },
    ],
    totalChargers: 3,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'ksrtc-mysore-road', name: 'KSRTC Mysore Road Satellite', location: 'Mysore Road, Bengaluru',
    coords: [12.9550, 77.5058], area: 'South-West',
    chargers: [
      { code: 'BESKABLRAC00094', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00093', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bda-nagarabhavi', name: 'BDA Nagarabhavi', location: 'Nagarabhavi, Bengaluru',
    coords: [12.9600, 77.5100], area: 'West',
    chargers: [
      { code: 'BESKABLRAC00091', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00092', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bbmp-mahadevapura', name: 'BBMP Mahadevapura Office', location: 'Mahadevapura, Bengaluru',
    coords: [12.9950, 77.6950], area: 'East',
    chargers: [
      { code: 'BESKABLRAC00044', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-vidyaranyapura', name: 'BESCOM Vidyaranyapura SDO', location: 'Vidyaranyapura, Bengaluru',
    coords: [13.0700, 77.5600], area: 'North',
    chargers: [
      { code: 'BESKABLRAC00052', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bbmp-corporation', name: 'BBMP Corporation Office', location: 'BBMP HQ, Bengaluru',
    coords: [12.9700, 77.5950], area: 'Central',
    chargers: [
      { code: 'BESKABLRAC00075', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00073', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00074', model: 'IEC AC 10kW' },
    ],
    totalChargers: 3,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'ttmc-shantinagar', name: 'TTMC Shantinagar', location: 'Shantinagar, Bengaluru',
    coords: [12.9560, 77.5950], area: 'Central',
    chargers: [
      { code: 'BESKABLRAC00077', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00076', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'jigani-kiadb', name: 'Jigani KIADB', location: 'Jigani, Bengaluru',
    coords: [12.7800, 77.6300], area: 'South',
    chargers: [
      { code: 'BESKABLRAC00063', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00062', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-hosakote', name: 'BESCOM Hosakote SDO', location: 'Hosakote, Bengaluru Rural',
    coords: [13.0700, 77.7900], area: 'East',
    chargers: [
      { code: 'BESKABLRAC00026', model: 'IEC AC 10kW' },
      { code: 'BESAC052200018', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bbmp-jayanagar', name: 'BBMP Jayanagar Office', location: 'Jayanagar, Bengaluru',
    coords: [12.9260, 77.5840], area: 'South',
    chargers: [
      { code: 'BESKABLRAC00070', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-jalahalli', name: 'BESCOM Jalahalli SDO', location: 'Jalahalli, Bengaluru',
    coords: [13.0380, 77.5080], area: 'North-West',
    chargers: [
      { code: 'BESKABLRAC00051', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'rto-yelahanka', name: 'RTO Yelahanka', location: 'Yelahanka, Bengaluru',
    coords: [13.1020, 77.5940], area: 'North',
    chargers: [
      { code: 'BESKABLRAC00047', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00048', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bbmp-shakarnagar', name: 'BBMP Shakara Nagar Office', location: 'Sahakara Nagar, Bengaluru',
    coords: [13.0600, 77.5800], area: 'North',
    chargers: [
      { code: 'BESKABLRAC00049', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00050', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'kengeri-ttmc', name: 'Kengeri TTMC', location: 'Kengeri, Bengaluru',
    coords: [12.9050, 77.4558], area: 'South-West',
    chargers: [
      { code: 'BESKABLRAC00080', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00081', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-isro', name: 'BESCOM ISRO Layout', location: 'ISRO Layout, Bengaluru',
    coords: [12.8950, 77.5700], area: 'South',
    chargers: [
      { code: 'BESKABLRAC00078', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bda-banashankari', name: 'BDA Banashankari', location: 'Banashankari, Bengaluru',
    coords: [12.9150, 77.5750], area: 'South',
    chargers: [
      { code: 'BESKABLRAC00079', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-chandapura', name: 'BESCOM Chandapura SDO', location: 'Chandapura, Bengaluru',
    coords: [12.8000, 77.7050], area: 'South-East',
    chargers: [
      { code: 'BESKABLRAC00023', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00024', model: 'IEC AC 10kW' },
      { code: 'BESAC052200093', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 3,
    types: ['IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bbmp-doddakanneli', name: 'BBMP Doddakanneli Office', location: 'Doddakanneli, Bengaluru',
    coords: [12.9200, 77.6850], area: 'South-East',
    chargers: [
      { code: 'BESKABLRAC00067', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00068', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'ksrtc-peenya', name: 'KSRTC Peenya', location: 'Peenya, Bengaluru',
    coords: [13.0350, 77.5150], area: 'North-West',
    chargers: [
      { code: 'BESKABLRAC00059', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00058', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bbmp-vignana-nagar', name: 'BBMP Vignana Nagar', location: 'Vignana Nagar, Bengaluru',
    coords: [12.9700, 77.6700], area: 'East',
    chargers: [
      { code: 'BESKABLRAC00029', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00028', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-tannery-road', name: 'BESCOM Tannery Road SDO', location: 'Tannery Road, Bengaluru',
    coords: [12.9950, 77.6080], area: 'Central',
    chargers: [
      { code: 'BESKABLRAC00018', model: 'IEC AC 10kW' },
      { code: 'BESAC052200045', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-lingarajapuram', name: 'BESCOM Lingarajapuram', location: 'Lingarajapuram, Bengaluru',
    coords: [13.0050, 77.6200], area: 'North-East',
    chargers: [
      { code: 'BESKABLRAC00001', model: 'IEC AC 10kW' },
      { code: 'BESAC052200038', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'ttmc-domlur', name: 'TTMC Domlur', location: 'Domlur, Bengaluru',
    coords: [12.9612, 77.6380], area: 'Central',
    chargers: [
      { code: 'BESKABLRAC00033', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00034', model: 'IEC AC 10kW' },
      { code: 'BESAC052200033', model: 'PENTA IEC 3.3kW' },
      { code: 'BESKABLRAC00032', model: 'IEC AC 10kW' },
    ],
    totalChargers: 4,
    types: ['IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-papareddy', name: 'BESCOM Papareddy Palya O&M', location: 'Papareddy Palya, Bengaluru',
    coords: [12.9500, 77.5500], area: 'West',
    chargers: [
      { code: 'BESKABLRAC00014', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-nagawara', name: 'BESCOM Nagawara Sub Division', location: 'Nagawara, Bengaluru',
    coords: [13.0450, 77.6150], area: 'North',
    chargers: [
      { code: 'BESKABLRAC00019', model: 'IEC AC 10kW' },
      { code: 'BESAC052200042', model: 'PENTA IEC 3.3kW' },
      { code: 'BESAC052200041', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 3,
    types: ['IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'ttmc-shivajinagar', name: 'Shivajinagar TTMC', location: 'Shivajinagar, Bengaluru',
    coords: [12.9854, 77.6050], area: 'Central',
    chargers: [
      { code: 'BESKABLRAC00037', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-jp-nagar', name: 'BESCOM JP Nagar SDO', location: 'JP Nagar, Bengaluru',
    coords: [12.9080, 77.5850], area: 'South',
    chargers: [
      { code: 'BESAC0522106', model: 'EVRE-WX-3.3kW' },
      { code: 'BESAC0522107', model: 'EVRE-WX-3.3kW' },
      { code: 'BESKABLRAC00071', model: 'IEC AC 10kW' },
    ],
    totalChargers: 3,
    types: ['EVRE-WX-3.3kW', 'IEC AC 10kW'],
  },
  {
    id: 'bescom-panduranganagar', name: 'BESCOM Panduranganagar O&M', location: 'Panduranganagar, Bengaluru',
    coords: [12.9120, 77.5950], area: 'South',
    chargers: [
      { code: 'BESAC0522108', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 1,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-jayanagar-div', name: 'BESCOM Jayanagar Division', location: 'Jayanagar, Bengaluru',
    coords: [12.9280, 77.5830], area: 'South',
    chargers: [
      { code: 'BESAC0522113', model: 'EVRE-WX-3.3kW' },
      { code: 'BESAC0522121', model: 'EVRE-WX-3.3kW' },
      { code: 'BESAC0522111', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 3,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-chikkalasandra', name: 'BESCOM Chikkalasandra O&M', location: 'Chikkalasandra, Bengaluru',
    coords: [12.9050, 77.5600], area: 'South',
    chargers: [
      { code: 'BESAC052200072', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 1,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-malleshwaram', name: 'BESCOM Malleshwaram SDO', location: 'Malleshwaram, Bengaluru',
    coords: [13.0030, 77.5650], area: 'North',
    chargers: [
      { code: 'BESAC052200072', model: 'PENTA IEC 3.3kW' },
      { code: 'BESAC052200071', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 2,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-kavalbairasandra', name: 'BESCOM Kavalbairasandra SDO', location: 'Kavalbairasandra, Bengaluru',
    coords: [13.0100, 77.5450], area: 'North-West',
    chargers: [
      { code: 'BESAC052200065', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-hebbala', name: 'BESCOM Hebbala SDO', location: 'Hebbal, Bengaluru',
    coords: [13.0358, 77.5970], area: 'North',
    chargers: [
      { code: 'BESAC052200064', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-attibele', name: 'BESCOM Attibele SDO', location: 'Attibele, Bengaluru',
    coords: [12.7700, 77.7700], area: 'South-East',
    chargers: [
      { code: 'BESAC052200011', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-sarjapura', name: 'BESCOM Sarjapura SDO', location: 'Sarjapura, Bengaluru',
    coords: [12.8600, 77.7850], area: 'South-East',
    chargers: [
      { code: 'BESAC052200010', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-jigani-sdo', name: 'BESCOM Jigani SDO', location: 'Jigani, Bengaluru',
    coords: [12.7850, 77.6350], area: 'South',
    chargers: [
      { code: 'BESAC052200009', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-shettihalli', name: 'BESCOM Shettihalli O&M', location: 'Shettihalli, Bengaluru',
    coords: [13.0550, 77.5050], area: 'North-West',
    chargers: [
      { code: 'BESAC052200074', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-hegganahalli', name: 'BESCOM Hegganahalli O&M', location: 'Hegganahalli, Bengaluru',
    coords: [13.0400, 77.5200], area: 'North-West',
    chargers: [
      { code: 'BESKABLRAC00057', model: 'IEC AC 10kW' },
      { code: 'BESAC052200075', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW', 'PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-rajajinagar', name: 'BESCOM Rajajinagar Division', location: 'Rajajinagar, Bengaluru',
    coords: [12.9980, 77.5550], area: 'North',
    chargers: [
      { code: 'BESAC0522122', model: 'EVRE-WX-3.3kW' },
      { code: 'BESAC0522123', model: 'EVRE-WX-3.3kW' },
      { code: 'BESAC0522124', model: 'EVRE-WX-3.3kW' },
      { code: 'BESAC0522125', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 4,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-nandini', name: 'BESCOM Nandini Layout O&M', location: 'Nandini Layout, Bengaluru',
    coords: [13.0150, 77.5200], area: 'North-West',
    chargers: [
      { code: 'BESAC052200085', model: 'PENTA IEC 3.3kW' },
      { code: 'BESAC052200086', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 2,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-anekal', name: 'BESCOM Anekal SDO', location: 'Anekal, Bengaluru',
    coords: [12.7200, 77.6950], area: 'South',
    chargers: [
      { code: 'BESAC052200091', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-benniganahalli', name: 'BESCOM Benniganahalli SDO', location: 'Benniganahalli, Bengaluru',
    coords: [12.9915, 77.6612], area: 'East',
    chargers: [
      { code: 'BESAC052200035', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-cooke-town', name: 'BESCOM Cooke Town SDO', location: 'Cooke Town, Bengaluru',
    coords: [12.9980, 77.6130], area: 'Central',
    chargers: [
      { code: 'BESAC052200037', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-east-circle', name: 'BESCOM East Circle Office', location: 'East Circle, Bengaluru',
    coords: [12.9750, 77.6300], area: 'East',
    chargers: [
      { code: 'BESAC052200043', model: 'PENTA IEC 3.3kW' },
      { code: 'BESAC052200044', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 2,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-hanumanthanagar', name: 'BESCOM Hanumanthanagar O&M', location: 'Hanumanthanagar, Bengaluru',
    coords: [12.9380, 77.5650], area: 'South',
    chargers: [
      { code: 'BESAC052200040', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-jakkur', name: 'BESCOM Jakkur O&M', location: 'Jakkur, Bengaluru',
    coords: [13.0700, 77.5950], area: 'North',
    chargers: [
      { code: 'BESAC052200067', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-kr-pura-sdo', name: 'BESCOM KR Pura SDO', location: 'KR Pura, Bengaluru',
    coords: [12.9900, 77.6800], area: 'East',
    chargers: [
      { code: 'BESAC052200083', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bbmp-whitefield', name: 'BBMP Whitefield Office', location: 'Whitefield, Bengaluru',
    coords: [12.9698, 77.7500], area: 'East',
    chargers: [
      { code: 'BESKABLRAC00045', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bbmp-kr-puram', name: 'BBMP KR Puram Office', location: 'KR Puram, Bengaluru',
    coords: [12.9870, 77.6780], area: 'East',
    chargers: [
      { code: 'BESKABLRAC00046', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-mallathalli', name: 'BESCOM Mallathalli O&M', location: 'Mallathalli, Bengaluru',
    coords: [12.9500, 77.5100], area: 'West',
    chargers: [
      { code: 'BESKABLRAC00007', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-shankarapuram', name: 'BESCOM Shankarapuram O&M', location: 'Shankarapuram, Bengaluru',
    coords: [12.9550, 77.5750], area: 'South',
    chargers: [
      { code: 'BESKABLRAC00016', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-rr-layout', name: 'BESCOM RR Layout O&M', location: 'RR Layout, Bengaluru',
    coords: [12.9200, 77.5550], area: 'South-West',
    chargers: [
      { code: 'BESKABLRAC00084', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-avalahalli', name: 'BESCOM Avalahalli SDO', location: 'Avalahalli, Bengaluru',
    coords: [12.9300, 77.5500], area: 'South-West',
    chargers: [
      { code: 'BESKABLRAC00015', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-west-circle', name: 'BESCOM West Circle Office', location: 'West Circle, Bengaluru',
    coords: [12.9650, 77.5400], area: 'West',
    chargers: [
      { code: 'BESKABLRAC00090', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bbmp-bilekahalli', name: 'BBMP Vijaya Bank Bilekahalli', location: 'Bilekahalli, Bengaluru',
    coords: [12.9000, 77.5950], area: 'South',
    chargers: [
      { code: 'BESKABLRAC00069', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-kumbalagodu', name: 'BESCOM Kumbalagodu O&M', location: 'Kumbalagodu, Bengaluru',
    coords: [12.8600, 77.4700], area: 'South-West',
    chargers: [
      { code: 'BESKABLRAC00017', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'rto-nelamangala', name: 'RTO Nelamangala', location: 'Nelamangala, Bengaluru Rural',
    coords: [13.0950, 77.3950], area: 'North-West',
    chargers: [
      { code: 'BESKABLRAC00027', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'kptcl-w4', name: 'W4 Subdivision (KPTCL)', location: 'W4 Subdivision, Bengaluru',
    coords: [12.9600, 77.5350], area: 'West',
    chargers: [
      { code: 'BESKABLRAC00043', model: 'IEC AC 10kW' },
      { code: 'BESKABLRAC00042', model: 'IEC AC 10kW' },
    ],
    totalChargers: 2,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-devanahalli', name: 'BESCOM Devanahalli SDO', location: 'Devanahalli, Bengaluru',
    coords: [13.2500, 77.7100], area: 'North',
    chargers: [
      { code: 'BESKABLRAC00025', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-rr-nagara', name: 'BESCOM RR Nagara O&M', location: 'Rajarajeshwari Nagara, Bengaluru',
    coords: [12.9350, 77.4858], area: 'South-West',
    chargers: [
      { code: 'BESKABLRAC00020', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bda-hbr', name: 'BDA HBR Layout Complex', location: 'HBR Layout, Bengaluru',
    coords: [13.0350, 77.6300], area: 'North-East',
    chargers: [
      { code: 'BESKABLRAC00038', model: 'IEC AC 10kW' },
    ],
    totalChargers: 1,
    types: ['IEC AC 10kW'],
  },
  {
    id: 'bescom-thalaghattapura', name: 'BESCOM Thalaghattapura O&M', location: 'Thalaghattapura, Bengaluru',
    coords: [12.8680, 77.5400], area: 'South',
    chargers: [
      { code: 'BESAC0522112', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 1,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-iti-layout', name: 'BESCOM ITI Layout O&M', location: 'ITI Layout, Bengaluru',
    coords: [12.9100, 77.6150], area: 'South',
    chargers: [
      { code: 'BESAC0522119', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 1,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-bommanahalli', name: 'BESCOM Bommanahalli SDO', location: 'Bommanahalli, Bengaluru',
    coords: [12.9000, 77.6200], area: 'South-East',
    chargers: [
      { code: 'BESAC0522120', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 1,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-vasantapura', name: 'BESCOM Vasantapura O&M', location: 'Vasantapura, Bengaluru',
    coords: [12.8850, 77.5600], area: 'South',
    chargers: [
      { code: 'BESAC0522116', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 1,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-goripalya', name: 'BESCOM Goripalya O&M', location: 'Goripalya, Bengaluru',
    coords: [12.9580, 77.5550], area: 'West',
    chargers: [
      { code: 'BESAC052200080', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-peenya-div', name: 'BESCOM Peenya Division', location: 'Peenya, Bengaluru',
    coords: [13.0280, 77.5180], area: 'North-West',
    chargers: [
      { code: 'BESAC052200089', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-tasker-town', name: 'BESCOM Tasker Town O&M', location: 'Tasker Town, Bengaluru',
    coords: [12.9850, 77.5900], area: 'Central',
    chargers: [
      { code: 'BESAC052200077', model: 'PENTA IEC 3.3kW' },
      { code: 'BESAC052200076', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 2,
    types: ['PENTA IEC 3.3kW'],
  },
  {
    id: 'bescom-moodalapalya', name: 'BESCOM Moodalapalya SDO', location: 'Moodalapalya, Bengaluru',
    coords: [12.9550, 77.5200], area: 'West',
    chargers: [
      { code: 'BESAC0522143', model: 'EVRE-WX-3.3kW' },
      { code: 'BESAC0522144', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 2,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-mallathahalli-n8', name: 'BESCOM Mallathahalli SDO', location: 'Mallathahalli, Bengaluru',
    coords: [12.9520, 77.5080], area: 'West',
    chargers: [
      { code: 'BESAC0522138', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 1,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-jp-nagar-s14', name: 'BESCOM JP Nagar S14 SDO', location: 'JP Nagar Phase 5, Bengaluru',
    coords: [12.9020, 77.5820], area: 'South',
    chargers: [
      { code: 'BESAC0522110', model: 'EVRE-WX-3.3kW' },
      { code: 'BESAC0522109', model: 'EVRE-WX-3.3kW' },
    ],
    totalChargers: 2,
    types: ['EVRE-WX-3.3kW'],
  },
  {
    id: 'bescom-sulibele', name: 'BESCOM Sulibele Section', location: 'Sulibele, Bengaluru Rural',
    coords: [13.1000, 77.7500], area: 'East',
    chargers: [
      { code: 'BESAC052200020', model: 'PENTA IEC 3.3kW' },
    ],
    totalChargers: 1,
    types: ['PENTA IEC 3.3kW'],
  },
];

// Summary stats
export const BESCOM_STATS = {
  totalLocations: BESCOM_EV_STATIONS.length,
  totalChargers: BESCOM_EV_STATIONS.reduce((sum, s) => sum + s.totalChargers, 0),
  chargerTypes: {
    'GB/T IEC AC Combo': 'AC fast charging, supports Chinese GB/T standard',
    'CCS CHAdeMO Combo': 'DC fast charging, CCS2 + CHAdeMO dual connector, 50kW',
    'IEC AC 10kW': 'AC slow charging, IEC 60309 standard, 10kW',
    'EVRE-WX-3.3kW': 'AC slow charging, EVRE Wall-mounted, 3.3kW for 2-wheelers & small EVs',
    'PENTA IEC 3.3kW': 'AC slow charging, Penta brand, 3.3kW for 2-wheelers & small EVs',
  },
  areas: ['Central', 'North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'],
};
