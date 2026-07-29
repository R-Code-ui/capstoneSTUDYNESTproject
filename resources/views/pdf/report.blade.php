<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $report->report_type }}</title>
    <style>
        /* ---- Page Setup for DomPDF ---- */
        @page {
            margin: 1.5cm 1.8cm;
            footer: page-footer;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: #fff;
        }

        /* ---- Header Bar ---- */
        .report-header {
            border-bottom: 3px solid #1a56db;
            padding-bottom: 12px;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .report-header h1 {
            font-size: 22px;
            font-weight: 700;
            color: #1a56db;
            margin: 0;
            line-height: 1.2;
        }
        .generated-info {
            text-align: right;
            font-size: 10px;
            color: #666;
            white-space: nowrap;
        }

        /* ---- Meta Information ---- */
        .meta-bar {
            background-color: #f0f4ff;
            border-radius: 6px;
            padding: 8px 14px;
            margin-bottom: 20px;
            font-size: 11px;
            color: #374151;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .meta-bar span {
            font-weight: 500;
        }

        /* ---- Summary Section ---- */
        .summary-section h2 {
            font-size: 15px;
            font-weight: 700;
            color: #1a56db;
            margin-bottom: 10px;
            border-left: 4px solid #1a56db;
            padding-left: 10px;
        }
        .summary-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 25px;
        }
        .summary-card {
            flex: 1 1 140px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
        }
        .summary-card .label {
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .summary-card .value {
            font-size: 20px;
            font-weight: 700;
            color: #1a56db;
        }
        .summary-card .context {
            font-size: 10px;
            color: #9ca3af;
            margin-top: 2px;
        }

        /* ---- Data Table ---- */
        .data-section h2 {
            font-size: 15px;
            font-weight: 700;
            color: #1a56db;
            margin: 0 0 10px 0;
            border-left: 4px solid #1a56db;
            padding-left: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }
        thead {
            background-color: #1a56db;
            color: #ffffff;
        }
        th {
            padding: 10px 12px;
            font-size: 11px;
            font-weight: 600;
            text-align: left;
            letter-spacing: 0.3px;
            white-space: nowrap;
        }
        tbody td {
            padding: 8px 12px;
            font-size: 11px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: middle;
        }
        tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }
        tbody tr:hover {
            background-color: #f0f4ff;
        }

        /* ---- Context / Out of ---- */
        .out-of-text {
            color: #6b7280;
            font-weight: normal;
            font-size: 10px;
        }

        /* ---- Footer ---- */
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #d1d5db;
            font-size: 10px;
            color: #9ca3af;
            text-align: center;
        }

        /* Page number footer */
        @page-footer {
            content: "Page " counter(page) " of " counter(pages);
            font-size: 10px;
            color: #9ca3af;
            text-align: right;
            padding-right: 1.8cm;
            margin-top: 10px;
        }
    </style>
</head>
<body>

    <!-- Report Header -->
    <div class="report-header">
        <h1>{{ $report->report_type }}</h1>
        <div class="generated-info">
            Generated: {{ $generated_at }}
        </div>
    </div>

    <!-- Meta Filters -->
    <div class="meta-bar">
        @if($report->grade_level)
            <span>🏫 Grade: <strong>{{ $report->grade_level }}</strong></span>
        @endif
        @if($report->subject)
            <span>📘 Subject: <strong>{{ $report->subject }}</strong></span>
        @endif
        @if($report->trimester)
            <span>📅 Term: <strong>{{ $report->trimester }}</strong></span>
        @endif
    </div>

    <!-- Summary Section -->
    @if(!empty($summary))
    <div class="summary-section">
        <h2>Summary</h2>
        <div class="summary-grid">
            @foreach($summary as $key => $value)
                <div class="summary-card">
                    <div class="label">{{ str_replace('_', ' ', ucwords($key)) }}</div>
                    <div class="value">
                        @if(is_numeric($value))
                            {{ round($value) }}@if(in_array($key, ['average_completion_rate','average_score','passing_rate','average_participation_rate','average_progress']))% @endif
                        @else
                            {{ $value }}
                        @endif
                    </div>
                    @if($key === 'total_students' && isset($summary['total_participants']))
                        <div class="context">out of {{ $summary['total_participants'] }} participants</div>
                    @elseif($key === 'participating_students' && isset($summary['total_students']))
                        <div class="context">out of {{ $summary['total_students'] }} students</div>
                    @endif
                </div>
            @endforeach
        </div>
    </div>
    @endif

    <!-- Data Table -->
    @if(!empty($data) && count($data) > 0)
    <div class="data-section">
        <h2>Detailed Data</h2>
        <table>
            <thead>
                <tr>
                    @foreach($headers as $header)
                        @php
                            $display = str_replace('_', ' ', ucwords($header));
                            if ($display === 'Lrn' || $display === 'Student Id') $display = 'Student ID';
                        @endphp
                        <th>{{ $display }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach($data as $row)
                    <tr>
                        @foreach($headers as $header)
                            <td>
                                @if(isset($row[$header]))
                                    @php $value = $row[$header]; @endphp
                                    @if(is_numeric($value))
                                        {{ round($value) }}@if(in_array($header, ['completion_rate','passing_rate','participation_rate','average_score','percentage','overall_progress','lesson_completion','quiz_participation','assignment_completion']))% @endif
                                    @else
                                        {{ $value }}
                                    @endif
                                @else
                                    —
                                @endif
                                @if($header === 'completed' && isset($row['total_students']))
                                    <span class="out-of-text"> / {{ $row['total_students'] }}</span>
                                @elseif($header === 'incomplete' && isset($row['total_students']))
                                    <span class="out-of-text"> / {{ $row['total_students'] }}</span>
                                @endif
                            </td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
        <p style="text-align: center; color: #666; padding: 30px;">No detailed data available for this report.</p>
    @endif

    <!-- Footer -->
    <div class="footer">
        Generated by StudyNest – Principal Reports | {{ now()->format('Y') }}
    </div>

</body>
</html>
