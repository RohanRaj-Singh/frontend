import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

export interface FilterCondition {
  column: string;
  operator: string;
  values: string;
  logicalOperator: 'AND' | 'OR';
}

export interface FilterSubgroup {
  id: number;
  logicalOperator: 'AND' | 'OR';
  conditions: FilterCondition[];
}

@Component({
  selector: 'app-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.css']
})
export class FilterDialogComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() filtersApplied = new EventEmitter<{
    conditions: FilterCondition[];
    subgroups: FilterSubgroup[];
  }>();

  // Filter data
  filterConditions: FilterCondition[] = [];
  filterSubgroups: FilterSubgroup[] = [];

  // Options
  columnOptions = [
    'Bwic Cover',
    'Ticker',
    'CUSIP',
    'Bias',
    'Date',
    'Source',
    'Sector',
    'Rank',
    'Price'
  ];

  operatorOptions = [
    { label: 'Equal to', value: 'eq' },
    { label: 'Not equal to', value: 'neq' },
    { label: 'Contains', value: 'contains' },
    { label: 'Starts with', value: 'startsWith' },
    { label: 'Ends with', value: 'endsWith' },
    { label: 'Greater than', value: 'gt' },
    { label: 'Less than', value: 'lt' }
  ];

  logicalOperators = [
    { label: 'AND', value: 'AND' },
    { label: 'OR', value: 'OR' }
  ];

  ngOnInit() {
    // Initialize with one condition
    if (this.filterConditions.length === 0) {
      this.addCondition();
    }
  }

  // ==================== MAIN CONDITIONS ====================

  addCondition() {
    this.filterConditions.push({
      column: '',
      operator: '',
      values: '',
      logicalOperator: 'AND'
    });
  }

  removeCondition(index: number) {
    this.filterConditions.splice(index, 1);
    if (this.filterConditions.length === 0) {
      this.addCondition();
    }
  }

  // ==================== SUBGROUPS ====================

  addSubgroup() {
    this.filterSubgroups.push({
      id: Date.now(),
      logicalOperator: 'AND',
      conditions: [{
        column: '',
        operator: '',
        values: '',
        logicalOperator: 'AND'
      }]
    });
  }

  removeSubgroup(subgroupId: number) {
    const index = this.filterSubgroups.findIndex(s => s.id === subgroupId);
    if (index > -1) {
      this.filterSubgroups.splice(index, 1);
    }
  }

  addSubgroupCondition(subgroupId: number) {
    const subgroup = this.filterSubgroups.find(s => s.id === subgroupId);
    if (subgroup) {
      subgroup.conditions.push({
        column: '',
        operator: '',
        values: '',
        logicalOperator: 'AND'
      });
    }
  }

  removeSubgroupCondition(subgroupId: number, conditionIndex: number) {
    const subgroup = this.filterSubgroups.find(s => s.id === subgroupId);
    if (subgroup) {
      subgroup.conditions.splice(conditionIndex, 1);
      if (subgroup.conditions.length === 0) {
        this.removeSubgroup(subgroupId);
      }
    }
  }

  // ==================== ACTIONS ====================

  removeAllFilters() {
    this.filterConditions = [];
    this.filterSubgroups = [];
    this.addCondition();
  }

  applyFilters() {
    const filters = {
      conditions: this.filterConditions,
      subgroups: this.filterSubgroups
    };
    
    this.filtersApplied.emit(filters);
    this.closeDialog();
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // ==================== HELPERS ====================

  getOperatorLabel(value: string): string {
    const operator = this.operatorOptions.find(op => op.value === value);
    return operator ? operator.label : value;
  }
}