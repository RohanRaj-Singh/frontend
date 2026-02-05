import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

export interface TableColumn {
  field: string;
  header: string;
  width?: string;
  editable?: boolean;
  type?: 'text' | 'number' | 'date';
}

export interface TableRow {
  [key: string]: any;
  _selected?: boolean;
  _rowId?: string;
  isParent?: boolean;
  parentRow?: string | number;
  childrenCount?: number;
  rowNumber?: string | number;
}

export interface TableConfig {
  editable: boolean;
  selectable: boolean;
  showSelectButton: boolean;
  showRowNumbers: boolean;
  pagination?: boolean;
  pageSize?: number;
}

/**
 * Simple row numbering structure
 * parentNum: Parent gets a number (1, 2, 3...)
 * childNum: Each child under parent gets 1, 2, 3... then resets for next parent
 */
interface RowNumbering {
  parentNum: number;
  childNum: number;
}

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TooltipModule, ToastModule],
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.css'],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTableComponent implements OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: TableRow[] = [];
  @Input() config: TableConfig = {
    editable: false,
    selectable: true,
    showSelectButton: true,
    showRowNumbers: true,
    pagination: true,
    pageSize: 20
  };

  @Output() dataChanged = new EventEmitter<TableRow[]>();
  @Output() rowsSelected = new EventEmitter<TableRow[]>();
  @Output() cellEdited = new EventEmitter<{ row: TableRow; field: string; oldValue: any; newValue: any }>();
  @Output() onExpandButtonClick = new EventEmitter<void>();

  displayData: TableRow[] = [];
  selectedRows: TableRow[] = [];
  currentPage = 1;
  totalPages = 1;
  editingCell: { rowId: string; field: string } | null = null;
  tempEditValue: any = '';

  /**
   * Maps rowId -> RowNumbering
   */
  rowNumberingMap: { [key: string]: RowNumbering } = {};

  Math = Math;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.initializeData();
      this.updatePagination();
      this.cdr.markForCheck();
    }
  }

  private initializeData() {
    // Add unique row IDs if not present
    this.data = this.data.map((row, index) => ({
      ...row,
      _rowId: row._rowId || `row_${index}_${Date.now()}`,
      _selected: row._selected || false
    }));
    
    // Build simple row numbering
    this.buildSimpleRowNumbering();
    this.updateDisplayData();
  }

  /**
   * SIMPLE ROW NUMBERING LOGIC
   * 
   * Rules:
   * 1. Parent rows get sequential numbers: 1, 2, 3...
   * 2. Child rows get: 1, 2, 3... (reset for each parent)
   * 
   * No complex matching needed - just sequential numbering
   */
  private buildSimpleRowNumbering() {
    this.rowNumberingMap = {};
    let parentNumber = 0;
    let currentParentRowId: string | null = null;
    let childCounter = 0;

    for (const row of this.data) {
      const rowId = row._rowId || '';

      if (row.isParent === true) {
        // This is a parent row
        parentNumber++;
        currentParentRowId = rowId;
        childCounter = 0;

        this.rowNumberingMap[rowId] = {
          parentNum: parentNumber,
          childNum: 0
        };
      } else if (row.parentRow !== undefined && row.parentRow !== null && currentParentRowId) {
        // This is a child row (belongs to current parent)
        childCounter++;

        this.rowNumberingMap[rowId] = {
          parentNum: parentNumber,
          childNum: childCounter
        };
      }
    }
  }

  private updateDisplayData() {
    if (this.config.pagination) {
      const startIndex = (this.currentPage - 1) * (this.config.pageSize || 20);
      const endIndex = startIndex + (this.config.pageSize || 20);
      this.displayData = this.data.slice(startIndex, endIndex);
    } else {
      this.displayData = [...this.data];
    }
  }

  private updatePagination() {
    if (this.config.pagination) {
      this.totalPages = Math.ceil(this.data.length / (this.config.pageSize || 20));
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages;
        this.updateDisplayData();
      }
    }
  }

  // ==================== SELECTION ====================

  toggleRowSelection(row: TableRow) {
    // Find the row in the main data array
    const dataRow = this.data.find(r => r._rowId === row._rowId);
    
    if (dataRow) {
      // Toggle the selection on the main data row
      dataRow._selected = !dataRow._selected;
      
      // Update the display row reference too
      const displayRow = this.displayData.find(r => r._rowId === row._rowId);
      if (displayRow) {
        displayRow._selected = dataRow._selected;
      }
    }
    
    this.updateSelectedRows();
    this.cdr.markForCheck();
  }

  private updateSelectedRows() {
    // Get all selected rows from main data array
    this.selectedRows = this.data.filter(row => row._selected === true);
    this.rowsSelected.emit(this.selectedRows);
  }

  clearSelection() {
    this.data.forEach(row => row._selected = false);
    this.displayData.forEach(row => row._selected = false);
    this.selectedRows = [];
    this.rowsSelected.emit([]);
    this.cdr.markForCheck();
  }

  isRowSelected(row: TableRow): boolean {
    return row._selected === true;
  }

  // ==================== EDITING ====================

  startEdit(row: TableRow, field: string) {
    if (!this.config.editable) return;
    
    const column = this.columns.find(col => col.field === field);
    if (!column || column.editable === false) return;

    this.editingCell = { rowId: row._rowId!, field };
    this.tempEditValue = row[field];
    this.cdr.markForCheck();
  }

  saveEdit(row: TableRow, field: string) {
    if (!this.editingCell) return;

    const oldValue = row[field];
    const newValue = this.tempEditValue;

    if (oldValue !== newValue) {
      row[field] = newValue;
      
      const dataRow = this.data.find(r => r._rowId === row._rowId);
      if (dataRow) {
        dataRow[field] = newValue;
      }

      this.cellEdited.emit({ row, field, oldValue, newValue });
      this.dataChanged.emit(this.data);
    }

    this.editingCell = null;
    this.tempEditValue = '';
    this.cdr.markForCheck();
  }

  cancelEdit() {
    this.editingCell = null;
    this.tempEditValue = '';
    this.cdr.markForCheck();
  }

  isEditing(row: TableRow, field: string): boolean {
    return this.editingCell !== null && 
           this.editingCell.rowId === row._rowId && 
           this.editingCell.field === field;
  }

  onKeyDown(event: KeyboardEvent, row: TableRow, field: string) {
    if (event.key === 'Enter') {
      this.saveEdit(row, field);
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  // ==================== ROW OPERATIONS ====================

  addNewRow() {
    if (!this.config.editable) return;

    const newRow: TableRow = {
      _rowId: `row_new_${Date.now()}`,
      _selected: false
    };

    this.columns.forEach(col => {
      if (col.field !== 'select' && col.field !== 'rowNumber') {
        newRow[col.field] = '';
      }
    });

    this.data.unshift(newRow);
    this.buildSimpleRowNumbering();
    this.updatePagination();
    this.updateDisplayData();
    this.dataChanged.emit(this.data);

    this.messageService.add({
      severity: 'success',
      summary: 'Row Added',
      detail: 'New row added to the table'
    });
    
    this.cdr.markForCheck();
  }

  deleteSelectedRows() {
    if (this.selectedRows.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Selection',
        detail: 'Please select rows to delete'
      });
      return;
    }

    const rowsToDelete = new Set<string>();
    
    this.selectedRows.forEach(selectedRow => {
      rowsToDelete.add(selectedRow._rowId!);
      
      if (selectedRow['isParent']) {
        this.findAndMarkChildren(selectedRow, rowsToDelete);
      }
    });

    this.data = this.data.filter(row => !rowsToDelete.has(row._rowId!));
    
    this.clearSelection();
    this.buildSimpleRowNumbering();
    this.updatePagination();
    this.updateDisplayData();
    this.dataChanged.emit(this.data);

    this.messageService.add({
      severity: 'success',
      summary: 'Deleted',
      detail: `${rowsToDelete.size} row(s) deleted successfully`
    });
    
    this.cdr.markForCheck();
  }

  private findAndMarkChildren(parentRow: TableRow, deleteSet: Set<string>) {
    const parentMessageId = parentRow['message_id'] || parentRow['messageId'] || parentRow['MESSAGE_ID'];
    const parentRowId = parentRow._rowId;
    
    this.data.forEach(row => {
      if ((row['parentRow'] === parentMessageId || row['parentRow'] === parentRowId) && row._rowId !== parentRowId) {
        deleteSet.add(row._rowId!);
        
        if (row['isParent']) {
          this.findAndMarkChildren(row, deleteSet);
        }
      }
    });
  }

  // ==================== PARENT/CHILD OPERATIONS ====================

  swapParentChild() {
    if (this.selectedRows.length !== 1) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Selection',
        detail: 'Please select exactly one row to swap'
      });
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Swap Operation',
      detail: 'Swap parent/child functionality - Implementation needed'
    });
  }

  assignAsParent() {
    if (this.selectedRows.length !== 1) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Selection',
        detail: 'Please select exactly one row'
      });
      return;
    }

    const row = this.selectedRows[0];
    const dataRow = this.data.find(r => r._rowId === row._rowId);
    
    if (dataRow) {
      dataRow['isParent'] = true;
      dataRow['parentRow'] = undefined;
      dataRow['childrenCount'] = (dataRow['childrenCount'] ?? 0);
      
      this.buildSimpleRowNumbering();
      this.updateDisplayData();
      this.dataChanged.emit(this.data);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Row assigned as parent'
      });
      
      this.cdr.markForCheck();
    }
  }

  saveSelectedRows() {
    if (this.selectedRows.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Selection',
        detail: 'Please select rows to save'
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Saved',
      detail: `${this.selectedRows.length} row(s) saved`
    });
    
    this.rowsSelected.emit(this.selectedRows);
  }

  // ==================== PAGINATION ====================

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayData();
      this.cdr.markForCheck();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayData();
      this.cdr.markForCheck();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayData();
      this.cdr.markForCheck();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // ==================== EXPORT ====================

  getExportLabel(): string {
    return this.selectedRows.length > 0 
      ? `Export Selected (${this.selectedRows.length})` 
      : 'Export All';
  }

  exportToCSV() {
    const dataToExport = this.selectedRows.length > 0 ? this.selectedRows : this.data;
    
    if (dataToExport.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'No data to export'
      });
      return;
    }

    const headers = this.columns
      .filter(col => col.field !== 'select')
      .map(col => col.header);
    
    const fields = this.columns
      .filter(col => col.field !== 'select')
      .map(col => col.field);

    let csv = headers.join(',') + '\n';
    
    dataToExport.forEach(row => {
      const values = fields.map(field => {
        let value = row[field] || '';
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Exported',
      detail: `${dataToExport.length} row(s) exported to CSV`
    });
  }

  // ==================== HELPERS ====================

  /**
   * Get display row number
   * 
   * Parent row: Shows parent number (1, 2, 3...)
   * Child row: Shows child number (1, 2, 3... resets per parent)
   */
  getDisplayRowNumber(row: TableRow): string {
    const rowId = row._rowId;
    if (!rowId || !this.rowNumberingMap[rowId]) {
      return '0';
    }

    const numbering = this.rowNumberingMap[rowId];
    
    // If parent, show parent number; if child, show child number
    if (row.isParent === true) {
      return numbering.parentNum.toString();
    } else {
      return numbering.childNum.toString();
    }
  }

  trackByRowId(index: number, row: TableRow): string {
    return row._rowId || `${index}`;
  }

  isChildRow(row: TableRow): boolean {
    return row.isParent !== true && !!row.parentRow;
  }

  isParentRow(row: TableRow): boolean {
    return row.isParent === true;
  }
}