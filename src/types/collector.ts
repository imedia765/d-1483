export type Collector = {
  id: string;
  name: string;
  phone: string;
  prefix: string;
  number: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  member_number?: string; // Made optional to match the database response
};