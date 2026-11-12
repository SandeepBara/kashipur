import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CommonTable({
  data = [],
  headers = [],
  renderRow,
  footerRow=null,
  summaryData=null,
  title = "List",
  actionButton,
  itemsPerPage = 10,
  totalPages = 1,
  currentPage = 1,
  totalItem = 1,
  fetchAllData = () => [],
  setPageNo = () => {},
  setItemsPerPage = () => {},
  isSearchInput = true,
  search = "",
  setSearch = () => {},
  onSearch = () => {},
  filterComponent = null,
  links = null,
  isPaginator = true,
}) {
  const [searchInput, setSearchInput] = useState(search);
  const [filteredData, setFilteredData] = useState(data);
  const [isExcelExporting, setIsExcelExporting] = useState(false);
  const [isPDFExporting, setIsPDFExporting] = useState(false);

  useEffect(() => {
    const keyword = searchInput.toLowerCase();
    const filtered = data.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" && value.toLowerCase().includes(keyword)
      )
    );
    setFilteredData(filtered);
  }, [searchInput, data]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setPageNo(page);
    }
  };

  const handleSearchClick = () => {
    setSearch(searchInput);
    setPageNo(1);
    onSearch(); // trigger server-side fetch
  };

  const renderPaginationButtons = () => {
    const pages = [];
    const visiblePages = 3;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > visiblePages) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - visiblePages + 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((page, idx) =>
      page === "..." ? (
        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-500">
          ...
        </span>
      ) : (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-2 py-1 rounded ${
            currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          {page}
        </button>
      )
    );
  };

  const exportToExcel = async () => {
    setIsExcelExporting(true);
    try {
      const allData = fetchAllData ? await fetchAllData() : data;

      const worksheetData = [
        headers.map((h) => h.label),
        ...allData.map((item, idx) =>
          headers.map((h) => (h.key === "serial" ? idx + 1 : item[h.key] ?? ""))
        ),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, `${title.replace(/\s+/g, "_")}.xlsx`);
    } catch (error) {
      console.error("Excel export failed:", error);
    } finally {
      setIsExcelExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsPDFExporting(true);
    try {
      const allData = fetchAllData ? await fetchAllData() : data;
      const doc = new jsPDF();
      doc.text(title, 14, 10);
      autoTable(doc, {
        startY: 20,
        head: [headers.map((h) => h.label)],
        body: allData.map((item, idx) =>
          headers.map((h) => (h.key === "serial" ? idx + 1 : item[h.key] ?? ""))
        ),
        styles: { fontSize: 8 },
      });
      doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsPDFExporting(false);
    }
  };
  return (
    <div className="swm-page-card bg-white shadow-md p-3 sm:p-5 border rounded-xl min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="font-semibold text-lg sm:text-xl text-slate-800">{title}</h2>
        {actionButton}
      </div>

      {filterComponent && <div className="mb-4">{filterComponent}</div>}

      {/* Search & Export */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg text-white text-sm font-semibold"
            onClick={exportToExcel}
            disabled={isExcelExporting}
          >
            {isExcelExporting && (
              <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
            )}
            Excel
          </button>

          <button
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 px-3 py-2 rounded-lg text-white text-sm font-semibold"
            onClick={exportToPDF}
            disabled={isPDFExporting}
          >
            {isPDFExporting && (
              <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
            )}
            PDF
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto w-full lg:w-auto lg:min-w-[min(100%,22rem)]">
          {isSearchInput && (
            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 border rounded-lg w-full min-w-0"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          )}
          <button
            onClick={handleSearchClick}
            className="bg-teal-700 hover:bg-teal-800 px-4 py-2 rounded-lg text-white text-sm font-semibold whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {/* Items per page */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4 text-sm">
        {isPaginator&&(
          <div className="flex items-center space-x-2">
            <span>Show</span>
            <select
              className="px-2 py-1 border rounded"
              value={itemsPerPage === totalItem ? "-1" : itemsPerPage}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value === "-1" ? totalItem : Number(value);
                setItemsPerPage(numValue);
                setPageNo(1);
              }}
            >
              {[10, 25, 50, 100, 500,1000].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
              <option value="-1">All</option>
            </select>
            <span>items per page</span>
          </div>
        )}
        {links && (
          <div className="flex justify-end items-center gap-2 ml-auto w-full md:w-1/3">
            {links}
          </div>
        )}
      </div>

      {summaryData &&(
        <div className="bg-gray-200 shadow-lg rounded-md mt-3 py-3 px-3 w-auto">
          {summaryData} 
        </div>
      )}
      {/* Table */}
      <div className="relative max-h-[min(65vh,680px)] mt-4 border border-slate-200 rounded-xl overflow-x-auto overflow-y-auto scrollbar-hide">
        <table className="bg-white min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              {headers.map((header, i) => (
                <th key={i} className="px-3 py-2 bg-gray-100 border sticky top-0">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) =>
                renderRow(item, index, currentPage, itemsPerPage)
              )
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="py-4 border text-gray-500 text-center"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
          {footerRow && (
            <tfoot className="sticky bottom-0">
              {footerRow}
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      {isPaginator&&(
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4 text-sm">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-200 disabled:opacity-50 px-2 py-1 rounded"
            >
              Prev
            </button>

            {renderPaginationButtons()}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-200 disabled:opacity-50 px-2 py-1 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
