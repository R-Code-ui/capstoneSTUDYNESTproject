<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A4 portrait; margin: 24px 22px; }
        body { font-family: DejaVu Sans, sans-serif; color: #1e293b; font-size: 9px; }
        h1 { margin: 0; color: #1d4ed8; font-size: 20px; }
        .subtitle { margin: 4px 0 18px; color: #64748b; }
        .filters, .summary { width: 100%; margin: 0 0 14px; border-collapse: collapse; }
        .filters td, .summary td { padding: 6px 8px; border: 1px solid #dbe4ef; }
        .filters .label, .summary .label { width: 34%; background: #eff6ff; font-weight: bold; color: #1e40af; }
        .summary { margin-bottom: 18px; }
        table.report { width: 100%; border-collapse: collapse; }
        .report th { background: #1d4ed8; color: #fff; padding: 6px 4px; text-align: left; font-size: 8px; }
        .report td { border: 1px solid #dbe4ef; padding: 5px 4px; vertical-align: top; }
        .report tr:nth-child(even) td { background: #f8fafc; }
        .footer { margin-top: 18px; color: #64748b; font-size: 9px; text-align: center; }
    </style>
</head>
<body>
    <h1>STUDYNEST</h1>
    <div class="subtitle">{{ $title }} &middot; Generated {{ now()->format('F j, Y g:i A') }}</div>
    <table class="filters">@foreach($filters as $label => $value)<tr><td class="label">{{ $label }}</td><td>{{ $value }}</td></tr>@endforeach</table>
    <table class="summary">@foreach($summary as $label => $value)<tr><td class="label">{{ $label }}</td><td>{{ $value }}</td></tr>@endforeach</table>
    <table class="report"><thead><tr>@foreach($columns as $label)<th>{{ $label }}</th>@endforeach</tr></thead><tbody>@forelse($rows as $row)<tr>@foreach(array_keys($columns) as $key)<td>{{ $row[$key] ?? '—' }}</td>@endforeach</tr>@empty<tr><td colspan="{{ count($columns) }}">No records match the selected filters.</td></tr>@endforelse</tbody></table>
    <div class="footer">StudyNest {{ $reportOwner ?? 'Principal' }} Reports</div>
</body>
</html>
