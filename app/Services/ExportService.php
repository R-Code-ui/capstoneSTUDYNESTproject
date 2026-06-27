<?php

namespace App\Services;

use App\Helpers\ExportHelper;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class ExportService
{
    /**
     * Available export formats.
     */
    const FORMATS = [
        'csv' => 'CSV',
        'excel' => 'Excel',
        'print' => 'Print',
    ];

    /**
     * Export data to the specified format.
     */
    public function export(array $data, string $format, string $title = 'Report', array $headers = []): Response|string
    {
        $filename = strtolower(str_replace(' ', '_', $title)) . '_' . now()->format('Y-m-d_His');

        switch ($format) {
            case 'csv':
                return $this->exportCsv($data, $headers, $filename);
            case 'excel':
                return $this->exportExcel($data, $headers, $filename);
            case 'print':
                return $this->exportPrint($data, $headers, $title);
            default:
                throw new \InvalidArgumentException("Unsupported export format: {$format}");
        }
    }

    /**
     * Export as CSV.
     */
    public function exportCsv(array $data, array $headers = [], string $filename = null): Response
    {
        return ExportHelper::generateCsv($data, $headers, $filename);
    }

    /**
     * Export as Excel (CSV fallback).
     */
    public function exportExcel(array $data, array $headers = [], string $filename = null): Response
    {
        return ExportHelper::generateExcel($data, $headers, $filename);
    }

    /**
     * Export as Print-friendly HTML.
     */
    public function exportPrint(array $data, array $headers = [], string $title = 'Report'): string
    {
        return ExportHelper::generatePrint($data, $headers, $title);
    }

    /**
     * Save export data to file.
     */
    public function saveExport(array $data, string $format, string $title = 'Report', string $path = null): string
    {
        $filename = strtolower(str_replace(' ', '_', $title)) . '_' . now()->format('Y-m-d_His');
        $extension = $format === 'excel' ? 'xlsx' : $format;
        $fullFilename = $filename . '.' . $extension;

        $content = $this->getExportContent($data, $format, $title);

        $storagePath = $path ?? 'exports/';
        $fullPath = $storagePath . $fullFilename;

        Storage::disk('public')->put($fullPath, $content);

        return $fullPath;
    }

    /**
     * Get export content as string.
     */
    private function getExportContent(array $data, string $format, string $title = 'Report'): string
    {
        if (empty($data)) {
            return 'No data available for export.';
        }

        $headers = array_keys($data[0]);

        switch ($format) {
            case 'csv':
                return $this->buildCsvContent($data, $headers);
            case 'print':
                return ExportHelper::generatePrint($data, $headers, $title);
            default:
                return json_encode($data, JSON_PRETTY_PRINT);
        }
    }

    /**
     * Build CSV content as string.
     */
    private function buildCsvContent(array $data, array $headers): string
    {
        $output = fopen('php://temp', 'r+');

        // Add BOM for UTF-8
        fputs($output, "\xEF\xBB\xBF");

        // Add headers
        fputcsv($output, $headers);

        // Add data rows
        foreach ($data as $row) {
            $rowData = [];
            foreach ($headers as $header) {
                $rowData[] = $row[$header] ?? '';
            }
            fputcsv($output, $rowData);
        }

        rewind($output);
        $content = stream_get_contents($output);
        fclose($output);

        return $content;
    }

    /**
     * Get supported formats list.
     */
    public static function getFormats(): array
    {
        return self::FORMATS;
    }

    /**
     * Check if a format is supported.
     */
    public static function isFormatSupported(string $format): bool
    {
        return array_key_exists($format, self::FORMATS);
    }
}
