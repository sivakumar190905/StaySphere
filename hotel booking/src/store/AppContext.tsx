import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken } from '../services/api';

export interface RoomNumberInfo {
  number: string;
  status: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Maintenance' | 'Blocked';
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: string; // 'deluxe' | 'suite' | 'standard' | 'family'
  price: number;
  capacity: { guests: number; beds: number };
  amenities: string[];
  images: string[];
  availableCount: number;
  sizeSqFt: number;
  status: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Maintenance';
  roomNumbers: RoomNumberInfo[];
}

export interface Review {
  id: string;
  guestName: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  positivePoints?: string;
  negativePoints?: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  stars: number;
  rating: number;
  reviewCount: number;
  description: string;
  images: string[];
  amenities: string[];
  basePrice: number;
  tag?: string; // 'Best Seller' | 'Luxury Stay' etc.
  rooms: Room[];
  reviews: Review[];
  featured?: boolean;
  status?: string;
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  guestDetails: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  paymentMethod: string;
  status: 'Pending Approval' | 'Confirmed' | 'Room Assigned' | 'Checked-In' | 'Checked-Out' | 'Cancelled' | 'Refunded';
  createdAt: string;
  couponCode?: string;
  discountAmount?: number;
  cgst?: number;
  sgst?: number;
  gstCompany?: string;
  gstin?: string;
  assignedRoomNumber?: string;
  qrCodeToken?: string;
}

export type UserRole = 'guest' | 'owner' | 'admin';

export interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'PARTNER' | 'STAFF' | 'ADMIN';
  avatar?: string;
}

