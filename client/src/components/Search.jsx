import React, { useState } from "react";

function Search() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search posters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              Search
            </button>
          </div>
          {/* Search results would go here */}
        </div>
      </div>
    </div>
  );
}

export default Search;