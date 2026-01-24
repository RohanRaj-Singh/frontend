import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TabulatorTableComponent, TableConfig } from '../tabulator-table/tabulator-table.component';

declare var XLSX: any;

interface ColorData {
  messageId: string;
  ticketId: string;
  cusip: string;
  bias: string;
  date: string;
  bid: number;
  mid: number;
  ask: number;
  source: string;
}

@Component({
  selector: 'app-manual-color',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    FileUploadModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    FormsModule,
    TabulatorTableComponent
  ],
  templateUrl: './manual-color.html',
  styleUrls: ['./manual-color.css'],
  providers: [MessageService]
})
export class ManualColor implements OnInit {
  searchText = '';
  showImportDialog = false;

  colors: ColorData[] = [
    { messageId: 'TRB5829340A63B91', ticketId: 'BESXP15 12X A1', cusip: '961644AC4', bias: 'BWC_COVER', date: '07/19/2025', bid: 100.2, mid: 101.3, ask: 102.2, source: 'Bwc Cover' },
    { messageId: 'TRB5829340A63B92', ticketId: 'BESXP15 12X A1', cusip: '961644AC4', bias: 'BID', date: '07/19/2025', bid: 100.3, mid: 101.2, ask: 102.2, source: 'Bid' },
    { messageId: 'TRB5829340A63B93', ticketId: 'BESXP15 12X A1', cusip: '961644AC4', bias: 'MARKET', date: '07/19/2025', bid: 100.3, mid: 101.3, ask: 102.2, source: 'Market' },
    { messageId: 'TRB5829340A63B94', ticketId: 'BESXP15 12X A1', cusip: '961644AC4', bias: 'OFFER', date: '07/19/2025', bid: 100.3, mid: 101.3, ask: 102.2, source: 'Offer' },
  ];

  // Tabulator configuration - EDITABLE MODE
  tabulatorConfig: TableConfig = {
    title: 'Manual Color Data',
    editable: true,               // ✅ EDITABLE
    allowImport: false,
    allowExport: true,
    allowS3Fetch: false,
    pagination: true,
    paginationSize: 10,
    selectable: true,
    movableColumns: true,
    headerFilter: true
  };

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    console.log('🚀 Manual Color component initialized');
    console.log('📊 Sample data loaded:', this.colors.length, 'colors');
  }

  /**
   * Run automation
   */
  runAutomation() {
    console.log('⚙️ Running automation...');
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Automation started'
    });
  }

  /**
   * Open import dialog
   */
  openImportDialog() {
    this.showImportDialog = true;
  }

  /**
   * Handle file upload
   */
  onUpload(event: any) {
    const file: File = event.files[0];
    if (!file) return;

    console.log('📥 File uploaded:', file.name);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        if (rows.length === 0) {
          throw new Error('No data found in file');
        }

        this.colors = rows.map((row: any) => ({
          messageId: row['Message ID'] || row['messageId'] || '',
          ticketId: row['Ticket ID'] || row['ticketId'] || '',
          cusip: row['CUSIP'] || row['cusip'] || '',
          bias: row['Bias'] || row['bias'] || '',
          date: row['Date'] || row['date'] || '',
          bid: parseFloat(row['BID']) || parseFloat(row['bid']) || 0,
          mid: parseFloat(row['MID']) || parseFloat(row['mid']) || 0,
          ask: parseFloat(row['ASK']) || parseFloat(row['ask']) || 0,
          source: row['Source'] || row['source'] || ''
        }));

        this.showImportDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Imported ${this.colors.length} colors`
        });
        console.log('✅ File imported successfully');
      } catch (error) {
        console.error('❌ Error parsing file:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to import file'
        });
      }
    };

    reader.readAsArrayBuffer(file);
  }

  /**
   * Cancel import
   */
  onCancelUpload() {
    this.showImportDialog = false;
  }

  /**
   * Handle table data changes
   */
  onTableDataChanged(data: any[]) {
    console.log('📝 Table data changed:', data.length, 'rows');
    this.colors = data;
  }

  /**
   * Handle table data loaded
   */
  onTableDataLoaded(data: any[]) {
    console.log('📥 Table data loaded:', data.length, 'rows');
    this.colors = data;
  }

  /**
   * Handle row selection
   */
  onTableRowSelected(selectedRows: any[]) {
    console.log('✅ Selected rows:', selectedRows.length);
  }

  /**
   * Add new row
   */
  addNewRow() {
    const newRow: ColorData = {
      messageId: '',
      ticketId: '',
      cusip: '',
      bias: '',
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      bid: 0,
      mid: 0,
      ask: 0,
      source: ''
    };
    this.colors = [newRow, ...this.colors];
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'New row added'
    });
  }

  /**
   * Save changes to backend (if needed)
   */
  saveChanges() {
    console.log('💾 Saving changes:', this.colors);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'All changes saved successfully'
    });
  }
}