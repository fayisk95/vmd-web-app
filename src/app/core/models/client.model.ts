export interface Client {
  id: number;
  clientId: string;
  name: string;
  contactDetails: string;
  company: string;
  email: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientFilters {
  searchTerm?: string;
  company?: string;
}