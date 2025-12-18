// components/common/DataTable/DataTable.jsx
import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import styles from './DataTable.module.css'

const DataTable = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = "No data available",
  keyExtractor,
  onRowClick 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const renderHeader = () => (
    <thead className={styles.tableHeader}>
      <tr>
        {columns.map((column) => (
          <th 
            key={column.key}
            style={{ width: column.width }}
            className={`${column.sortable ? styles.sortable : ''} ${
              sortConfig.key === column.key ? styles.sorted : ''
            }`}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <div className={styles.headerContent}>
              <span>{column.label}</span>
              {column.sortable && (
                <div className={styles.sortIcons}>
                  <ChevronUp 
                    size={14} 
                    className={`${styles.sortIcon} ${
                      sortConfig.key === column.key && sortConfig.direction === 'asc' 
                        ? styles.active 
                        : ''
                    }`}
                  />
                  <ChevronDown 
                    size={14} 
                    className={`${styles.sortIcon} ${
                      sortConfig.key === column.key && sortConfig.direction === 'desc' 
                        ? styles.active 
                        : ''
                    }`}
                  />
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )

  const renderBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className={styles.loadingCell}>
              <Loader2 size={24} className={styles.spinner} />
              <span>Loading data...</span>
            </td>
          </tr>
        </tbody>
      )
    }

    if (paginatedData.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className={styles.emptyCell}>
              <div className={styles.emptyState}>
                <span>{emptyMessage}</span>
              </div>
            </td>
          </tr>
        </tbody>
      )
    }

    return (
      <tbody className={styles.tableBody}>
        {paginatedData.map((item, index) => (
          <tr 
            key={keyExtractor ? keyExtractor(item) : index}
            className={onRowClick ? styles.clickableRow : ''}
            onClick={() => onRowClick && onRowClick(item)}
          >
            {columns.map((column) => (
              <td key={column.key} style={{ width: column.width }}>
                {column.render ? column.render(item) : item[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    )
  }

  const renderPagination = () => {
    if (sortedData.length <= itemsPerPage) return null

    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, sortedData.length)} of{' '}
          {sortedData.length} entries
        </div>

        <div className={styles.paginationControls}>
          <select 
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e.target.value)}
            className={styles.pageSizeSelect}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>

          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            First
          </button>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>

          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`${styles.paginationButton} ${
                currentPage === number ? styles.active : ''
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Last
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dataTable}>
      <div className={styles.tableContainer}>
        <table className={styles.table} style={{"overflowX": "auto"}}>
          {renderHeader()}
          {renderBody()}
        </table>
      </div>
      
      {renderPagination()}
    </div>
  )
}

export default DataTable