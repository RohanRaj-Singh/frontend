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
  rowNumber?: string;        // Added for parent/child hierarchy
  messageId: string;
  tickerId: string;          // Changed from ticketId to match table
  cusip: string;
  bias: string;
  date: string;
  bid: number | string;      // Allow string for display
  mid: number | string;
  ask: number | string;
  source: string;
  isParent?: boolean;        // Added for hierarchy
  parentRow?: string;        // Added for hierarchy
  childrenCount?: number;    // Added for hierarchy
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

  // Main data array with parent/child hierarchy support
  colors: ColorData[] = [
    // ========== PARENT 1 with 3 children ==========
    { 
      rowNumber: '1',
      messageId: 'TRB5829340A63B91', 
      tickerId: 'BESXP15 12X A1', 
      cusip: '961644AC4', 
      bias: 'BWIC_COVER', 
      date: '07/19/2025', 
      bid: '100.2', 
      mid: '101.3', 
      ask: '102.2', 
      source: 'BWIC Cover',
      isParent: true,
      childrenCount: 3
    },
    { 
      rowNumber: '1.1',
      messageId: 'TRB5829340A63B92', 
      tickerId: 'BESXP15 12X A1', 
      cusip: '961644AC4', 
      bias: 'BID', 
      date: '07/19/2025', 
      bid: '100.3', 
      mid: '101.2', 
      ask: '102.2', 
      source: 'Bid',
      isParent: false,
      parentRow: '1'
    },
    { 
      rowNumber: '1.2',
      messageId: 'TRB5829340A63B93', 
      tickerId: 'BESXP15 12X A1', 
      cusip: '961644AC4', 
      bias: 'MARKET', 
      date: '07/19/2025', 
      bid: '100.3', 
      mid: '101.3', 
      ask: '102.2', 
      source: 'Market',
      isParent: false,
      parentRow: '1'
    },
    { 
      rowNumber: '1.3',
      messageId: 'TRB5829340A63B94', 
      tickerId: 'BESXP15 12X A1', 
      cusip: '961644AC4', 
      bias: 'OFFER', 
      date: '07/19/2025', 
      bid: '100.3', 
      mid: '101.3', 
      ask: '102.2', 
      source: 'Offer',
      isParent: false,
      parentRow: '1'
    },
    
    // ========== PARENT 2 with no children ==========
    { 
      rowNumber: '2',
      messageId: 'TRB5829340A63B95', 
      tickerId: 'BESXP15 15Y A2', 
      cusip: '961644AC5', 
      bias: 'MARKET', 
      date: '07/20/2025', 
      bid: '99.5', 
      mid: '100.5', 
      ask: '101.5', 
      source: 'Market',
      isParent: true,
      childrenCount: 0
    },
    
    // ========== PARENT 3 with 2 children, one nested ==========
    { 
      rowNumber: '3',
      messageId: 'TRB5829340A63B96', 
      tickerId: 'JPMORGAN 20A At', 
      cusip: '46625HKL3', 
      bias: 'BWIC_COVER', 
      date: '07/21/2025', 
      bid: '102.0', 
      mid: '103.0', 
      ask: '104.0', 
      source: 'BWIC Cover',
      isParent: true,
      childrenCount: 2
    },
    { 
      rowNumber: '3.1',
      messageId: 'TRB5829340A63B97', 
      tickerId: 'JPMORGAN 20A At', 
      cusip: '46625HKL3', 
      bias: 'BID', 
      date: '07/21/2025', 
      bid: '102.1', 
      mid: '103.1', 
      ask: '104.1', 
      source: 'Bid',
      isParent: false,
      parentRow: '3'
    },
    { 
      rowNumber: '3.2',
      messageId: 'TRB5829340A63B98', 
      tickerId: 'JPMORGAN 20A At', 
      cusip: '46625HKL3', 
      bias: 'ASK', 
      date: '07/21/2025', 
      bid: '102.2', 
      mid: '103.2', 
      ask: '104.2', 
      source: 'Ask',
      isParent: true,  // This child has its own children
      childrenCount: 2,
      parentRow: '3'
    },
    { 
      rowNumber: '3.2.1',
      messageId: 'TRB5829340A63B99', 
      tickerId: 'JPMORGAN 20A At', 
      cusip: '46625HKL3', 
      bias: 'BWIC_TALK', 
      date: '07/21/2025', 
      bid: '102.3', 
      mid: '103.3', 
      ask: '104.3', 
      source: 'BWIC Talk',
      isParent: false,
      parentRow: '3.2'
    },
    { 
      rowNumber: '3.2.2',
      messageId: 'TRB5829340A63BA0', 
      tickerId: 'JPMORGAN 20A At', 
      cusip: '46625HKL3', 
      bias: 'COLOR', 
      date: '07/21/2025', 
      bid: '102.4', 
      mid: '103.4', 
      ask: '104.4', 
      source: 'Color',
      isParent: false,
      parentRow: '3.2'
    },
    
    // ========== PARENT 4 with 4 children ==========
    { 
      rowNumber: '4',
      messageId: 'TRB5829340A63BA1', 
      tickerId: 'WELLS FARGO 25B Ai', 
      cusip: '949763DF2', 
      bias: 'MARKET', 
      date: '07/22/2025', 
      bid: '98.0', 
      mid: '99.0', 
      ask: '100.0', 
      source: 'Market',
      isParent: true,
      childrenCount: 4
    },
    { 
      rowNumber: '4.1',
      messageId: 'TRB5829340A63BA2', 
      tickerId: 'WELLS FARGO 25B Ai', 
      cusip: '949763DF2', 
      bias: 'BID', 
      date: '07/22/2025', 
      bid: '98.1', 
      mid: '99.1', 
      ask: '100.1', 
      source: 'Bid',
      isParent: false,
      parentRow: '4'
    },
    { 
      rowNumber: '4.2',
      messageId: 'TRB5829340A63BA3', 
      tickerId: 'WELLS FARGO 25B Ai', 
      cusip: '949763DF2', 
      bias: 'OFFER', 
      date: '07/22/2025', 
      bid: '98.2', 
      mid: '99.2', 
      ask: '100.2', 
      source: 'Offer',
      isParent: false,
      parentRow: '4'
    },
    { 
      rowNumber: '4.3',
      messageId: 'TRB5829340A63BA4', 
      tickerId: 'WELLS FARGO 25B Ai', 
      cusip: '949763DF2', 
      bias: 'ASK', 
      date: '07/22/2025', 
      bid: '98.3', 
      mid: '99.3', 
      ask: '100.3', 
      source: 'Ask',
      isParent: false,
      parentRow: '4'
    },
    { 
      rowNumber: '4.4',
      messageId: 'TRB5829340A63BA5', 
      tickerId: 'WELLS FARGO 25B Ai', 
      cusip: '949763DF2', 
      bias: 'BWIC_COVER', 
      date: '07/22/2025', 
      bid: '98.4', 
      mid: '99.4', 
      ask: '100.4', 
      source: 'BWIC Cover',
      isParent: false,
      parentRow: '4'
    },
    
    // ========== PARENT 5 with 1 child ==========
    { 
      rowNumber: '5',
      messageId: 'TRB5829340A63BA6', 
      tickerId: 'CITIGROUP 30C Ak', 
      cusip: '172967LD5', 
      bias: 'BID', 
      date: '07/23/2025', 
      bid: '101.5', 
      mid: '102.5', 
      ask: '103.5', 
      source: 'Bid',
      isParent: true,
      childrenCount: 1
    },
    { 
      rowNumber: '5.1',
      messageId: 'TRB5829340A63BA7', 
      tickerId: 'CITIGROUP 30C Ak', 
      cusip: '172967LD5', 
      bias: 'OFFER', 
      date: '07/23/2025', 
      bid: '101.6', 
      mid: '102.6', 
      ask: '103.6', 
      source: 'Offer',
      isParent: false,
      parentRow: '5'
    },
    
    // ========== PARENT 6 with no children ==========
    { 
      rowNumber: '6',
      messageId: 'TRB5829340A63BA8', 
      tickerId: 'BANK OF AMERICA 35D Al', 
      cusip: '06051GHE6', 
      bias: 'MARKET', 
      date: '07/24/2025', 
      bid: '97.0', 
      mid: '98.0', 
      ask: '99.0', 
      source: 'Market',
      isParent: true,
      childrenCount: 0
    },
    
    // ========== PARENT 7 with 5 children ==========
    { 
      rowNumber: '7',
      messageId: 'TRB5829340A63BA9', 
      tickerId: 'GOLDMAN SACHS 40E Am', 
      cusip: '38141GKL8', 
      bias: 'BWIC_COVER', 
      date: '07/25/2025', 
      bid: '103.0', 
      mid: '104.0', 
      ask: '105.0', 
      source: 'BWIC Cover',
      isParent: true,
      childrenCount: 5
    },
    { 
      rowNumber: '7.1',
      messageId: 'TRB5829340A63BB0', 
      tickerId: 'GOLDMAN SACHS 40E Am', 
      cusip: '38141GKL8', 
      bias: 'BID', 
      date: '07/25/2025', 
      bid: '103.1', 
      mid: '104.1', 
      ask: '105.1', 
      source: 'Bid',
      isParent: false,
      parentRow: '7'
    },
    { 
      rowNumber: '7.2',
      messageId: 'TRB5829340A63BB1', 
      tickerId: 'GOLDMAN SACHS 40E Am', 
      cusip: '38141GKL8', 
      bias: 'ASK', 
      date: '07/25/2025', 
      bid: '103.2', 
      mid: '104.2', 
      ask: '105.2', 
      source: 'Ask',
      isParent: false,
      parentRow: '7'
    },
    { 
      rowNumber: '7.3',
      messageId: 'TRB5829340A63BB2', 
      tickerId: 'GOLDMAN SACHS 40E Am', 
      cusip: '38141GKL8', 
      bias: 'OFFER', 
      date: '07/25/2025', 
      bid: '103.3', 
      mid: '104.3', 
      ask: '105.3', 
      source: 'Offer',
      isParent: false,
      parentRow: '7'
    },
    { 
      rowNumber: '7.4',
      messageId: 'TRB5829340A63BB3', 
      tickerId: 'GOLDMAN SACHS 40E Am', 
      cusip: '38141GKL8', 
      bias: 'MARKET', 
      date: '07/25/2025', 
      bid: '103.4', 
      mid: '104.4', 
      ask: '105.4', 
      source: 'Market',
      isParent: false,
      parentRow: '7'
    },
    { 
      rowNumber: '7.5',
      messageId: 'TRB5829340A63BB4', 
      tickerId: 'GOLDMAN SACHS 40E Am', 
      cusip: '38141GKL8', 
      bias: 'COLOR', 
      date: '07/25/2025', 
      bid: '103.5', 
      mid: '104.5', 
      ask: '105.5', 
      source: 'Color',
      isParent: false,
      parentRow: '7'
    }
  ];

  // Tabulator configuration - EDITABLE MODE
  tabulatorConfig: TableConfig = {
    title: 'Manual Color Data',
    editable: true,               // ✅ EDITABLE - enables floating actions
    allowImport: false,
    allowExport: true,
    allowS3Fetch: false,
    pagination: true,
    paginationSize: 10,
    selectable: true,
    movableColumns: true,
    headerFilter: false
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

        this.colors = rows.map((row: any, index: number) => ({
          rowNumber: String(index + 1),
          messageId: row['Message ID'] || row['messageId'] || '',
          tickerId: row['Ticker ID'] || row['tickerId'] || row['ticketId'] || '',
          cusip: row['CUSIP'] || row['cusip'] || '',
          bias: row['Bias'] || row['bias'] || '',
          date: row['Date'] || row['date'] || '',
          bid: String(parseFloat(row['BID']) || parseFloat(row['bid']) || 0),
          mid: String(parseFloat(row['MID']) || parseFloat(row['mid']) || 0),
          ask: String(parseFloat(row['ASK']) || parseFloat(row['ask']) || 0),
          source: row['Source'] || row['source'] || '',
          isParent: true,
          childrenCount: 0
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
   * Handle table data changes (from Tabulator)
   */
  onTableDataChanged(data: any[]) {
    console.log('📝 Table data changed:', data.length, 'rows');
    this.colors = data;
    // TODO: Save to backend if needed
    // this.saveToBackend(data);
  }

  /**
   * Handle table data loaded (from Tabulator)
   */
  onTableDataLoaded(data: any[]) {
    console.log('📥 Table data loaded:', data.length, 'rows');
    this.colors = data;
  }

  /**
   * Handle row selection (from Tabulator)
   */
  onTableRowSelected(selectedRows: any[]) {
    console.log('✅ Selected rows:', selectedRows.length);
    if (selectedRows.length > 0) {
      console.log('Selected row details:', selectedRows.map(r => ({
        rowNumber: r.rowNumber,
        messageId: r.messageId,
        isParent: r.isParent,
        parentRow: r.parentRow
      })));
    }
  }

  /**
   * Add new row
   */
  addNewRow() {
    // Find the next parent row number
    const parentRows = this.colors.filter(c => c.isParent);
    const nextRowNumber = String(parentRows.length + 1);

    const newRow: ColorData = {
      rowNumber: nextRowNumber,
      messageId: '',
      tickerId: '',
      cusip: '',
      bias: '',
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      bid: '0',
      mid: '0',
      ask: '0',
      source: '',
      isParent: true,
      childrenCount: 0
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
    // TODO: Implement backend save
    // this.apiService.saveManualColors(this.colors).subscribe();
  }

  /**
   * Handle expand toggle (not used in manual-color, but required by interface)
   */
  onTableExpandToggled(isExpanded: boolean) {
    console.log('Table expand toggled:', isExpanded);
  }
}