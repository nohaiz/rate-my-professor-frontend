import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InstituteServices from "../../services/InstituteServices";
import ProfessorServices from "../../services/ProfessorServices";

const Searchbar = ({ submittedSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchType, setSearchType] = useState("institutes");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length > 2) {
      const fetchSuggestions = async () => {
        try {
          let response;

          if (searchType === "institutes") {
            response = await InstituteServices.indexInstitutes({ name: query });

            const instituteSuggestions = response.institutions.filter(inst =>
              inst.name.toLowerCase().includes(query.toLowerCase())
            ).map(inst => inst.name);

            setSuggestions(instituteSuggestions);
          } else if (searchType === "professors") {
            response = await ProfessorServices.indexProfessors({ name: query });

            if (response.professorsData && Array.isArray(response.professorsData)) {
              const professorSuggestions = response.professorsData.filter(prof =>
                `${prof.firstName} ${prof.lastName}`.toLowerCase().includes(query.toLowerCase())
              ).map(prof => `${prof.firstName} ${prof.lastName}`);

              setSuggestions(professorSuggestions);
            } else {
              setSuggestions([]);
            }
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query, searchType]);

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/${searchType}?name=${query.trim()}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setIsSearchActive(false);
    setSuggestions([]);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setIsSearchActive(true);
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setQuery("");
    setSuggestions([]);
  };

  const handleBlur = () => {
    if (!query) {
      setIsSearchActive(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 flex flex-col items-center">
      <div>
        <label htmlFor={searchType} className="block text-lg font-semibold text-gray-700">
          {searchType === 'institutes' ? 'Enter your school to get started' : 'Find a professor'}
        </label>
      </div>

      <div className="relative w-full md:w-2/3 flex justify-center gap-4">
        <input
          id={searchType}
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setIsSearchActive(true)}
          onBlur={handleBlur}
          className="sm:text-sm/6 w-full px-3 py-2 border border-gray-300 rounded-md shadow-focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={`Search ${searchType.charAt(0).toUpperCase() + searchType.slice(1)} Name`}
        />

        <select
          onChange={handleSearchTypeChange}
          value={searchType}
          className="sm:text-sm/6 w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-focus:ring-indigo-500 focus:border-indigo-900"
        >
          <option value="institutes">Institutes</option>
          <option value="professors">Professors</option>
        </select>

        <button
          onClick={handleSearch}
          className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-8 hover:bg-indigo-600"
        >
          Search
        </button>

        {isSearchActive && suggestions.length > 0 && (
          <ul className="absolute mt-3 border border-gray-300 rounded-md max-h-48 overflow-y-auto w-full bg-white z-10 top-full left-0">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 cursor-pointer hover:bg-indigo-100 text-left"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Searchbar;
