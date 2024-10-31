import { useState, useEffect } from "react";
import classNames from "./App.module.css";
import { Table } from "./components";


const types = {
  number: "number",
  title: "text",
  releaseDate: "date",
  productionBudget: "money",
  worldwideBoxOffice: "money",
};

function App() {

//NOTE: Since we don't have a backend. I intend to do an HTTP call to fetch the data from the file just to mock a real world server data fetch scenario.
//Serving from public folder.
//CAUTION: It is not recommended to place data in the public folder but I have to do a demo and this seems a viable shortcut.
const [tableData, setTableData] = useState({
    columns: [],
    rows: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setTableData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setError('Failed to load data');
        setIsLoading(false);
      });
  }, []);

  //IMPROVEMENT: Use React Suspend
  if (isLoading) {
    return <div>Loading...</div>;
  }

 //IMPROVEMENT: Use React Error boundaries
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={classNames.app}>
      <Table
        columns={tableData.columns}
        rows={tableData.rows}
        types={types}
        initialSortColumn="number"
        initialSortDirection="ascending"
      />
    </div>
  );
}

export default App;
