/**
 * DataTable Component
 * Reusable data table with sorting, filtering, and pagination
 */

import React, { useState, useMemo } from 'react';

const DataTable = ({
  columns,
  data,
  keyField = 'id',
  showSearch = true,
  showPagination = true,
  pageSize = 10,
  onRowClick = null,
  actions = null,
  sortable = true,
  emptyMessage = 'No data available'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row => {
      return columns.some(column => {
        const value = row[column.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      
      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = (columnKey) => {
    if (!sortable) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Handle page change
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortColumn !== columnKey) return <i className="fas fa-sort"></i>;
    return sortDirection === 'asc' ? <i className="fas fa-sort-up"></i> : <i className="fas fa-sort-down"></i>;
  };

  return (
    <div className="data-table-container">
      {/* Search Bar */}
      {showSearch && (
        <div className="table-toolbar">
          <div className="search-wrapper">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <div className="table-info">
            Showing {paginatedData.length} of {sortedData.length} entries
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ cursor: column.sortable !== false ? 'pointer' : 'default', width: column.width }}
                >
                  <div className="th-content">
                    {column.header}
                    {column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && <th className="actions-column">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr
                  key={row[keyField] || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                      {typeof actions === 'function' ? actions(row) : actions}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="empty-row">
                  <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="table-pagination">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            <i className="fas fa-angle-double-left"></i>
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            <i className="fas fa-angle-left"></i>
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            <i className="fas fa-angle-right"></i>
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            <i className="fas fa-angle-double-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;