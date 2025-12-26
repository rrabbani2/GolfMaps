import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

// GET /api/groups?courseId=...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Fetch groups for the course that are open or have < 4 members
    const { data: groups, error: groupsError } = await supabase
      .from('course_groups')
      .select('*')
      .eq('course_id', courseId)
      .in('status', ['open', 'full'])
      .order('created_at', { ascending: false });

    if (groupsError) {
      console.error('[API /groups] Error fetching groups:', groupsError);
      return NextResponse.json(
        { error: 'Failed to fetch groups', details: groupsError.message },
        { status: 500 }
      );
    }

    // For each group, fetch members and count
    const groupsWithMembers = await Promise.all(
      (groups || []).map(async (group) => {
        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', group.id)
          .order('created_at', { ascending: true });

        if (membersError) {
          console.error(`[API /groups] Error fetching members for group ${group.id}:`, membersError);
        }

        const memberCount = members?.length || 0;
        
        // Only return groups that are open or have < 4 members
        if (group.status === 'open' && memberCount < 4) {
          return {
            ...group,
            member_count: memberCount,
            members: members || [],
          };
        }
        
        // If group is marked as full but has < 4 members, still return it (might be stale status)
        if (memberCount < 4) {
          return {
            ...group,
            member_count: memberCount,
            members: members || [],
          };
        }
        
        return null;
      })
    );

    // Filter out null values (groups that are full)
    const openGroups = groupsWithMembers.filter((g): g is NonNullable<typeof g> => g !== null);

    return NextResponse.json(openGroups);
  } catch (error: any) {
    console.error('[API /groups] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, name, contact, teeTime, note } = body;

    // Validation
    if (!courseId || !name) {
      return NextResponse.json(
        { error: 'courseId and name are required' },
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

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('course_groups')
      .insert({
        course_id: courseId,
        status: 'open',
        tee_time: teeTime || null,
        note: note || null,
      })
      .select()
      .single();

    if (groupError) {
      console.error('[API /groups] Error creating group:', groupError);
      return NextResponse.json(
        { error: 'Failed to create group', details: groupError.message },
        { status: 500 }
      );
    }

    // Add the creator as the first member
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        name: name.trim(),
        contact: contact?.trim() || null,
      })
      .select()
      .single();

    if (memberError) {
      console.error('[API /groups] Error adding creator as member:', memberError);
      // Try to delete the group if member creation fails
      await supabase.from('course_groups').delete().eq('id', group.id);
      return NextResponse.json(
        { error: 'Failed to add creator to group', details: memberError.message },
        { status: 500 }
      );
    }

    // Fetch all members (should just be the creator for now)
    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      ...group,
      member_count: members?.length || 1,
      members: members || [member],
    });
  } catch (error: any) {
    console.error('[API /groups] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

