export interface Address {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
  }
  
  export interface Name {
    firstName: string;
    lastName: string;
  }
  
  export interface ParsedData {
    name: string;
    age: number;
    address: Address;
    additional_info: Record<string, unknown>;
  }
  
  export interface RawParsedData {
    name: Name;
    age: string;
    address?: Address;
    [key: string]: unknown;
  }
  
  export interface DbRecord {
    name: string;
    age: number;
    address: string;
    additional_info: string;
  }