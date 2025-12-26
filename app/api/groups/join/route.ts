import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

// POST /api/groups/join - Join an existing group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, name, contact } = body;

    // Validation
    if (!groupId || !name) {
      return NextResponse.json(
        { error: 'groupId and name are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'name must be a non-empty string' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Fetch the group
    const { data: group, error: groupError } = await supabase
      .from('course_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if group is open
    if (group.status !== 'open') {
      return NextResponse.json(
        { error: 'Group is not open for new members' },
        { status: 400 }
      );
    }

    // Count current members
    const { count: memberCount, error: countError } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (countError) {
      console.error('[API /groups/join] Error counting members:', countError);
      return NextResponse.json(
        { error: 'Failed to check group capacity', details: countError.message },
        { status: 500 }
      );
    }

    // Check if group is full
    if (memberCount && memberCount >= 4) {
      // Update group status to full if it's not already
      await supabase
        .from('course_groups')
        .update({ status: 'full' })
        .eq('id', groupId);

      return NextResponse.json(
        { error: 'Group is full (4 members)' },
        { status: 400 }
      );
    }

    // Add the new member
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        name: name.trim(),
        contact: contact?.trim() || null,
      })
      .select()
      .single();

    if (memberError) {
      console.error('[API /groups/join] Error adding member:', memberError);
      return NextResponse.json(
        { error: 'Failed to join group', details: memberError.message },
        { status: 500 }
      );
    }

    // Fetch updated group with all members
    const { data: updatedGroup } = await supabase
      .from('course_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    const newMemberCount = members?.length || 0;

    // If group is now full, update status
    if (newMemberCount >= 4 && updatedGroup) {
      await supabase
        .from('course_groups')
        .update({ status: 'full' })
        .eq('id', groupId);
      
      updatedGroup.status = 'full';
    }

    return NextResponse.json({
      ...updatedGroup,
      member_count: newMemberCount,
      members: members || [],
    });
  } catch (error: any) {
    console.error('[API /groups/join] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

