import { supabase } from "@/integrations/supabase/client";

export const updateMemberWithAuthId = async (memberId: string, authUserId: string) => {
  console.log('Updating member with auth_user_id');
  const { error: updateError } = await supabase
    .from('members')
    .update({ auth_user_id: authUserId })
    .eq('id', memberId);

  if (updateError) {
    console.error('Error updating member with auth_user_id:', updateError);
    throw updateError;
  }
};

export const addMemberRole = async (userId: string) => {
  console.log('Adding default member role');
  
  try {
    // First check if role already exists
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'member')
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing role:', checkError);
      throw checkError;
    }

    // Only insert if role doesn't exist
    if (!existingRole) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'member' }]);

      if (roleError) {
        console.error('Error adding member role:', roleError);
        throw roleError;
      }
      
      console.log('Successfully added member role for user:', userId);
    } else {
      console.log('Member role already exists for user:', userId);
    }
  } catch (error) {
    console.error('Error in addMemberRole:', error);
    throw error;
  }
};