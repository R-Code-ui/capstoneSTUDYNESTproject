<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A4 portrait; margin: 24px 22px; }
        body { font-family: DejaVu Sans, sans-serif; color: #1e293b; font-size: 9px; }
        h1 { margin: 0; color: #1d4ed8; font-size: 20px; }
        .subtitle { margin: 4px 0 14px; color: #64748b; }
        .overview { width: 100%; margin-bottom: 12px; border-collapse: collapse; }
        .overview td { padding: 5px 7px; border: 1px solid #dbe4ef; }
        .overview .label { width: 34%; background: #eff6ff; color: #1e40af; font-weight: bold; }
        .student-page { page-break-after: always; }
        .student-card { margin: 14px 0; border: 1px solid #cbd5e1; border-radius: 6px; }
        .card-title { padding: 8px 10px; background: #1d4ed8; color: #fff; font-size: 11px; font-weight: bold; }
        .details { width: 100%; border-collapse: collapse; }
        .details td { width: 50%; padding: 9px 10px; border: 1px solid #dbe4ef; vertical-align: top; }
        .field-label { display: block; color: #64748b; font-size: 8px; font-weight: bold; text-transform: uppercase; }
        .field-value { display: block; margin-top: 3px; color: #1e293b; font-size: 10px; font-weight: bold; }
        .footer { margin-top: 12px; color: #64748b; font-size: 8px; text-align: center; }
    </style>
</head>
<body>
    <h1>STUDYNEST</h1>
    <div class="subtitle">{{ $title }} &middot; Generated {{ now()->format('F j, Y g:i A') }}</div>
    <table class="overview">@foreach($filters as $label => $value)<tr><td class="label">{{ $label }}</td><td>{{ $value }}</td></tr>@endforeach @foreach($summary as $label => $value)<tr><td class="label">{{ $label }}</td><td>{{ $value }}</td></tr>@endforeach</table>
    @forelse(array_chunk($students, 2) as $pair)
        <div class="{{ $loop->last ? '' : 'student-page' }}">
            @foreach($pair as $student)
                <div class="student-card">
                    <div class="card-title">Student {{ $student['no'] }} &mdash; {{ $student['first_name'] }} {{ $student['last_name'] }}</div>
                    <table class="details">
                        <tr><td><span class="field-label">Student ID</span><span class="field-value">{{ $student['student_id'] }}</span></td><td><span class="field-label">First Name</span><span class="field-value">{{ $student['first_name'] }}</span></td></tr>
                        <tr><td><span class="field-label">Middle Name</span><span class="field-value">{{ $student['middle_name'] }}</span></td><td><span class="field-label">Last Name</span><span class="field-value">{{ $student['last_name'] }}</span></td></tr>
                        <tr><td><span class="field-label">Grade Level</span><span class="field-value">{{ $student['grade_level'] }}</span></td><td><span class="field-label">School Year</span><span class="field-value">{{ $student['school_year'] }}</span></td></tr>
                        <tr><td><span class="field-label">Gender</span><span class="field-value">{{ $student['gender'] }}</span></td><td><span class="field-label">Status</span><span class="field-value">{{ $student['status'] }}</span></td></tr>
                    </table>
                </div>
            @endforeach
        </div>
    @empty
        <p>No students match the selected filters.</p>
    @endforelse
    <div class="footer">StudyNest {{ $reportOwner }} Reports</div>
</body>
</html>
