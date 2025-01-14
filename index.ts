import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are set
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
}

let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
} catch (error) {
  console.error("Error initializing Supabase client:", error);
  throw new Error("Failed to initialize Supabase client");
}

// Ensure Authorization header includes a valid token
const headers = {
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

// Retry mechanism for network requests
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retrying request... (${i + 1}/${retries})`);
    }
  }
}

// Confirm the user's role is set to "admin"
async function checkUserRole(userId) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Error fetching user role: ${error.message}`);
    }

    if (data.role !== 'admin') {
      throw new Error('User does not have admin privileges');
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    throw error;
  }
}

// ...existing code...