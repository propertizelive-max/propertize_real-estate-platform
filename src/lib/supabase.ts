'use client'

import { createClient } from './supabase/client'

/**
 * Browser Supabase client for client components.
 * For server components, use createClient from './supabase/server'.
 */
export const supabase = createClient()
