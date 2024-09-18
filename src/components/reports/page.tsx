// app/reports/trips/page.tsx
'use client'

import { useState } from 'react'
import { useTripsReport, TripReportData } from '@/hooks/reports/use-reports'
import { DataTable } from './data-table'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend the jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

const columns = [
  {
    accessorKey: 'startTime',
    header: 'Start Time',
    cell: ({ row }: { row: any }) => format(new Date(row.getValue('startTime')), 'PPpp'),
  },
  {
    accessorKey: 'endTime',
    header: 'End Time',
    cell: ({ row }: { row: any }) => row.getValue('endTime') ? format(new Date(row.getValue('endTime')), 'PPpp') : 'N/A',
  },
  {
    accessorKey: 'distance',
    header: 'Distance (km)',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'vehicleNumber',
    header: 'Vehicle Number',
  },
  {
    accessorKey: 'driverName',
    header: 'Driver Name',
  },
  {
    accessorKey: 'customerName',
    header: 'Customer Name',
  },
]

export default function TripsReportPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const { data, loading, refetch } = useTripsReport(startDate, endDate)

  const handleDownloadExcel = () => {
    if (!data) return
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Trips Report')
    XLSX.writeFile(wb, 'trips_report.xlsx')
  }

  const handleDownloadPDF = () => {
    if (!data) return
    const doc = new jsPDF() as jsPDFWithAutoTable
    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => {
        if (col.accessorKey === 'startTime' || col.accessorKey === 'endTime') {
          return row[col.accessorKey] ? format(new Date(row[col.accessorKey] as unknown as string), 'PPpp') : 'N/A'
        }
        return row[col.accessorKey as keyof TripReportData] ?? 'N/A'
      })),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [224, 224, 224] },
    })
    doc.save('trips_report.pdf')
  }

  const DatePickerButton = ({ date, setDate, placeholder }: { date: Date | undefined, setDate: (date: Date | undefined) => void, placeholder: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn(!date && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Trips Report</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <DatePickerButton date={startDate} setDate={setStartDate} placeholder="Pick a start date" />
        <DatePickerButton date={endDate} setDate={setEndDate} placeholder="Pick an end date" />
        <Button onClick={() => refetch()} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
        <Button onClick={handleDownloadExcel} disabled={!data}>
          <Download className="mr-2 h-4 w-4" />
          Excel
        </Button>
        <Button onClick={handleDownloadPDF} disabled={!data}>
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : data ? (
        <DataTable columns={columns} data={data} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} />
      ) : (
        <div className="text-center py-10">No data available. Please generate a report.</div>
      )}
    </div>
  )
}