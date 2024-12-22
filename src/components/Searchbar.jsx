import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineDelete } from "react-icons/ai";

import InstituteServices from "../../services/InstituteServices";
import ProfessorServices from "../../services/ProfessorServices";
import SearchHistoryServices from "../../services/SearchHistoryServices";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Searchbar = ({ setErrorMessage, user }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchType, setSearchType] = useState("institutes");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [searchHistory, setSearchHistory] = useState({ institutes: [], professors: [] });
  const [noResults, setNoResults] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchAllData = useCallback(async () => {
    try {
      const promises = [
        InstituteServices.indexInstitutes({}),
        ProfessorServices.indexProfessors({})
      ];

      if (user) {
        promises.push(SearchHistoryServices.getAllInstitutesSearchHistory());
        promises.push(SearchHistoryServices.getAllProfessorsSearchHistory());
      }

      const [instituteResponse, professorResponse, instituteHistory, professorHistory] = await Promise.all(promises);

      if (!instituteResponse.error) {
        setInstitutes(instituteResponse.institutions);
      }

      if (professorResponse.professorsData && Array.isArray(professorResponse.professorsData)) {
        setProfessors(professorResponse.professorsData);
      }

      if (user) {
        setSearchHistory({
          institutes: instituteHistory?.institutionHistory || [],
          professors: professorHistory?.professorHistory || []
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);


  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const debouncedQuery = useDebounce(query, 500);

  const filteredSuggestions = useMemo(() => {
    if (debouncedQuery.length > 2) {
      return searchType === "institutes"
        ? institutes.filter(inst => inst.name.toLowerCase().includes(debouncedQuery.toLowerCase())).map(inst => inst.name)
        : professors.filter(prof => `${prof.firstName} ${prof.lastName}`.toLowerCase().includes(debouncedQuery.toLowerCase())).map(prof => `${prof.firstName} ${prof.lastName}`);
    }

    return [];
  }, [debouncedQuery, searchType, institutes, professors]);

  useEffect(() => {
    setSuggestions(filteredSuggestions);
    setNoResults(filteredSuggestions.length === 0 && query.trim().length > 0);
  }, [filteredSuggestions, query]);

  const handleSearch = () => {
    if (query.trim()) {
      setIsSearchActive(false);
      navigate(`/${searchType}?name=${query.trim()}`);
      addSearchHistory(query.trim());
    }
  };

  const addSearchHistory = async (searchText) => {

    try {
      if (user) {
        let searchTermId = null;

        if (searchType === "institutes") {
          const matchingInstitute = institutes.find(inst => inst.name.toLowerCase() === searchText.toLowerCase());
          if (matchingInstitute) searchTermId = matchingInstitute._id;
          await SearchHistoryServices.addInstituteSearchHistory({ text: searchText, institutionId: searchTermId });
        } else if (searchType === "professors") {
          const matchingProfessor = professors.find(prof => `${prof.firstName} ${prof.lastName}`.toLowerCase() === searchText.toLowerCase());
          if (matchingProfessor) searchTermId = matchingProfessor._id;
          await SearchHistoryServices.addProfessorSearchHistory({ text: searchText, professorId: searchTermId });
        }

        fetchSearchHistory();
      }
    } catch (error) {
      console.error("Error adding to search history:", error);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      if (user) {
        const [instituteHistoryResponse, professorHistoryResponse] = await Promise.all([
          SearchHistoryServices.getAllInstitutesSearchHistory(),
          SearchHistoryServices.getAllProfessorsSearchHistory()
        ]);
        setSearchHistory({
          institutes: instituteHistoryResponse.institutionHistory || [],
          professors: professorHistoryResponse.professorHistory || []
        });
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const handleDeleteHistory = async (item, type) => {
    try {
      if (type === "institutes") {
        await SearchHistoryServices.deleteInstituteSearchHistory(item.searchText);
      } else if (type === "professors") {
        await SearchHistoryServices.deleteProfessorSearchHistory(item.searchText);
      }

      const updatedHistory = { ...searchHistory };
      if (type === "institutes") {
        updatedHistory.institutes = updatedHistory.institutes.filter(history => history.searchText !== item.searchText);
      } else if (type === "professors") {
        updatedHistory.professors = updatedHistory.professors.filter(history => history.searchText !== item.searchText);
      }
      setSearchHistory(updatedHistory);
    } catch (error) {
      console.error("Error deleting search history:", error);
    }
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setIsSearchActive(true);
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setQuery("");
    setSuggestions([]);
    setNoResults(false);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setNoResults(false);
    setIsSearchActive(false);
    setErrorMessage('');
    navigate(location.pathname === "/" ? "/" : `/${searchType}`);
    fetchSearchHistory();
  };

  const handleBlur = (e) => {
    setTimeout(() => {
      if (!e.relatedTarget || !e.relatedTarget.closest(".suggestions-list")) {
        setIsSearchActive(false);
      }
    }, 300);
  };

  const getSearchHistorySuggestions = () => {
    if (query === "") {
      const historyData = searchType === "institutes" ? searchHistory.institutes : searchHistory.professors;
      if (historyData.length === 0) {
        setIsSearchActive(false);
        return [];
      }
      return historyData.map(history => (
        <div key={history._id} className="flex justify-between items-center">
          <span>{history.searchText}</span>
          <button onClick={() => handleDeleteHistory(history, searchType)} className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none">
            <AiOutlineDelete className="mr-2" />
          </button>
        </div>
      ));
    }
    return [];
  };

  const handleSuggestionClick = (e, suggestion) => {
    if (e.target.closest("button")) {
      return;
    }

    setIsSearchActive(false);
    const searchText = suggestion?.props ? suggestion.props.children[0].props.children : suggestion;
    setQuery(searchText);
    setSuggestions([]);
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
          autoComplete="off"
        />

        <select onChange={handleSearchTypeChange} value={searchType} className="sm:text-sm/6 w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-focus:ring-indigo-500 focus:border-indigo-900">
          <option value="institutes">Institutes</option>
          <option value="professors">Professors</option>
        </select>

        <button onClick={handleSearch} className="text-sm font-medium rounded-full py-2 px-4">Search</button>
        <button onClick={handleClear} className="text-sm font-medium rounded-full py-2 px-4">Clear</button>

        {(isSearchActive) && (
          <ul className="absolute mt-3 border border-gray-300 rounded-md max-h-48 overflow-y-auto w-full bg-white z-10 top-full left-0 suggestions-list text-sm">
            {(query === "" ? getSearchHistorySuggestions() : filteredSuggestions).slice(0, 5).map((suggestion, index) => (
              <li key={index} onClick={(e) => handleSuggestionClick(e, suggestion)} className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-left">
                {suggestion}
              </li>
            ))}
          </ul>
        )}

        {isSearchActive && noResults && (
          <div className="absolute mt-3 text-sm text-gray-500 w-full bg-white z-10 top-full left-0 border border-gray-300 p-2">
            No available results
          </div>
        )}
      </div>
    </div>
  );
};

export default Searchbar;
