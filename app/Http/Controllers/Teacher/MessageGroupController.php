<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\GroupMessage;
use App\Models\MessageGroup;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class MessageGroupController extends Controller
{
    public function create()
    {
        Gate::authorize('create', MessageGroup::class);

        return Inertia::render('Teacher/Messages/Groups/Create', $this->formData());
    }

    public function store(Request $request)
    {
        Gate::authorize('create', MessageGroup::class);

        $validated = $this->validateGroup($request);
        $teacher = auth()->user();
        $studentIds = $this->authorizedStudentIds($teacher, $validated['member_ids']);
        $this->authorizeSubject($teacher, $validated['subject_id'] ?? null);

        $group = DB::transaction(function () use ($validated, $teacher, $studentIds) {
            $group = MessageGroup::create([
                'teacher_id' => $teacher->id,
                'subject_id' => $validated['subject_id'] ?? null,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            $group->members()->sync(array_merge([$teacher->id], $studentIds));

            return $group;
        });

        return redirect()->route('teacher.messages.groups.show', $group)
            ->with('message', 'Group created successfully.');
    }

    public function show(MessageGroup $messageGroup)
    {
        Gate::authorize('view', $messageGroup);

        $messageGroup->load([
            'subject:id,name,grade_level',
            'members:id,name,lrn,grade_level',
            'messages' => fn ($query) => $query->with('sender:id,name')->oldest(),
        ]);

        return Inertia::render('Teacher/Messages/Groups/Show', [
            'group' => $this->groupPayload($messageGroup),
            'can_manage' => Gate::allows('manage', $messageGroup),
        ]);
    }

    public function edit(MessageGroup $messageGroup)
    {
        Gate::authorize('manage', $messageGroup);

        $messageGroup->load('members:id,name,lrn,grade_level');

        return Inertia::render('Teacher/Messages/Groups/Edit', array_merge(
            ['group' => [
                'id' => $messageGroup->id,
                'name' => $messageGroup->name,
                'description' => $messageGroup->description,
                'subject_id' => $messageGroup->subject_id,
                'member_ids' => $messageGroup->members
                    ->where('id', '!=', auth()->id())
                    ->pluck('id')->values(),
            ]],
            $this->formData()
        ));
    }

    public function update(Request $request, MessageGroup $messageGroup)
    {
        Gate::authorize('manage', $messageGroup);

        $validated = $this->validateGroup($request);
        $teacher = auth()->user();
        $studentIds = $this->authorizedStudentIds($teacher, $validated['member_ids']);
        $this->authorizeSubject($teacher, $validated['subject_id'] ?? null);

        DB::transaction(function () use ($validated, $messageGroup, $teacher, $studentIds) {
            $messageGroup->update([
                'subject_id' => $validated['subject_id'] ?? null,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            $messageGroup->members()->sync(array_merge([$teacher->id], $studentIds));
        });

        return redirect()->route('teacher.messages.groups.show', $messageGroup)
            ->with('message', 'Group updated successfully.');
    }

    public function removeMember(MessageGroup $messageGroup, User $user)
    {
        Gate::authorize('manage', $messageGroup);

        abort_unless($user->isStudent(), 404);
        $messageGroup->members()->detach($user->id);

        return back()->with('message', 'Member removed from the group.');
    }

    public function send(Request $request, MessageGroup $messageGroup)
    {
        Gate::authorize('send', $messageGroup);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:10000'],
        ]);

        $message = $messageGroup->messages()->create([
            'sender_id' => auth()->id(),
            'body' => $validated['body'],
        ]);

        return redirect()->route('teacher.messages.groups.show', $messageGroup)
            ->with('message', 'Message sent.');
    }

    public function archive(MessageGroup $messageGroup)
    {
        Gate::authorize('manage', $messageGroup);
        $messageGroup->update(['is_archived' => true]);

        return back()->with('message', 'Group archived.');
    }

    public function restore(MessageGroup $messageGroup)
    {
        Gate::authorize('manage', $messageGroup);
        $messageGroup->update(['is_archived' => false]);

        return back()->with('message', 'Group restored.');
    }

    public function destroy(MessageGroup $messageGroup)
    {
        Gate::authorize('manage', $messageGroup);
        abort_unless($messageGroup->is_archived, 422, 'Archive the group before deleting it.');

        $messageGroup->delete();

        return redirect()->route('teacher.messages.index')
            ->with('message', 'Group deleted.');
    }

    private function formData(): array
    {
        $teacher = auth()->user();
        $grades = $teacher->gradeAssignments()->pluck('grade_level');

        return [
            'students' => User::role('student')
                ->whereIn('grade_level', $grades)
                ->orderBy('name')
                ->get(['id', 'name', 'lrn', 'grade_level']),
            'subjects' => Subject::whereIn('grade_level', $grades)
                ->orderBy('grade_level')->orderBy('name')
                ->get(['id', 'name', 'grade_level']),
        ];
    }

    private function validateGroup(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'member_ids' => ['required', 'array', 'min:1'],
            'member_ids.*' => ['integer', 'distinct', 'exists:users,id'],
        ]);
    }

    private function authorizedStudentIds(User $teacher, array $ids): array
    {
        $grades = $teacher->gradeAssignments()->pluck('grade_level');
        $students = User::role('student')
            ->whereIn('id', $ids)
            ->whereIn('grade_level', $grades)
            ->pluck('id')
            ->all();

        abort_unless(count($students) === count($ids), 403, 'One or more students are outside your assigned grades.');

        return $students;
    }

    private function authorizeSubject(User $teacher, ?int $subjectId): void
    {
        if (!$subjectId) {
            return;
        }

        abort_unless(
            $teacher->gradeAssignments()->where('grade_level', Subject::findOrFail($subjectId)->grade_level)->exists(),
            403,
            'You are not assigned to this subject grade.'
        );
    }

    private function groupPayload(MessageGroup $group): array
    {
        return [
            'id' => $group->id,
            'name' => $group->name,
            'description' => $group->description,
            'is_archived' => $group->is_archived,
            'owner_id' => $group->teacher_id,
            'subject' => $group->subject,
            'members' => $group->members->map(fn ($member) => [
                'id' => $member->id,
                'name' => $member->name,
                'grade_level' => $member->grade_level,
                'is_owner' => $member->id === $group->teacher_id,
            ])->values(),
            'messages' => $group->messages->map(fn ($message) => [
                'id' => $message->id,
                'body' => $message->body,
                'sender_id' => $message->sender_id,
                'sender_name' => $message->sender->name,
                'created_at' => $message->created_at->format('M d, Y g:i A'),
            ])->values(),
        ];
    }
}
