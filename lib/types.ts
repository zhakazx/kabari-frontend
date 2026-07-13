export type UserRole = "pelanggan" | "kreator" | "penerima_tamu" | "admin";

export type TemplateStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected";

export type EventStatus = "draft" | "active" | "completed" | "cancelled";

export type InvitationCategory = "digital" | "fisik";

export type RsvpStatus = "pending" | "hadir" | "tidak_hadir";

export type CheckInStatus = "belum_check_in" | "sudah_check_in";

export type RsvpConfirmationStatus = "hadir" | "tidak_hadir";

export type CheckInMethod = "qr_scan" | "manual";

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export type PaymentMethod = "va" | "qris" | "transfer";

export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export type NotificationChannel = "whatsapp" | "email" | "in_app";

export type NotificationStatus = "queued" | "sent" | "failed";

export type CheckInResultStatus = "sukses" | "gagal" | "tidak_terdaftar";

export type User = {
  id: string;
  full_name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
};

export type SafeUser = Omit<User, "password_hash">;

export type TemplateCreator = {
  id: string;
  full_name: string;
};

export type Template = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  thumbnail_url?: string | null;
  file_url?: string | null;
  price: number;
  status: TemplateStatus;
  admin_notes?: string | null;
  creator_id: string;
  creator?: TemplateCreator | null;
  created_at: string;
  updated_at?: string;
};

export type Event = {
  id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  venue_address?: string | null;
  maps_url?: string | null;
  gallery_urls?: string | null;
  status: EventStatus;
  pelanggan_id: string;
  template_id?: string;
  template?: Template | null;
  pelanggan?: User | null;
  created_at: string;
  updated_at?: string;
};

export type Invitation = {
  id: string;
  tamu_name: string;
  tamu_phone?: string | null;
  tamu_email?: string | null;
  category: InvitationCategory;
  qr_code_token: string;
  rsvp_status: RsvpStatus;
  jumlah_hadir: number;
  check_in_status: CheckInStatus;
  event_id: string;
  event?: Event | null;
  created_at: string;
  updated_at?: string;
};

export type RsvpConfirmation = {
  id: string;
  invitation_id: string;
  rsvp_status: RsvpConfirmationStatus;
  jumlah_hadir: number;
  message?: string | null;
  is_proxy: boolean;
  proxy_by_user_id?: string;
  proxy_by_user?: User | null;
  confirmed_at: string;
};

export type CheckIn = {
  id: string;
  invitation_id: string;
  invitation?: Invitation | null;
  checked_in_at: string;
  checked_in_by: string;
  checked_in_by_user?: User | null;
  method: CheckInMethod;
};

export type Payment = {
  id: string;
  invoice_number: string;
  payment_method: PaymentMethod;
  amount: number;
  provider: string;
  external_ref?: string | null;
  status: PaymentStatus;
  paid_at?: string;
  order_id: string;
  created_at: string;
};

export type Order = {
  id: string;
  total_amount: number;
  preferred_payment_method?: PaymentMethod | null;
  status: OrderStatus;
  pelanggan_id: string;
  event_id?: string;
  event?: Event | null;
  payments?: Payment[];
  pelanggan?: User | null;
  created_at: string;
  updated_at?: string;
};

export type TemplateSale = {
  id: string;
  royalty_amount: number;
  royalty_percent: number;
  paid_to_creator_at?: string;
  template_id: string;
  template?: Template | null;
  order_id: string;
  order?: Order | null;
  created_at: string;
};

export type Notification = {
  id: string;
  subject: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  user_id: string;
  invitation_id?: string;
  sent_at?: string;
  created_at: string;
};

export type RegisterDto = {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type CreateUserDto = {
  full_name: string;
  email: string;
  password: string;
  role?: UserRole;
};

export type UpdateUserDto = {
  full_name?: string;
  email?: string;
  password?: string;
};

export type CreateEventDto = {
  event_name: string;
  event_date: string;
  venue_name: string;
  venue_address?: string;
  maps_url?: string;
  template_id?: string;
};

export type UpdateEventDto = {
  event_name?: string;
  event_date?: string;
  venue_name?: string;
  venue_address?: string;
  maps_url?: string;
  status?: EventStatus;
};

export type CreateGuestDto = {
  tamu_name: string;
  tamu_phone?: string;
  tamu_email?: string;
  category?: InvitationCategory;
};

export type UpdateRsvpDto = {
  rsvp_status: RsvpStatus;
  jumlah_hadir?: number;
  message?: string;
};

export type CreateRsvpDto = {
  rsvp_status: RsvpConfirmationStatus;
  jumlah_hadir?: number;
  message?: string;
  is_proxy?: boolean;
  proxy_by_user_id?: string;
};

export type CreateCheckInDto = {
  qr_code_token: string;
};

export type CreatePaymentDto = {
  order_id: string;
  payment_method: PaymentMethod;
};

export type UpdateTemplateStatusDto = {
  status: TemplateStatus;
  notes?: string;
};

export type CreateNotificationDto = {
  subject: string;
  message: string;
  channel: NotificationChannel;
  user_id: string;
  invitation_id?: string;
};

export type PaymentCallbackDto = {
  invoice_id: string;
  status: string;
  paid_at?: string;
  reference_no?: string;
  signature: string;
};

export type AuthResult = {
  user_id: string;
  name: string;
  role: UserRole;
  access_token: string;
};

export type EventDashboardStats = {
  total_tamu: string | number;
  hadir: string | number;
  tidak_hadir: string | number;
  belum_rsvp: string | number;
  sudah_check_in: string | number;
};

export type GalleryUploadResult = {
  gallery_urls: string[];
};

export type CheckInResult = {
  tamu_name: string;
  rsvp_status: string;
  check_in_status: CheckInResultStatus;
  message: string;
  event_id: string;
  event_name: string;
};

export type PaymentCreationResult = {
  payment_id: string;
  invoice_number: string;
  virtual_account?: string | null;
  qr_string?: string | null;
  amount: number;
  expired_at: string;
};

export type PlatformKpi = {
  total_users: number;
  users_by_role: Record<string, number>;
  total_events: number;
  events_by_status: Record<string, number>;
  total_templates: number;
  templates_by_status: Record<string, number>;
  total_revenue: number;
  orders_by_status: Record<string, number>;
};

export type EventAnalytics = {
  total_invitations: number;
  rsvp_breakdown: Record<string, number>;
  check_in_breakdown: Record<string, number>;
  attendance_rate: number;
};

export type CreatorAnalytics = {
  creator_id: string;
  creator_name: string;
  total_templates: number;
  total_sales: number;
  total_royalty: number;
};

export type RevenueTrendPoint = {
  date: string | null;
  revenue: string | null;
  orders: string | null;
};

export type PageMeta = {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta?: PageMeta;
};

export type ErrorEnvelope = {
  success: false;
  statusCode: number;
  message: string[];
  timestamp: string;
  path: string;
};

export type Paginated<T> = {
  data: T[];
  meta: PageMeta;
};

export type UserListResponse = {
  data: User[];
  meta: PageMeta;
  counts: Record<string, number>;
};

export type SessionPayload = {
  userId: string;
  name: string;
  role: UserRole;
  accessToken: string;
  expiresAt: number;
};

export type Session = {
  userId: string;
  name: string;
  role: UserRole;
  accessToken: string;
};

export type FormState = {
  errors?: Record<string, string[]>;
  message?: string;
  values?: Record<string, string>;
} | undefined;