export interface NotificationInfo {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface GuestRequestInfo {
  id: number;
  bookingId: string;
  hotelName: string;
  roomNumber: string;
  requestType: string;
  details: string;
  status: string; // 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'
  createdAt?: string;
}

export interface SupportTicketInfo {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  subject: string;
  description: string;
  status: string; // 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
  priority: string;
  createdAt?: string;
}

export interface OperationalRoomInfo {
  id: number;
  number: string;
  status: string; // 'Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance', 'Blocked'
  roomId: string;
  roomName: string;
  hotelId: string;
  hotelName: string;
}

export interface MaintenanceTicketInfo {
  id: number;
  roomNumberId: number;
  roomNumber: string;
  roomName: string;
  hotelName: string;
  description: string;
  status: string; // 'OPEN', 'RESOLVED'
  createdAt?: string;
}

interface AppContextType {
  hotels: Hotel[];
  bookings: Booking[];
  favorites: string[];
  currentRole: UserRole;
  searchParams: SearchParams;
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  notifications: NotificationInfo[];
  guestRequests: GuestRequestInfo[];
  supportTickets: SupportTicketInfo[];
  operationalRooms: OperationalRoomInfo[];
  maintenanceTickets: MaintenanceTicketInfo[];
  setSearchParams: (params: SearchParams) => void;
  setCurrentRole: (role: UserRole) => void;
  toggleFavorite: (hotelId: string) => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updateBooking: (booking: Booking) => Promise<void>;
  addHotel: (hotel: Omit<Hotel, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => Promise<void>;
  updateHotel: (hotel: Hotel) => Promise<void>;
  deleteHotel: (hotelId: string) => Promise<void>;
  approveHotel: (hotelId: string) => Promise<void>;
  login: (email: string, role: UserProfile['role'], password?: string) => Promise<UserProfile>;
  signUp: (user: UserProfile, password?: string) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  addNotification: (title: string, message: string) => void;
  markNotificationsRead: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  createGuestRequest: (bookingId: string, requestType: string, details: string) => Promise<GuestRequestInfo>;
  updateGuestRequestStatus: (id: number, status: string) => Promise<void>;
  createSupportTicket: (subject: string, description: string, priority?: string) => Promise<SupportTicketInfo>;
  updateSupportTicketStatus: (id: number, status: string) => Promise<void>;
  resolveHousekeeping: (roomNumberId: number) => Promise<void>;
  createMaintenanceTicket: (roomNumberId: number, description: string) => Promise<void>;
  resolveMaintenance: (ticketId: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('staysphere_role') as UserRole) || 'guest';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('staysphere_jwt_token');
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('staysphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [guestRequests, setGuestRequests] = useState<GuestRequestInfo[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketInfo[]>([]);
  const [operationalRooms, setOperationalRooms] = useState<OperationalRoomInfo[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicketInfo[]>([]);
  const [searchParams, setSearchParamsState] = useState<SearchParams>({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
  });

  const setSearchParams = (params: SearchParams) => {
    setSearchParamsState(params);
  };

  // Centralized data loading
  const refreshAllData = useCallback(async () => {
    try {
      // Load hotels (public)
      const hotelsData = await api.hotels.getAll();
      setHotels(hotelsData);

      // Load auth-dependent data
      if (localStorage.getItem('staysphere_jwt_token')) {
        // Load User Profile
        const profile = await api.auth.me();
        setCurrentUser(profile);
        localStorage.setItem('staysphere_user', JSON.stringify(profile));

        // Load Bookings based on role
        let bookingsData: Booking[] = [];
        if (profile.role === 'PARTNER') {
          bookingsData = await api.bookings.getPartner();
        } else if (profile.role === 'STAFF' || profile.role === 'ADMIN') {
          bookingsData = await api.bookings.getAll();
        } else {
          bookingsData = await api.bookings.getMy();
        }
        setBookings(bookingsData);

        // Load favorites
        const favHotels = await api.hotels.getFavorites();
        setFavorites(favHotels.map((h: Hotel) => h.id));

        // Load notifications
        const notifs = await api.notifications.getAll();
        setNotifications(notifs);

        // Load requests and tickets
        try {
          const reqs = await api.business.getGuestRequests();
          setGuestRequests(reqs);
        } catch (e) {
          console.error("Failed to load guest requests:", e);
        }
        try {
          const tix = await api.business.getSupportTickets();
          setSupportTickets(tix);
        } catch (e) {
          console.error("Failed to load support tickets:", e);
        }

        // Load operational rooms and maintenance tickets if staff/partner/admin
        if (profile.role === 'PARTNER' || profile.role === 'STAFF' || profile.role === 'ADMIN') {
          try {
            const rooms = await api.operations.getRooms();
            setOperationalRooms(rooms);
          } catch (e) {
            console.error("Failed to load operational rooms:", e);
          }
          try {
            const maint = await api.operations.getMaintenanceTickets();
            setMaintenanceTickets(maint);
          } catch (e) {
            console.error("Failed to load maintenance tickets:", e);
          }
        } else {
          setOperationalRooms([]);
          setMaintenanceTickets([]);
        }
      } else {
        setBookings([]);
        setFavorites([]);
        setNotifications([]);
        setGuestRequests([]);
        setSupportTickets([]);
        setOperationalRooms([]);
        setMaintenanceTickets([]);
      }
    } catch (error) {
      console.error('Error fetching data from API:', error);
      // Auto logout if auth call failed (meaning token is likely invalid/expired)
      if (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) {
        setToken(null);
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('staysphere_user');
      }
    }
  }, []);

  // Fetch initial data on load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData, isAuthenticated]);

  const toggleFavorite = async (hotelId: string) => {
    try {
      await api.hotels.toggleFavorite(hotelId);
      setFavorites((prev) =>
        prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
      );
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
      throw e;
    }
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
      const saved = await api.bookings.create(bookingData);
      await refreshAllData();
      return saved;
    } catch (e) {
      console.error('Failed to add booking:', e);
      throw e;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await api.bookings.cancel(bookingId);
      await refreshAllData();
    } catch (e) {
      console.error('Failed to cancel booking:', e);
      throw e;
    }
  };

  const updateBooking = async (updatedBooking: Booking) => {
    try {
      await api.bookings.update(updatedBooking.id, updatedBooking);
      await refreshAllData();
    } catch (e) {
      console.error('Failed to update booking:', e);
      throw e;
    }
  };

  const addHotel = async (hotelData: Omit<Hotel, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => {
    try {
      await api.hotels.create(hotelData);
      await refreshAllData();
    } catch (e) {
      console.error('Failed to add hotel:', e);
      throw e;
    }
  };

  const updateHotel = async (updatedHotel: Hotel) => {
    try {
      await api.hotels.update(updatedHotel.id, updatedHotel);
      await refreshAllData();
    } catch (e) {
      console.error('Failed to update hotel:', e);
      throw e;
    }
  };

  const deleteHotel = async (hotelId: string) => {
    try {
      await api.hotels.delete(hotelId);
      await refreshAllData();
    } catch (e) {
      console.error('Failed to delete hotel:', e);
      throw e;
    }
  };

  const approveHotel = async (hotelId: string) => {
    try {
      await api.hotels.approve(hotelId);
      await refreshAllData();
    } catch (e) {
      console.error('Failed to approve hotel:', e);
      throw e;
    }
  };

  // Auth Functions
  const login = async (email: string, _role: UserProfile['role'], password?: string) => {
    try {
      if (!password) throw new Error('Password is required');
      const authData = await api.auth.login(email, password);
      setIsAuthenticated(true);
      
      const profile: UserProfile = {
        firstName: authData.firstName,
        lastName: authData.lastName,
        email: authData.email,
        phone: authData.phone,
        role: authData.role,
        avatar: authData.avatar
      };
      
      setCurrentUser(profile);
      localStorage.setItem('staysphere_user', JSON.stringify(profile));

      // Sync role types
      if (profile.role === 'PARTNER') {
        setCurrentRole('owner');
        localStorage.setItem('staysphere_role', 'owner');
      } else if (profile.role === 'ADMIN') {
        setCurrentRole('admin');
        localStorage.setItem('staysphere_role', 'admin');
      } else {
        setCurrentRole('guest');
        localStorage.setItem('staysphere_role', 'guest');
      }
      
      await refreshAllData();
      return profile;
    } catch (e) {
      console.error('Failed to sign in:', e);
      throw e;
    }
  };

  const signUp = async (user: UserProfile, password?: string) => {
    try {
      if (!password) throw new Error('Password is required');
      // Register with the backend API
      await api.auth.register({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        password: password,
        role: user.role
      });
    } catch (e) {
      console.error('Failed to sign up:', e);
      throw e;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const updatedProfile = await api.auth.updateProfile(profileData);
      const newProfile: UserProfile = {
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        role: updatedProfile.role,
        avatar: updatedProfile.avatar
      };
      setCurrentUser(newProfile);
      localStorage.setItem('staysphere_user', JSON.stringify(newProfile));
      await refreshAllData();
    } catch (e) {
      console.error('Failed to update profile:', e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Clean up local states even if network request fails
    }
    setToken(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentRole('guest');
    localStorage.removeItem('staysphere_user');
    localStorage.setItem('staysphere_role', 'guest');
    setBookings([]);
    setFavorites([]);
    setNotifications([]);
    setGuestRequests([]);
    setSupportTickets([]);
    setOperationalRooms([]);
    setMaintenanceTickets([]);
  };

  const addNotification = (_title: string, _message: string) => {
    // Legacy support, backend handles notifications on events
  };

  const markNotificationsRead = async () => {
    try {
      await api.notifications.markRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error('Failed to mark notifications read:', e);
    }
  };

  const createGuestRequest = async (bookingId: string, requestType: string, details: string) => {
    try {
      const saved = await api.business.createGuestRequest(bookingId, requestType, details);
      const reqs = await api.business.getGuestRequests();
      setGuestRequests(reqs);
      return saved;
    } catch (e) {
      console.error('Failed to create guest request:', e);
      throw e;
    }
  };

  const updateGuestRequestStatus = async (id: number, status: string) => {
    try {
      await api.business.updateRequestStatus(id, status);
      const reqs = await api.business.getGuestRequests();
      setGuestRequests(reqs);
    } catch (e) {
      console.error('Failed to update guest request status:', e);
      throw e;
    }
  };

  const createSupportTicket = async (subject: string, description: string, priority?: string) => {
    try {
      const saved = await api.business.createSupportTicket(subject, description, priority);
      const tix = await api.business.getSupportTickets();
      setSupportTickets(tix);
      return saved;
    } catch (e) {
      console.error('Failed to create support ticket:', e);
      throw e;
    }
  };

  const updateSupportTicketStatus = async (id: number, status: string) => {
    try {
      await api.business.updateTicketStatus(id, status);
      const tix = await api.business.getSupportTickets();
      setSupportTickets(tix);
    } catch (e) {
      console.error('Failed to update support ticket status:', e);
      throw e;
    }
  };

  const resolveHousekeeping = async (roomNumberId: number) => {
    try {
      await api.operations.resolveHousekeeping(roomNumberId);
      await refreshAllData();
    } catch (e) {
      console.error('Failed to resolve housekeeping:', e);
      throw e;
    }
  };

  const createMaintenanceTicket = async (roomNumberId: number, description: string) => {
    try {
      await api.operations.createMaintenanceTicket(roomNumberId, description);
      await refreshAllData();
    } catch (e) {
      console.error('Failed to create maintenance ticket:', e);
      throw e;
    }
  };

  const resolveMaintenance = async (ticketId: number) => {
    try {
      await api.operations.resolveMaintenance(ticketId);
      await refreshAllData();
    } catch (e) {
      console.error('Failed to resolve maintenance:', e);
      throw e;
    }
  };

  return (
    <AppContext.Provider
      value={{
        hotels,
        bookings,
        favorites,
        currentRole,
        searchParams,
        isAuthenticated,
        currentUser,
        notifications,
        guestRequests,
        supportTickets,
        operationalRooms,
        maintenanceTickets,
        setSearchParams,
        setCurrentRole,
        toggleFavorite,
        addBooking,
        cancelBooking,
        updateBooking,
        addHotel,
        updateHotel,
        deleteHotel,
        approveHotel,
        login,
        signUp,
        updateProfile,
        logout,
        addNotification,
        markNotificationsRead,
        refreshAllData,
        createGuestRequest,
        updateGuestRequestStatus,
        createSupportTicket,
        updateSupportTicketStatus,
        resolveHousekeeping,
        createMaintenanceTicket,
        resolveMaintenance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

