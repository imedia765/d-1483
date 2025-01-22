import { Json } from '../json';
import { DatabaseEnums } from '../enums';

export type MemberTables = {
  members: {
    Row: {
      address: string | null;
      admin_note: string | null;
      auth_user_id: string | null;
      collector: string | null;
      collector_id: string | null;
      cors_enabled: boolean | null;
      created_at: string;
      created_by: string | null;
      date_of_birth: string | null;
      email: string | null;
      emergency_collection_amount: number | null;
      emergency_collection_created_at: string | null;
      emergency_collection_due_date: string | null;
      emergency_collection_status: string | null;
      family_member_dob: string | null;
      family_member_gender: string | null;
      family_member_name: string | null;
      family_member_relationship: string | null;
      full_name: string;
      gender: string | null;
      id: string;
      marital_status: string | null;
      member_number: string;
      membership_type: string | null;
      payment_amount: number | null;
      payment_date: string | null;
      payment_notes: string | null;
      payment_type: string | null;
      phone: string | null;
      postcode: string | null;
      status: string | null;
      ticket_description: string | null;
      ticket_priority: string | null;
      ticket_status: string | null;
      ticket_subject: string | null;
      town: string | null;
      updated_at: string;
      verified: boolean | null;
      yearly_payment_amount: number | null;
      yearly_payment_due_date: string | null;
      yearly_payment_status: string | null;
    };
    Insert: {
      address?: string | null;
      admin_note?: string | null;
      auth_user_id?: string | null;
      collector?: string | null;
      collector_id?: string | null;
      cors_enabled?: boolean | null;
      created_at?: string;
      created_by?: string | null;
      date_of_birth?: string | null;
      email?: string | null;
      emergency_collection_amount?: number | null;
      emergency_collection_created_at?: string | null;
      emergency_collection_due_date?: string | null;
      emergency_collection_status?: string | null;
      family_member_dob?: string | null;
      family_member_gender?: string | null;
      family_member_name?: string | null;
      family_member_relationship?: string | null;
      full_name: string;
      gender?: string | null;
      id?: string;
      marital_status?: string | null;
      member_number: string;
      membership_type?: string | null;
      payment_amount?: number | null;
      payment_date?: string | null;
      payment_notes?: string | null;
      payment_type?: string | null;
      phone?: string | null;
      postcode?: string | null;
      status?: string | null;
      ticket_description?: string | null;
      ticket_priority?: string | null;
      ticket_status?: string | null;
      ticket_subject?: string | null;
      town?: string | null;
      updated_at?: string;
      verified?: boolean | null;
      yearly_payment_amount?: number | null;
      yearly_payment_due_date?: string | null;
      yearly_payment_status?: string | null;
    };
    Update: {
      address?: string | null;
      admin_note?: string | null;
      auth_user_id?: string | null;
      collector?: string | null;
      collector_id?: string | null;
      cors_enabled?: boolean | null;
      created_at?: string;
      created_by?: string | null;
      date_of_birth?: string | null;
      email?: string | null;
      emergency_collection_amount?: number | null;
      emergency_collection_created_at?: string | null;
      emergency_collection_due_date?: string | null;
      emergency_collection_status?: string | null;
      family_member_dob?: string | null;
      family_member_gender?: string | null;
      family_member_name?: string | null;
      family_member_relationship?: string | null;
      full_name?: string;
      gender?: string | null;
      id?: string;
      marital_status?: string | null;
      member_number?: string;
      membership_type?: string | null;
      payment_amount?: number | null;
      payment_date?: string | null;
      payment_notes?: string | null;
      payment_type?: string | null;
      phone?: string | null;
      postcode?: string | null;
      status?: string | null;
      ticket_description?: string | null;
      ticket_priority?: string | null;
      ticket_status?: string | null;
      ticket_subject?: string | null;
      town?: string | null;
      updated_at?: string;
      verified?: boolean | null;
      yearly_payment_amount?: number | null;
      yearly_payment_due_date?: string | null;
      yearly_payment_status?: string | null;
    };
    Relationships: [];
  };
  family_members: {
    Row: {
      created_at: string;
      date_of_birth: string | null;
      family_member_number: string;
      full_name: string;
      gender: string | null;
      id: string;
      member_id: string;
      relationship: string;
      updated_at: string;
    };
    Insert: {
      created_at?: string;
      date_of_birth?: string | null;
      family_member_number: string;
      full_name: string;
      gender?: string | null;
      id?: string;
      member_id: string;
      relationship: string;
      updated_at?: string;
    };
    Update: {
      created_at?: string;
      date_of_birth?: string | null;
      family_member_number?: string;
      full_name?: string;
      gender?: string | null;
      id?: string;
      member_id?: string;
      relationship?: string;
      updated_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "family_members_member_id_fkey";
        columns: ["member_id"];
        isOneToOne: false;
        referencedRelation: "members";
        referencedColumns: ["id"];
      }
    ];
  };
  members_collectors: {
    Row: {
      active: boolean | null;
      created_at: string;
      email: string | null;
      id: string;
      member_number: string | null;
      name: string | null;
      number: string | null;
      phone: string | null;
      prefix: string | null;
      updated_at: string;
    };
    Insert: {
      active?: boolean | null;
      created_at?: string;
      email?: string | null;
      id?: string;
      member_number?: string | null;
      name?: string | null;
      number?: string | null;
      phone?: string | null;
      prefix?: string | null;
      updated_at?: string;
    };
    Update: {
      active?: boolean | null;
      created_at?: string;
      email?: string | null;
      id?: string;
      member_number?: string | null;
      name?: string | null;
      number?: string | null;
      phone?: string | null;
      prefix?: string | null;
      updated_at?: string;
    };
    Relationships: [];
  };
  member_notes: {
    Row: {
      id: string;
      member_id: string;
      note_text: string | null;
      note_type: "admin" | "payment" | "general";
      created_at: string;
      created_by: string | null;
      updated_at: string;
    };
    Insert: {
      id?: string;
      member_id: string;
      note_text?: string | null;
      note_type: "admin" | "payment" | "general";
      created_at?: string;
      created_by?: string | null;
      updated_at?: string;
    };
    Update: {
      id?: string;
      member_id?: string;
      note_text?: string | null;
      note_type?: "admin" | "payment" | "general";
      created_at?: string;
      created_by?: string | null;
      updated_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "member_notes_member_id_fkey";
        columns: ["member_id"];
        isOneToOne: false;
        referencedRelation: "members";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "member_notes_created_by_fkey";
        columns: ["created_by"];
        isOneToOne: false;
        referencedRelation: "auth.users";
        referencedColumns: ["id"];
      }
    ];
  };
};

export type DatabaseTables = MemberTables;

export * from './member-tables';
export * from './audit-tables';
export * from './git-tables';
export * from './role-tables';
export * from './system-tables';
