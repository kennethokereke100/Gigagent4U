import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface VenueResult {
  place_id: string;
  name: string;
  formatted_address: string;
  photo_reference?: string;
}

export default function VenueSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VenueResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleBack = () => {
    router.back();
  };

  // Helper function to map talent types to relevant venues
  const getTalentToVenueMatches = (query: string, venueName: string) => {
    const talentMappings = {
      // Combat Sports - From TALENT_CATEGORIES
      'wrestling': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'wrestle': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'wrestler': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'boxing': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'boxer': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'box': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'mma': ['arena', 'center', 'stadium', 'garden', 'palace'],
      'ufc': ['arena', 'center', 'stadium', 'garden', 'palace'],
      'ufc athlete': ['arena', 'center', 'stadium', 'garden', 'palace'],
      'fighting': ['arena', 'center', 'stadium', 'garden', 'palace'],
      'fight': ['arena', 'center', 'stadium', 'garden', 'palace'],
      'combat': ['arena', 'center', 'stadium', 'garden', 'palace'],
      
      // Comedy - From TALENT_CATEGORIES
      'comedy': ['theater', 'theatre', 'hall', 'club', 'center', 'comedy'],
      'comedian': ['theater', 'theatre', 'hall', 'club', 'center', 'comedy'],
      'comic': ['theater', 'theatre', 'hall', 'club', 'center', 'comedy'],
      'standup': ['theater', 'theatre', 'hall', 'club', 'center', 'comedy'],
      'stand-up': ['theater', 'theatre', 'hall', 'club', 'center', 'comedy'],
      
      // Music - From TALENT_CATEGORIES
      'music': ['arena', 'center', 'stadium', 'garden', 'theater', 'hall', 'bowl', 'amphitheater'],
      'musician': ['arena', 'center', 'stadium', 'garden', 'theater', 'hall', 'bowl', 'amphitheater'],
      'concert': ['arena', 'center', 'stadium', 'garden', 'theater', 'hall', 'bowl', 'amphitheater'],
      'band': ['arena', 'center', 'stadium', 'garden', 'theater', 'hall', 'bowl', 'amphitheater'],
      'dj': ['club', 'nightclub', 'arena', 'center', 'stadium', 'garden'],
      'dance': ['club', 'nightclub', 'arena', 'center', 'stadium', 'garden', 'ballroom'],
      'dancing': ['club', 'nightclub', 'arena', 'center', 'stadium', 'garden', 'ballroom'],
      'singer': ['arena', 'center', 'stadium', 'garden', 'theater', 'hall', 'bowl', 'amphitheater'],
      'vocalist': ['arena', 'center', 'stadium', 'garden', 'theater', 'hall', 'bowl', 'amphitheater'],
      
      // Sports Officials - From TALENT_CATEGORIES
      'referee': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'ref': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'official': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'ring announcer': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'announcer': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'cutman': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'cut man': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'coach': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'trainer': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      
      // Traditional Sports
      'basketball': ['arena', 'center', 'stadium', 'garden'],
      'football': ['stadium', 'field', 'park'],
      'baseball': ['stadium', 'field', 'park'],
      'hockey': ['arena', 'center', 'stadium', 'garden'],
      'soccer': ['stadium', 'field', 'park', 'arena'],
      'tennis': ['center', 'stadium', 'park', 'club'],
      'golf': ['club', 'course', 'center'],
      
      // Events & Shows
      'theater': ['theater', 'theatre', 'hall', 'center'],
      'theatre': ['theater', 'theatre', 'hall', 'center'],
      'show': ['theater', 'theatre', 'hall', 'arena', 'center', 'stadium'],
      'performance': ['theater', 'theatre', 'hall', 'arena', 'center'],
      'exhibition': ['center', 'hall', 'arena', 'stadium', 'expo'],
      'convention': ['center', 'hall', 'arena', 'stadium', 'expo'],
      'expo': ['center', 'hall', 'arena', 'stadium', 'expo'],
      'trade show': ['center', 'hall', 'arena', 'stadium', 'expo'],
      
      // Nightlife & Entertainment
      'party': ['club', 'nightclub', 'arena', 'center', 'stadium', 'garden'],
      'nightlife': ['club', 'nightclub', 'arena', 'center', 'stadium', 'garden'],
      'drinks': ['club', 'nightclub', 'bar', 'lounge', 'arena', 'center'],
      'bar': ['club', 'nightclub', 'bar', 'lounge', 'arena', 'center'],
      'lounge': ['club', 'nightclub', 'bar', 'lounge', 'arena', 'center'],
      'nightclub': ['club', 'nightclub', 'bar', 'lounge', 'arena', 'center'],
      'club': ['club', 'nightclub', 'bar', 'lounge', 'arena', 'center'],
      
      // Adult Entertainment
      'strip': ['club', 'nightclub', 'cabaret', 'gentlemen'],
      'adult': ['club', 'nightclub', 'cabaret', 'gentlemen'],
      'gentlemen': ['club', 'nightclub', 'cabaret'],
      'cabaret': ['club', 'nightclub', 'cabaret', 'gentlemen'],
      
      // Corporate & Business - From PROMOTER_CATEGORIES
      'corporate': ['center', 'hall', 'arena', 'stadium', 'convention'],
      'business': ['center', 'hall', 'arena', 'stadium', 'convention'],
      'conference': ['center', 'hall', 'arena', 'stadium', 'convention'],
      'meeting': ['center', 'hall', 'arena', 'stadium', 'convention'],
      'event organizer': ['center', 'hall', 'arena', 'stadium', 'convention'],
      'organizer': ['center', 'hall', 'arena', 'stadium', 'convention'],
      'matchmaker': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'venue owner': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater', 'club', 'nightclub'],
      'talent scout': ['arena', 'center', 'stadium', 'garden', 'palace', 'theater'],
      'brand partner': ['center', 'hall', 'arena', 'stadium', 'convention'],
      'media': ['center', 'hall', 'arena', 'stadium', 'convention'],
      'press': ['center', 'hall', 'arena', 'stadium', 'convention'],
      'sponsor': ['center', 'hall', 'arena', 'stadium', 'convention'],
      'street team': ['center', 'hall', 'arena', 'stadium', 'convention'],
      
      // Additional Entertainment Types
      'magic': ['theater', 'theatre', 'hall', 'club', 'center'],
      'magician': ['theater', 'theatre', 'hall', 'club', 'center'],
      'circus': ['center', 'hall', 'arena', 'stadium'],
      'carnival': ['center', 'hall', 'arena', 'stadium', 'park'],
      'festival': ['center', 'hall', 'arena', 'stadium', 'park'],
      'fair': ['center', 'hall', 'arena', 'stadium', 'park'],
    };

    for (const [talent, venueTypes] of Object.entries(talentMappings)) {
      if (query.includes(talent)) {
        return venueTypes.some(type => venueName.includes(type));
      }
    }
    
    return false;
  };

  // Helper function for city-based matching
  const getCityMatches = (query: string, venueAddress: string) => {
    const cities = [
      'houston', 'new york', 'los angeles', 'chicago', 'miami', 'las vegas',
      'boston', 'philadelphia', 'atlanta', 'dallas', 'san francisco', 'seattle',
      'denver', 'phoenix', 'detroit', 'cleveland', 'pittsburgh', 'baltimore',
      'nashville', 'austin', 'portland', 'minneapolis', 'milwaukee', 'cincinnati'
    ];
    
    return cities.some(city => 
      query.includes(city) && venueAddress.includes(city.charAt(0).toUpperCase() + city.slice(1))
    );
  };

  // Helper function for venue type matching
  const getVenueTypeMatches = (query: string, venueName: string) => {
    const venueTypes = [
      'stadium', 'arena', 'center', 'garden', 'theater', 'theatre', 'hall',
      'club', 'nightclub', 'bar', 'lounge', 'palace', 'field', 'park',
      'bowl', 'amphitheater', 'ballroom', 'casino', 'expo', 'convention',
      'auditorium', 'pavilion', 'cabaret', 'gentlemen'
    ];
    
    return venueTypes.some(type => 
      query.includes(type) && venueName.includes(type)
    );
  };

  // Helper function for venue name matching (exact and partial)
  const getVenueNameMatches = (query: string, venueName: string) => {
    // Remove common venue type suffixes for better matching
    const cleanVenueName = venueName
      .replace(/\s+(stadium|arena|center|garden|theater|theatre|hall|club|nightclub|bar|lounge|palace|field|park|bowl|amphitheater|ballroom|casino|expo|convention|auditorium|pavilion|cabaret|gentlemen)$/i, '')
      .trim();
    
    // Exact venue name match
    if (cleanVenueName === query) return true;
    
    // Partial venue name match (3+ characters)
    if (query.length >= 3 && cleanVenueName.includes(query)) return true;
    
    // Word-based partial matching for venue names
    const venueWords = cleanVenueName.split(/\s+/);
    const queryWords = query.split(/\s+/);
    
    // Check if any query word matches the beginning of any venue word (3+ chars)
    return queryWords.some(queryWord => 
      queryWord.length >= 3 && 
      venueWords.some(venueWord => venueWord.startsWith(queryWord))
    );
  };

  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // TODO: Replace with actual Google Places Autocomplete API call
      // For now, using comprehensive mock data with diverse entertainment venues
      const allVenues: VenueResult[] = [
        // New York
        {
          place_id: '1',
          name: 'Madison Square Garden',
          formatted_address: '4 Pennsylvania Plaza, New York, NY 10001, USA',
          photo_reference: 'mock_photo_ref_1',
        },
        {
          place_id: '2',
          name: 'Barclays Center',
          formatted_address: '620 Atlantic Ave, Brooklyn, NY 11217, USA',
          photo_reference: 'mock_photo_ref_2',
        },
        {
          place_id: '3',
          name: 'Radio City Music Hall',
          formatted_address: '1260 6th Ave, New York, NY 10020, USA',
          photo_reference: 'mock_photo_ref_3',
        },
        {
          place_id: '4',
          name: 'Yankee Stadium',
          formatted_address: '1 E 161st St, Bronx, NY 10451, USA',
          photo_reference: 'mock_photo_ref_4',
        },
        {
          place_id: '5',
          name: 'Citi Field',
          formatted_address: '123-01 Roosevelt Ave, Queens, NY 11368, USA',
          photo_reference: 'mock_photo_ref_5',
        },
        {
          place_id: '6',
          name: 'Marquee Nightclub',
          formatted_address: '289 10th Ave, New York, NY 10001, USA',
          photo_reference: 'mock_photo_ref_6',
        },
        {
          place_id: '7',
          name: 'House of Yes',
          formatted_address: '2 Wyckoff Ave, Brooklyn, NY 11237, USA',
          photo_reference: 'mock_photo_ref_7',
        },
        {
          place_id: '8',
          name: 'Webster Hall',
          formatted_address: '125 E 11th St, New York, NY 10003, USA',
          photo_reference: 'mock_photo_ref_8',
        },
        {
          place_id: '9',
          name: 'The Box',
          formatted_address: '189 Chrystie St, New York, NY 10002, USA',
          photo_reference: 'mock_photo_ref_9',
        },
        {
          place_id: '10',
          name: 'Sapphire New York',
          formatted_address: '333 E 60th St, New York, NY 10022, USA',
          photo_reference: 'mock_photo_ref_10',
        },
        // Los Angeles
        {
          place_id: '11',
          name: 'Staples Center',
          formatted_address: '1111 S Figueroa St, Los Angeles, CA 90015, USA',
          photo_reference: 'mock_photo_ref_11',
        },
        {
          place_id: '12',
          name: 'Hollywood Bowl',
          formatted_address: '2301 N Highland Ave, Hollywood, CA 90068, USA',
          photo_reference: 'mock_photo_ref_12',
        },
        {
          place_id: '13',
          name: 'Dodger Stadium',
          formatted_address: '1000 Vin Scully Ave, Los Angeles, CA 90012, USA',
          photo_reference: 'mock_photo_ref_13',
        },
        {
          place_id: '14',
          name: 'Academy LA',
          formatted_address: '6021 Hollywood Blvd, Los Angeles, CA 90028, USA',
          photo_reference: 'mock_photo_ref_14',
        },
        {
          place_id: '15',
          name: 'Sound Nightclub',
          formatted_address: '1642 N Las Palmas Ave, Los Angeles, CA 90028, USA',
          photo_reference: 'mock_photo_ref_15',
        },
        {
          place_id: '16',
          name: 'The Roxy Theatre',
          formatted_address: '9009 Sunset Blvd, West Hollywood, CA 90069, USA',
          photo_reference: 'mock_photo_ref_16',
        },
        {
          place_id: '17',
          name: 'Spearmint Rhino',
          formatted_address: '1010 S Flower St, Los Angeles, CA 90015, USA',
          photo_reference: 'mock_photo_ref_17',
        },
        // Chicago
        {
          place_id: '18',
          name: 'United Center',
          formatted_address: '1901 W Madison St, Chicago, IL 60612, USA',
          photo_reference: 'mock_photo_ref_18',
        },
        {
          place_id: '19',
          name: 'Wrigley Field',
          formatted_address: '1060 W Addison St, Chicago, IL 60613, USA',
          photo_reference: 'mock_photo_ref_19',
        },
        {
          place_id: '20',
          name: 'The Underground',
          formatted_address: '56 W Illinois St, Chicago, IL 60654, USA',
          photo_reference: 'mock_photo_ref_20',
        },
        {
          place_id: '21',
          name: 'Spybar',
          formatted_address: '646 N Franklin St, Chicago, IL 60654, USA',
          photo_reference: 'mock_photo_ref_21',
        },
        {
          place_id: '22',
          name: 'The Aragon Ballroom',
          formatted_address: '1106 W Lawrence Ave, Chicago, IL 60640, USA',
          photo_reference: 'mock_photo_ref_22',
        },
        // Houston
        {
          place_id: '23',
          name: 'Minute Maid Park',
          formatted_address: '501 Crawford St, Houston, TX 77002, USA',
          photo_reference: 'mock_photo_ref_23',
        },
        {
          place_id: '24',
          name: 'Toyota Center',
          formatted_address: '1510 Polk St, Houston, TX 77002, USA',
          photo_reference: 'mock_photo_ref_24',
        },
        {
          place_id: '25',
          name: 'NRG Stadium',
          formatted_address: '1 NRG Pkwy, Houston, TX 77054, USA',
          photo_reference: 'mock_photo_ref_25',
        },
        {
          place_id: '26',
          name: 'Club Tropicana',
          formatted_address: '1200 Westheimer Rd, Houston, TX 77006, USA',
          photo_reference: 'mock_photo_ref_26',
        },
        {
          place_id: '27',
          name: 'The Secret Group',
          formatted_address: '2101 Polk St, Houston, TX 77003, USA',
          photo_reference: 'mock_photo_ref_27',
        },
        {
          place_id: '28',
          name: 'Stereo Live Houston',
          formatted_address: '6400 Richmond Ave, Houston, TX 77057, USA',
          photo_reference: 'mock_photo_ref_28',
        },
        {
          place_id: '29',
          name: 'Treasures',
          formatted_address: '5647 Westheimer Rd, Houston, TX 77056, USA',
          photo_reference: 'mock_photo_ref_29',
        },
        {
          place_id: '30',
          name: 'The House of Blues',
          formatted_address: '1204 Caroline St, Houston, TX 77002, USA',
          photo_reference: 'mock_photo_ref_30',
        },
        // Miami
        {
          place_id: '31',
          name: 'American Airlines Arena',
          formatted_address: '601 Biscayne Blvd, Miami, FL 33132, USA',
          photo_reference: 'mock_photo_ref_31',
        },
        {
          place_id: '32',
          name: 'Hard Rock Stadium',
          formatted_address: '347 Don Shula Dr, Miami Gardens, FL 33056, USA',
          photo_reference: 'mock_photo_ref_32',
        },
        {
          place_id: '33',
          name: 'LIV Nightclub',
          formatted_address: '4441 Collins Ave, Miami Beach, FL 33140, USA',
          photo_reference: 'mock_photo_ref_33',
        },
        {
          place_id: '34',
          name: 'Story Nightclub',
          formatted_address: '136 Collins Ave, Miami Beach, FL 33139, USA',
          photo_reference: 'mock_photo_ref_34',
        },
        {
          place_id: '35',
          name: 'E11EVEN',
          formatted_address: '29 NE 11th St, Miami, FL 33132, USA',
          photo_reference: 'mock_photo_ref_35',
        },
        {
          place_id: '36',
          name: 'Tootsie\'s Cabaret',
          formatted_address: '150 NW 183rd St, Miami, FL 33169, USA',
          photo_reference: 'mock_photo_ref_36',
        },
        // Las Vegas
        {
          place_id: '37',
          name: 'T-Mobile Arena',
          formatted_address: '3780 S Las Vegas Blvd, Las Vegas, NV 89158, USA',
          photo_reference: 'mock_photo_ref_37',
        },
        {
          place_id: '38',
          name: 'Caesars Palace',
          formatted_address: '3570 S Las Vegas Blvd, Las Vegas, NV 89109, USA',
          photo_reference: 'mock_photo_ref_38',
        },
        {
          place_id: '39',
          name: 'XS Nightclub',
          formatted_address: '3131 S Las Vegas Blvd, Las Vegas, NV 89109, USA',
          photo_reference: 'mock_photo_ref_39',
        },
        {
          place_id: '40',
          name: 'Omnia Nightclub',
          formatted_address: '3570 S Las Vegas Blvd, Las Vegas, NV 89109, USA',
          photo_reference: 'mock_photo_ref_40',
        },
        {
          place_id: '41',
          name: 'Sapphire Las Vegas',
          formatted_address: '3025 S Industrial Rd, Las Vegas, NV 89109, USA',
          photo_reference: 'mock_photo_ref_41',
        },
        // Boston
        {
          place_id: '42',
          name: 'TD Garden',
          formatted_address: '100 Legends Way, Boston, MA 02114, USA',
          photo_reference: 'mock_photo_ref_42',
        },
        {
          place_id: '43',
          name: 'Fenway Park',
          formatted_address: '4 Yawkey Way, Boston, MA 02215, USA',
          photo_reference: 'mock_photo_ref_43',
        },
        {
          place_id: '44',
          name: 'Royale Boston',
          formatted_address: '279 Tremont St, Boston, MA 02116, USA',
          photo_reference: 'mock_photo_ref_44',
        },
        {
          place_id: '45',
          name: 'The Grand',
          formatted_address: '58 Seaport Blvd, Boston, MA 02210, USA',
          photo_reference: 'mock_photo_ref_45',
        },
        // Philadelphia
        {
          place_id: '46',
          name: 'Wells Fargo Center',
          formatted_address: '3601 S Broad St, Philadelphia, PA 19148, USA',
          photo_reference: 'mock_photo_ref_46',
        },
        {
          place_id: '47',
          name: 'Citizens Bank Park',
          formatted_address: '1 Citizens Bank Way, Philadelphia, PA 19148, USA',
          photo_reference: 'mock_photo_ref_47',
        },
        {
          place_id: '48',
          name: 'NOTO Philadelphia',
          formatted_address: '1209 Vine St, Philadelphia, PA 19107, USA',
          photo_reference: 'mock_photo_ref_48',
        },
        // Atlanta
        {
          place_id: '49',
          name: 'State Farm Arena',
          formatted_address: '1 State Farm Dr, Atlanta, GA 30303, USA',
          photo_reference: 'mock_photo_ref_49',
        },
        {
          place_id: '50',
          name: 'Mercedes-Benz Stadium',
          formatted_address: '1 AMB Dr NW, Atlanta, GA 30313, USA',
          photo_reference: 'mock_photo_ref_50',
        },
        {
          place_id: '51',
          name: 'Magic City',
          formatted_address: '1688 Stewart Ave SW, Atlanta, GA 30310, USA',
          photo_reference: 'mock_photo_ref_51',
        },
        {
          place_id: '52',
          name: 'Opera Nightclub',
          formatted_address: '1150 Crescent Ave NE, Atlanta, GA 30309, USA',
          photo_reference: 'mock_photo_ref_52',
        },
        // Dallas
        {
          place_id: '53',
          name: 'AT&T Stadium',
          formatted_address: '1 AT&T Way, Arlington, TX 76011, USA',
          photo_reference: 'mock_photo_ref_53',
        },
        {
          place_id: '54',
          name: 'American Airlines Center',
          formatted_address: '2500 Victory Ave, Dallas, TX 75219, USA',
          photo_reference: 'mock_photo_ref_54',
        },
        {
          place_id: '55',
          name: 'The Bomb Factory',
          formatted_address: '2713 Canton St, Dallas, TX 75226, USA',
          photo_reference: 'mock_photo_ref_55',
        },
        // San Francisco
        {
          place_id: '56',
          name: 'Oracle Park',
          formatted_address: '24 Willie Mays Plaza, San Francisco, CA 94107, USA',
          photo_reference: 'mock_photo_ref_56',
        },
        {
          place_id: '57',
          name: 'Chase Center',
          formatted_address: '1 Warriors Way, San Francisco, CA 94158, USA',
          photo_reference: 'mock_photo_ref_57',
        },
        {
          place_id: '58',
          name: 'The Fillmore',
          formatted_address: '1805 Geary Blvd, San Francisco, CA 94115, USA',
          photo_reference: 'mock_photo_ref_58',
        },
        // Seattle
        {
          place_id: '59',
          name: 'T-Mobile Park',
          formatted_address: '1250 1st Ave S, Seattle, WA 98134, USA',
          photo_reference: 'mock_photo_ref_59',
        },
        {
          place_id: '60',
          name: 'Climate Pledge Arena',
          formatted_address: '334 1st Ave N, Seattle, WA 98109, USA',
          photo_reference: 'mock_photo_ref_60',
        },
        {
          place_id: '61',
          name: 'Showbox',
          formatted_address: '1426 1st Ave, Seattle, WA 98101, USA',
          photo_reference: 'mock_photo_ref_61',
        },
        // Famous Stadiums and Venues
        {
          place_id: '62',
          name: 'MetLife Stadium',
          formatted_address: '1 MetLife Stadium Dr, East Rutherford, NJ 07073, USA',
          photo_reference: 'mock_photo_ref_62',
        },
        {
          place_id: '63',
          name: 'Lambeau Field',
          formatted_address: '1265 Lombardi Ave, Green Bay, WI 54304, USA',
          photo_reference: 'mock_photo_ref_63',
        },
        {
          place_id: '64',
          name: 'Fenway Park',
          formatted_address: '4 Yawkey Way, Boston, MA 02215, USA',
          photo_reference: 'mock_photo_ref_64',
        },
        {
          place_id: '65',
          name: 'Wrigley Field',
          formatted_address: '1060 W Addison St, Chicago, IL 60613, USA',
          photo_reference: 'mock_photo_ref_65',
        },
        {
          place_id: '66',
          name: 'Yankee Stadium',
          formatted_address: '1 E 161st St, Bronx, NY 10451, USA',
          photo_reference: 'mock_photo_ref_66',
        },
        {
          place_id: '67',
          name: 'Dodger Stadium',
          formatted_address: '1000 Vin Scully Ave, Los Angeles, CA 90012, USA',
          photo_reference: 'mock_photo_ref_67',
        },
        {
          place_id: '68',
          name: 'AT&T Stadium',
          formatted_address: '1 AT&T Way, Arlington, TX 76011, USA',
          photo_reference: 'mock_photo_ref_68',
        },
        {
          place_id: '69',
          name: 'Mercedes-Benz Stadium',
          formatted_address: '1 AMB Dr NW, Atlanta, GA 30313, USA',
          photo_reference: 'mock_photo_ref_69',
        },
        {
          place_id: '70',
          name: 'Hard Rock Stadium',
          formatted_address: '347 Don Shula Dr, Miami Gardens, FL 33056, USA',
          photo_reference: 'mock_photo_ref_70',
        },
        {
          place_id: '71',
          name: 'T-Mobile Park',
          formatted_address: '1250 1st Ave S, Seattle, WA 98134, USA',
          photo_reference: 'mock_photo_ref_71',
        },
        {
          place_id: '72',
          name: 'Oracle Park',
          formatted_address: '24 Willie Mays Plaza, San Francisco, CA 94107, USA',
          photo_reference: 'mock_photo_ref_72',
        },
        {
          place_id: '73',
          name: 'Coors Field',
          formatted_address: '2001 Blake St, Denver, CO 80205, USA',
          photo_reference: 'mock_photo_ref_73',
        },
        {
          place_id: '74',
          name: 'Petco Park',
          formatted_address: '100 Park Blvd, San Diego, CA 92101, USA',
          photo_reference: 'mock_photo_ref_74',
        },
        {
          place_id: '75',
          name: 'Kauffman Stadium',
          formatted_address: '1 Royal Way, Kansas City, MO 64129, USA',
          photo_reference: 'mock_photo_ref_75',
        },
        {
          place_id: '76',
          name: 'Progressive Field',
          formatted_address: '2401 Ontario St, Cleveland, OH 44115, USA',
          photo_reference: 'mock_photo_ref_76',
        },
        {
          place_id: '77',
          name: 'Comerica Park',
          formatted_address: '2100 Woodward Ave, Detroit, MI 48201, USA',
          photo_reference: 'mock_photo_ref_77',
        },
        {
          place_id: '78',
          name: 'Target Field',
          formatted_address: '1 Twins Way, Minneapolis, MN 55403, USA',
          photo_reference: 'mock_photo_ref_78',
        },
        {
          place_id: '79',
          name: 'Busch Stadium',
          formatted_address: '700 Clark Ave, St. Louis, MO 63102, USA',
          photo_reference: 'mock_photo_ref_79',
        },
        {
          place_id: '80',
          name: 'PNC Park',
          formatted_address: '115 Federal St, Pittsburgh, PA 15212, USA',
          photo_reference: 'mock_photo_ref_80',
        },
      ];
      
      // Enhanced filtering logic - search by any 3+ words and return relevant venues
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(' ').filter(word => word.length > 0);
      
      const filteredVenues = allVenues.filter(venue => {
        const venueName = venue.name.toLowerCase();
        const venueAddress = venue.formatted_address.toLowerCase();
        const venueText = `${venueName} ${venueAddress}`;
        
        // Direct name/address match
        const directMatch = venueName.includes(queryLower) || venueAddress.includes(queryLower);
        
        // Word-based matching - if any word from query matches venue
        const wordMatch = queryWords.some(word => 
          venueText.includes(word) || 
          venueName.includes(word) || 
          venueAddress.includes(word)
        );
        
        // Venue name matching - exact and partial matches
        const venueNameMatch = getVenueNameMatches(queryLower, venueName);
        
        // Talent/event type to venue mapping
        const talentToVenueMatch = getTalentToVenueMatches(queryLower, venueName);
        
        // City-based filtering
        const cityMatch = getCityMatches(queryLower, venueAddress);
        
        // Venue type filtering
        const typeMatch = getVenueTypeMatches(queryLower, venueName);
        
        return directMatch || wordMatch || venueNameMatch || talentToVenueMatch || cityMatch || typeMatch;
      });
      
      setSearchResults(filteredVenues);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVenueSelect = (venue: VenueResult) => {
    router.push({
      pathname: '/screen/googlemaps',
      params: {
        venueId: venue.place_id,
        venueName: venue.name,
        venueAddress: venue.formatted_address,
        venuePhotoRef: venue.photo_reference || '',
      },
    });
  };

  const getVenueImageUrl = (venue: VenueResult) => {
    // For mock data, use venue-specific placeholder images
    const venueName = venue.name.toLowerCase();
    
    // Stadiums and Sports Venues
    if (venueName.includes('stadium') || venueName.includes('field') || venueName.includes('park')) {
      return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=100&h=100&fit=crop&crop=center';
    }
    
    // Arenas and Large Venues
    if (venueName.includes('arena') || venueName.includes('center') || venueName.includes('garden')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&crop=center';
    }
    
    // Concert Halls and Theaters
    if (venueName.includes('theater') || venueName.includes('theatre') || venueName.includes('bowl') || venueName.includes('hall')) {
      return 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100&h=100&fit=crop&crop=center';
    }
    
    // Nightclubs and Dance Clubs
    if (venueName.includes('nightclub') || venueName.includes('club') || venueName.includes('underground') || venueName.includes('spybar')) {
      return 'https://images.unsplash.com/photo-1571266028243-e68f8570c9e2?w=100&h=100&fit=crop&crop=center';
    }
    
    // Strip Clubs and Adult Entertainment
    if (venueName.includes('sapphire') || venueName.includes('treasures') || venueName.includes('tootsie') || venueName.includes('magic city') || venueName.includes('spearmint')) {
      return 'https://images.unsplash.com/photo-1571266028243-e68f8570c9e2?w=100&h=100&fit=crop&crop=center';
    }
    
    // Bars and Lounges
    if (venueName.includes('bar') || venueName.includes('lounge') || venueName.includes('house of blues')) {
      return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=100&h=100&fit=crop&crop=center';
    }
    
    // Casinos and Vegas Venues
    if (venueName.includes('caesars') || venueName.includes('palace') || venueName.includes('vegas')) {
      return 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=100&h=100&fit=crop&crop=center';
    }
    
    // Specific famous venues
    if (venueName.includes('madison square')) {
      return 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=100&h=100&fit=crop&crop=center';
    } else if (venueName.includes('radio city')) {
      return 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100&h=100&fit=crop&crop=center';
    } else if (venueName.includes('hollywood bowl')) {
      return 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100&h=100&fit=crop&crop=center';
    }
    
    // Default fallback
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop&crop=center';
  };

  const renderVenueCard = ({ item }: { item: VenueResult }) => (
    <Pressable style={styles.venueCard} onPress={() => handleVenueSelect(item)}>
      <View style={styles.venueImageContainer}>
        <Image
          source={{
            uri: getVenueImageUrl(item),
          }}
          style={styles.venueImage}
          defaultSource={{
            uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop&crop=center',
          }}
        />
      </View>
      <View style={styles.venueInfo}>
        <Text style={styles.venueName}>{item.name}</Text>
        <Text style={styles.venueAddress}>{item.formatted_address}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Find Your Venue</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find your venue (e.g., MetLife, comedian, wrestle, Houston, stadium)"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Searching venues...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderVenueCard}
            keyExtractor={(item) => item.place_id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        ) : searchQuery.length >= 3 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No venues found, try another keyword</Text>
            <Text style={styles.emptySubtext}>Try venue names (MetLife, Fenway), talent types (comedian, wrestle), cities (Houston), or venue types (stadium, arena)</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Search for venues</Text>
            <Text style={styles.emptySubtext}>Type venue names, talent types, cities, or venue types (e.g., MetLife, comedian, wrestle, Houston, stadium)</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsList: {
    paddingHorizontal: 16,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  venueImageContainer: {
    marginRight: 16,
  },
  venueImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
