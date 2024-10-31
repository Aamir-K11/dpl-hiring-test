import { useState } from "react";
import classNames from "./Table.module.css";
import ascendingSVG from "./order-ascending.svg"
import descendingSVG from "./order-descending.svg"

//IMPROVEMENT: Place these two funcs in a different folder maybe ./util but YOLO. This is a hiring test afterall
function createSortConfig(columns, id, defaultSort) {
  return columns.map(column => ({
    ...column,
    activeSortColumn: column.id === id,
    order: defaultSort
  }));
}

function getOrderSVG(sortColumnConfig, id, handler) {
  const selectedColumn = sortColumnConfig.find(config => config.id === id);

  return (
    <img
      src={selectedColumn.order === "ascending" ? ascendingSVG : descendingSVG}
      onClick={() => handler(id)}
      alt="Sort Icon"
    />
  );
}


const Table = ({ columns, rows, types, initialSortColumn = "number", initialSortDirection="ascending" }) => {

  const [sortColumnConfig, setSortColumnConfig] = useState(() => createSortConfig(columns, initialSortColumn, initialSortDirection));
  const [filterValues, setFilterValues] = useState({});


  //IMPROVEMENT: I have to think harder to use custom hooks to get most of the logic out of the component.
  const handleSort = (id) => {
    setSortColumnConfig(prev =>
      prev.map(i => {
        if (i.id === id) {
          return {
            ...i,
            order: i.order === "ascending" ? "descending" : "ascending",
            activeSortColumn: true
          };
        } else {
          return { ...i, activeSortColumn: false };
        }
      })
    );
  };

   const handleFilterChange = (columnId, value) => {
    setFilterValues(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const getRows = () => {
    if (Object.keys(filterValues).length === 0) return rows;

    return rows.filter(row => {
      return Object.entries(filterValues).every(([columnId, filterValue]) => {
        if (!filterValue) return true;
        
        const cellValue = String(row[columnId]).toLowerCase();
        const searchValue = filterValue.toLowerCase();
        
        switch (types[columnId]) {
          case 'number':
          case 'money':
            const num = Number(cellValue);
            const searchNum = Number(searchValue);
            if (isNaN(searchNum)) return true;
            return num === searchNum;
          
          case 'date':
            return cellValue.includes(searchValue);
          
          default:
            return cellValue.includes(searchValue);
        }
      });
    });
  };

  const getSortedRows = () => {
    const filteredRows = getRows();
    const activeColumn = sortColumnConfig.find(config => config.activeSortColumn);
    if (!activeColumn) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aValue = a[activeColumn.id];
      const bValue = b[activeColumn.id];
      const direction = activeColumn.order === "ascending" ? 1 : -1;

      switch (types[activeColumn.id]) {
        case "number":
        case "money":
          return (Number(aValue) - Number(bValue)) * direction;
        case "date":
          return (new Date(aValue) - new Date(bValue)) * direction;
        default:
          return String(aValue).localeCompare(String(bValue)) * direction;
      }
    });
  };

  return (
    <table title="Movies" className={classNames.table}>
      <thead>
        <tr>
          {columns.map(({ id, title }) => (
            <th key={id}>{title}
            <input
              value={filterValues[id] || ''}
              onChange={(e) => handleFilterChange(id, e.target.value)}
              placeholder={`Filter ${title}`}
            />
            {getOrderSVG(sortColumnConfig, id, handleSort)}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {getSortedRows().map((row, index) => (
          <tr key={index}>
            {columns.map(({ id }) => (
              <td
                data-testid={`row-${index}-${id}`}
                className={classNames[`cell-type-${types[id]}`]}
                key={id}
              >
                {row[id]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
