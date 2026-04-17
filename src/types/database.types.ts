// ============================================================
// Database Types — Auto-generated style (manual for now)
// Replace with `npx supabase gen types` when DB is live
// ============================================================

export type UserRole =
  | 'admin'
  | 'gestor_comercial'
  | 'vendedor'
  | 'coordenador'
  | 'atendente_secretaria';

export type ContactSource =
  | 'chatwoot'
  | 'manual'
  | 'formulario'
  | 'indicacao'
  | 'site'
  | 'outro';

export type InteractionType =
  | 'ligacao'
  | 'whatsapp'
  | 'email'
  | 'reuniao'
  | 'visita'
  | 'outro';

export type RequestType =
  | 'info_curso'
  | 'matricula'
  | 'financeiro'
  | 'documentacao'
  | 'outro';

export type RequestStatus =
  | 'aberto'
  | 'em_andamento'
  | 'aguardando_cliente'
  | 'resolvido'
  | 'cancelado';

export type RequestPriority = 'baixa' | 'normal' | 'alta' | 'urgente';

// ---- Row types ----

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  team?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  company?: string | null;
  source: ContactSource;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  position: number;
  color: string;
  is_won: boolean;
  is_lost: boolean;
  active: boolean;
  created_at: string;
}

export interface Deal {
  id: string;
  contact_id: string;
  title: string;
  value?: number | null;
  stage_id: string;
  assigned_to?: string | null;
  course_interest?: string | null;
  expected_close_date?: string | null;
  lost_reason?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  contact?: Contact;
  stage?: PipelineStage;
  assigned_profile?: Profile;
}

export interface Interaction {
  id: string;
  deal_id?: string | null;
  contact_id: string;
  user_id: string;
  type: InteractionType;
  notes?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
  chatwoot_conversation_id?: string | null;
  created_at: string;
  // Joined fields
  user?: Profile;
}

export interface Request {
  id: string;
  contact_id: string;
  assigned_to?: string | null;
  type: RequestType;
  course_id?: string | null;
  status: RequestStatus;
  priority: RequestPriority;
  notes?: string | null;
  internal_notes?: string | null;
  chatwoot_conversation_id?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  // Joined fields
  contact?: Contact;
  course?: Course;
  assigned_profile?: Profile;
}

export interface Course {
  id: string;
  name: string;
  modality?: string | null;
  duration_hours?: number | null;
  price?: number | null;
  description?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatwootConversation {
  id: string;
  chatwoot_id: string;
  contact_id?: string | null;
  deal_id?: string | null;
  request_id?: string | null;
  assigned_to?: string | null;
  inbox_id?: string | null;
  status: string;
  labels?: string[];
  conversation_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResponseTemplate {
  id: string;
  title: string;
  category?: string | null;
  content: string;
  variables?: string[];
  is_global: boolean;
  created_by?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message?: string | null;
  type: string;
  reference_type?: string | null;
  reference_id?: string | null;
  read: boolean;
  created_at: string;
}

// ---- Insert types ----

export type ContactInsert = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;
export type DealInsert = Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'contact' | 'stage' | 'assigned_profile'>;
export type InteractionInsert = Omit<Interaction, 'id' | 'created_at' | 'user'>;
export type RequestInsert = Omit<Request, 'id' | 'created_at' | 'updated_at' | 'resolved_at' | 'contact' | 'course' | 'assigned_profile'>;

// ---- Update types ----

export type ContactUpdate = Partial<ContactInsert>;
export type DealUpdate = Partial<DealInsert>;
export type RequestUpdate = Partial<RequestInsert>;

