// Database types for the design4public CMS
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'master' | 'admin' | 'general'
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'master' | 'admin' | 'general'
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'master' | 'admin' | 'general'
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          cover_image_url: string | null
          year: number | null
          area: number | null
          status: 'draft' | 'published' | 'hidden'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          cover_image_url?: string | null
          year?: number | null
          area?: number | null
          status?: 'draft' | 'published' | 'hidden'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          cover_image_url?: string | null
          year?: number | null
          area?: number | null
          status?: 'draft' | 'published' | 'hidden'
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          name: string
          description: string | null
          brand_id: string
          nara_url: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          brand_id: string
          nara_url?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          brand_id?: string
          nara_url?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          description: string | null
          cover_image_url: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          cover_image_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          cover_image_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      project_images: {
        Row: {
          id: string
          project_id: string
          image_url: string
          order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          image_url: string
          order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          image_url?: string
          order?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'master' | 'admin' | 'general'
      user_status: 'pending' | 'approved' | 'rejected'
      project_status: 'draft' | 'published' | 'hidden'
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Brand = Database['public']['Tables']['brands']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type ProjectImage = Database['public']['Tables']['project_images']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type BrandInsert = Database['public']['Tables']['brands']['Insert']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type ProjectImageInsert = Database['public']['Tables']['project_images']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type ItemUpdate = Database['public']['Tables']['items']['Update']
export type BrandUpdate = Database['public']['Tables']['brands']['Update']
export type TagUpdate = Database['public']['Tables']['tags']['Update']
export type ProjectImageUpdate = Database['public']['Tables']['project_images']['Update']
